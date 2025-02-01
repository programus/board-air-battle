import './Board.scss'
import { Block, Board, BoardState, HittedType } from '../../core';
import { PlanesLayer } from './PlanesLayer';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { bodyExplosionFrameCount, cellSize, coreExplosionFrameCount, ImageCache, ImageCacheContext } from './misc/image-caches'
import { useAnimationFrame } from './misc/hooks'
import classNames from 'classnames'
import { createContext } from 'react'
import Rand from 'rand-seed'

type BlockDrawMeta = {
  block: Block,
  rotation: number,
  timeOffset: number,
}

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

const msPerFrame = Math.floor(1000 / 10)

function drawBlockFrame(ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, x: number, y: number) {
  const { block } = meta
  const state = block.owner.state
  const sx = state as number
  const isCovered = !block.isHitted() && (state > BoardState.Preparing)
  const sy = isCovered ? 1 : 0
  ctx.drawImage(cache.cache, sx * cellSize, sy * cellSize, cellSize, cellSize, x, y, cellSize, cellSize)
}

function drawAniExplosion(ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, totalTime: number) {
  const { block, timeOffset } = meta
  const index = block.hittedType === HittedType.PlaneBody ? 0 : 1
  const frameCount = block.hittedType === HittedType.PlaneBody ? bodyExplosionFrameCount : coreExplosionFrameCount
  const passedFrameCount = (totalTime + timeOffset) / msPerFrame
  const prevIndex = Math.floor(passedFrameCount - 1) % frameCount
  const nextAlpha = passedFrameCount - Math.floor(passedFrameCount)
  ctx.globalAlpha = 1 - nextAlpha
  ctx.drawImage(cache.cache, cellSize * prevIndex, index * cellSize, cellSize, cellSize, 0, 0, cellSize, cellSize)
  const frameIndex = Math.floor(passedFrameCount) % frameCount
  ctx.globalAlpha = 1
  ctx.drawImage(cache.cache, cellSize * frameIndex, index * cellSize, cellSize, cellSize, 0, 0, cellSize, cellSize)
  const nextIndex = Math.floor(passedFrameCount + 1) % frameCount
  ctx.globalAlpha = nextAlpha
  ctx.drawImage(cache.cache, cellSize * nextIndex, index * cellSize, cellSize, cellSize, 0, 0, cellSize, cellSize)
  ctx.globalAlpha = 1
}

function drawBodyExplosion(ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, totalTime: number) {
  drawAniExplosion(ctx, cache, meta, totalTime)
}

function drawCoreExplosion(ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, totalTime: number) {
  const { timeOffset } = meta
  const aniDuration = msPerFrame * coreExplosionFrameCount
  const passedCycles = (totalTime + timeOffset) / aniDuration
  const currentPartial = passedCycles - Math.floor(passedCycles)
  const fillStyle = ctx.createRadialGradient(cellSize / 2, cellSize / 2, 0, cellSize / 2, cellSize / 2, cellSize / 2 * (1 + currentPartial))
  fillStyle.addColorStop(0.4, '#ff9f7fb3')
  fillStyle.addColorStop(0.75, '#ffc87f00')
  ctx.fillStyle = fillStyle
  const alphaSplitter = [
    {start: 0, value: 0.2},
    {start: 0.2, value: 1},
    {start: 0.75, value: 1},
    {start: 1, value: 0.2},
  ]
  const alpha = alphaSplitter.reduce((acc, {start, value}, i, arr) => {
    if (currentPartial >= start) {
      const {start: nextStart, value: nextValue} = arr[i + 1]
      acc = value + (currentPartial - start) / (nextStart - start) * (nextValue - value)
    }
    return acc
  }, 0)
  ctx.globalAlpha = alpha
  ctx.fillRect(-cellSize / 2, -cellSize / 2, cellSize * 2, cellSize * 2)
  ctx.globalAlpha = 1

  drawAniExplosion(ctx, cache, meta, totalTime)
}

