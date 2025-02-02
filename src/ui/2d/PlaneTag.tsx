import './Plane.scss'
import { BoardState, FighterDirection, FighterPlane } from '../../core'
import classNames from 'classnames'
import { cellSize, ImageCacheContext, planeFrameCount } from './misc/image-caches'
import { useContext, useMemo, useRef } from 'react'
import { useAnimationFrame } from './misc/hooks'
import { BoardContext } from './BoardTag'

interface PlaneProps {
  plane: FighterPlane,
  notLayoutReady?: boolean,
}

function PlaneTag({plane, notLayoutReady}: PlaneProps) {
  const { planeCache } = useContext(ImageCacheContext)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shadowSizeRatio = {
    width: 0.02,
    height: 0.02,
  }
  const transformMap = {
    [FighterDirection.Up]: `translate(${plane.pos[0] * 20 - 40}%, ${plane.pos[1] * 25}%) scaleX(-1)`,
    [FighterDirection.Down]: `rotate(180deg) translate(${-plane.pos[0] * 20 + 40}%, ${-plane.pos[1] * 25 + 75}%)`,
    [FighterDirection.Left]: `rotate(-90deg) translate(${-plane.pos[1] * 20 + 30}%, ${plane.pos[0] * 25 - 12.5}%)`,
    [FighterDirection.Right]: `rotate(90deg) translate(${plane.pos[1] * 20 - 30}%, ${-plane.pos[0] * 25 + 87.5}%) scaleX(-1)`,
  }
  const transform = transformMap[plane.dir]
  const aniDuration = 300
  const msPerFrame = aniDuration / planeFrameCount
  const board = useContext(BoardContext)
  const isWatching = board.state === BoardState.Watching
  const frameIndexOffset = useMemo(() => Math.floor(Math.random() * planeFrameCount), [])

  useAnimationFrame(async (deltaTime, totalTime) => {
    await planeCache.waitForAllImages?.()
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const frameIndex = isWatching ? 0 : Math.floor(totalTime / msPerFrame + frameIndexOffset) % planeFrameCount
        const { cache, imageSize } = planeCache
        const shadowOffset = {
          x: canvas.width * shadowSizeRatio.width,
          y: canvas.height * shadowSizeRatio.height * (plane.dir === FighterDirection.Left || plane.dir === FighterDirection.Up ? 1 : -1),
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const prevComposite = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(cache, imageSize.width * frameIndex, 0, imageSize.width, imageSize.height, 0, shadowOffset.y, imageSize.width, imageSize.height)
        ctx.globalCompositeOperation = prevComposite
        ctx.drawImage(cache, imageSize.width * frameIndex, 0, imageSize.width, imageSize.height, shadowOffset.x, 0, imageSize.width, imageSize.height)
      }
    }
  }, msPerFrame)

  const tagClasses = classNames({
    'plane-moving': plane.moving,
    'plane-not-ready': !plane.isReady() || notLayoutReady,
    'sketch-plane': isWatching,
  })
  return (
    <div className={tagClasses} style={{
      transform,
    }}>
      <canvas ref={canvasRef} width={cellSize * 5 * (1 + shadowSizeRatio.width)} height={cellSize * 4 * (1 + shadowSizeRatio.height)} style={{
        width: `${(1 + shadowSizeRatio.width) * 100}%`,
        height: `${(1 + shadowSizeRatio.height) * 100}%`,
        transform: `translate(${-shadowSizeRatio.width * 100}%, 0%)`,
      }} />
    </div>
  )
}

export {
  PlaneTag,
  type PlaneProps,
}