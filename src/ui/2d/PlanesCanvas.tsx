import { useRef, useState } from "react";
import { Board, FighterPlane } from "../../core";

interface PlanesCanvasProps {
  board: Board,
}

const image = new Image()
image.src = '/images/2d/fighter-plane.svg'

function fillParent(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }
}

function drawPlane(plane: FighterPlane, layoutReadiness: boolean, ctx: CanvasRenderingContext2D, planeImage: HTMLImageElement, unit: number) {
  const [x, y] = plane.pos
  ctx.drawImage(planeImage, (x - 2) * unit, (y - 0) * unit, 5 * unit, 4 * unit)
}

function drawCanvas(canvas: HTMLCanvasElement, board: Board, planeImage: HTMLImageElement, ctx: CanvasRenderingContext2D) {
  const planeReadiness = board.getPlaneReadiness()
  board.planes.forEach(plane => {
    drawPlane(plane, planeReadiness[plane.toString()], ctx, planeImage, canvas.width / 10)
  })
  requestAnimationFrame(() => drawCanvas(canvas, board, planeImage, ctx))
}

function PlanesCanvas({board}: PlanesCanvasProps) {
  const [planeImage, setPlaneImage] = useState<HTMLImageElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)


  if (image.complete && !planeImage) {
    setPlaneImage(image)
  } else {
    image.addEventListener('load', () => {
      setPlaneImage(image)
    })
  }

  if (planeImage) {
    const canvas = canvasRef.current
    if (canvas) {
      fillParent(canvas)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawCanvas(canvas, board, planeImage, ctx)
      }
    }
  }

  return (
    <canvas 
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}></canvas>
  )
}

export {
  PlanesCanvas,
  type PlanesCanvasProps,
}