async function drawBlockExplosion(ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, x: number, y: number, totalTime: number) {
  const { block, rotation } = meta
  const needDraw = block.isHitted()
  const drawExplosion = (explosion: (ctx: CanvasContext, cache: ImageCache, meta: BlockDrawMeta, totalTime: number) => void) => {
    if (needDraw) {
      ctx.translate(x, y)
      ctx.translate(cellSize / 2, cellSize / 2)
      ctx.rotate(rotation)
      ctx.translate(-cellSize / 2, -cellSize / 2)
      explosion(ctx, cache, meta, totalTime)
      ctx.translate(cellSize / 2, cellSize / 2)
      ctx.rotate(-rotation)
      ctx.translate(-cellSize / 2, -cellSize / 2)
      ctx.translate(-x, -y)
    }
  }
  if (block.hittedType === HittedType.PlaneBody) {
    drawExplosion(drawBodyExplosion)
  } else if (block.hittedType === HittedType.PlaneCore) {
    drawExplosion(drawCoreExplosion)
  }
}

interface BoardProps {
  board: Board,
  width?: string,
  onUpdated?: () => void,
  turnCount?: number,
  name?: string,
}

const showExplosionStates = new Set([
  BoardState.Fighting,
  BoardState.Analyzing,
  BoardState.Watching,
  BoardState.Over,
])

const BoardContext = createContext<Board>(Board.allPossible[0])

function BoardTag({board, width, onUpdated, turnCount, name}: BoardProps) {
  const [update, setUpdate] = useState({})
  const forceUpdate = useCallback(() => {
    setUpdate({})
    onUpdated && onUpdated()
  }, [onUpdated])
  const { explosionCache, blockFrameCache } = useContext(ImageCacheContext)
  const frameCanvasRef = useRef<HTMLCanvasElement>(null)
  const explosionCanvasRef = useRef<HTMLCanvasElement>(null)

  const frameClass = classNames({
    'locked': board.isLocked,
  })
  const explosionClass = classNames({
    'top': true,
    'pointer-events-through': true,
  })
  const boardClass = useMemo(() => classNames({
    'board-frame': true,
    'main-board': true,
    'board-background': board.state !== BoardState.Watching,
    // 'cloud-background': board.state !== BoardState.Watching,
    'sketch-board': board.state === BoardState.Watching,
  }), [board.state])

  const rand = useMemo(() => new Rand(name || 'board'), [name])

  const blocks = board.blocks
  const blockMetas = useMemo(() => {
    return blocks.map((row) => row.map((block) => ({
      block: block,
      rotation: rand.next() * 2 * Math.PI,
      timeOffset: rand.next() * 1000,
    })))
  }, [blocks, rand])

  useAnimationFrame(async (deltaTime, totalTime) => {
    const canvas = explosionCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      await explosionCache.waitForAllImages?.()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      blockMetas.forEach((row, i) => {
        row.forEach((meta, j) => {
          const x = j * cellSize
          const y = i * cellSize
          if (meta.block.isHitted()) {
            drawBlockExplosion(ctx, explosionCache, meta, x, y, totalTime)
          }
        })
      })
    }
  }, msPerFrame * 1)

  useEffect(() => {
    (async () => {
      const canvas = frameCanvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        await explosionCache.waitForAllImages?.()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        blockMetas.forEach((row, i) => {
          row.forEach((meta, j) => {
            const x = j * cellSize
            const y = i * cellSize
            drawBlockFrame(ctx, blockFrameCache, meta, x, y)
          })
        })
      }
    })()
  }, [blockMetas, explosionCache, blockFrameCache, turnCount, update])

  return (
    <div className={boardClass} style={{
      width,
    }}>
      <BoardContext.Provider value={board}>
        <div className='board'>
          {
            showExplosionStates.has(board.state) ? (
              <canvas className={explosionClass} ref={explosionCanvasRef} width={cellSize * Board.width} height={cellSize * Board.height} />
            ) : undefined
          }
          <canvas className={frameClass} ref={frameCanvasRef} width={cellSize * Board.width} height={cellSize * Board.height} />
        </div>
        <PlanesLayer board={board} onUpdated={forceUpdate} />
      </BoardContext.Provider>
    </div>
  )
}

export {
  BoardContext,
  BoardTag,
  type BoardProps,
}