import { createContext } from "react"
import { Board } from "../../../core"

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const imagePath = '/images/2d/clips'
export const cellSize = Math.ceil(Math.min(screenWidth, screenHeight) / Math.min(Board.width, Board.height))
export const bodyExplosionFrameCount = 6
export const coreExplosionFrameCount = 7
export const planeFrameCount = 10

export type ImageCache = {
  cache: OffscreenCanvas
  waitForAllImages: () => Promise<OffscreenCanvas>
  imageSize: {
    width: number
    height: number
  }
}

function initExplosionCache(): ImageCache {
  const explosionMetas = [
    {
      file: 'explosions-body-full-{N}.svg',
      count: bodyExplosionFrameCount,
    },
    {
      file: 'explosions-core-full-{N}.svg',
      count: coreExplosionFrameCount,
    },
  ]
  const maxImageCount = Math.max(...explosionMetas.map(meta => meta.count))

  let count = explosionMetas.reduce((acc, meta) => acc + meta.count, 0)
  const cache = new OffscreenCanvas(cellSize * maxImageCount, cellSize * 2)
  const ctx = cache.getContext('2d')!;
  explosionMetas.forEach((meta, i) => {
    for (let j = 0; j < meta.count; j++) {
      const img = new Image();
      img.src = `${imagePath}/${meta.file.replace('{N}', String(j))}`;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width, img.height, j * cellSize, i * cellSize, cellSize, cellSize);
        count--
      }
    }
  })
  const ret = {
    cache,
    waitForAllImages: () => new Promise<OffscreenCanvas>(resolve => {
      if (count === 0) {
        resolve(cache)
      } else {
        setTimeout(() => ret.waitForAllImages?.().then(resolve), 100)
      }
    }),
    imageSize: {
      width: cellSize,
      height: cellSize,
    }
  }
  return ret;
}

function initPlaneCache(): ImageCache {
  const imageCount = planeFrameCount
  const planeSizeInCell = {
    width: 5,
    height: 4,
  }
  let count = imageCount
  const cache = new OffscreenCanvas(cellSize * planeSizeInCell.width * imageCount, cellSize * planeSizeInCell.height)
  const ctx = cache.getContext('2d')!;
  for (let i = 0; i < imageCount; i++) {
    const img = new Image();
    img.src = `${imagePath}/fighter-plane-${i}.svg`;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, cellSize * planeSizeInCell.width * i, 0, cellSize * planeSizeInCell.width, cellSize * planeSizeInCell.height);
      count--
    }
  }
  const ret = {
    cache,
    waitForAllImages: () => new Promise<OffscreenCanvas>(resolve => {
      if (count <= 0) {
        resolve(cache)
      } else {
        setTimeout(() => ret.waitForAllImages?.().then(resolve), 100)
      }
    }),
    imageSize: {
      width: cellSize * planeSizeInCell.width,
      height: cellSize * planeSizeInCell.height,
    },
  }
  return ret
}

// function initPlaneCache(): ImageCache {
//   const imageCount = planeFrameCount
//   const cellCount = 7
//   const rotations = [
//     0,
//     Math.PI / 2,
//     Math.PI,
//     Math.PI * 1.5,
//   ]
//   const planeSizeInCell = {
//     width: 5,
//     height: 4,
//   }
//   const translateOffset = {
//     x: cellSize * cellCount / 2,
//     y: cellSize * cellCount / 2,
//   }
//   const offset = {
//     x: -cellSize * planeSizeInCell.width / 2,
//     y: -cellSize / 2,
//   }
//   let count = imageCount
//   const cache = new OffscreenCanvas(cellSize * cellCount * imageCount, cellSize * cellCount * 4)
//   const ctx = cache.getContext('2d')!;
//   for (let i = 0; i < imageCount; i++) {
//     const img = new Image();
//     img.src = `${imagePath}/fighter-plane-${i}.svg`;
//     img.onload = () => {
//       ctx.translate(translateOffset.x + cellSize * cellCount * i, translateOffset.y)
//       rotations.forEach((rotation) => {
//         ctx.rotate(rotation)
//         ctx.drawImage(img, 0, 0, img.width, img.height, offset.x, offset.y, cellSize * planeSizeInCell.width, cellSize * planeSizeInCell.height);
//         ctx.rotate(-rotation)
//         ctx.translate(0, cellSize * cellCount)
//       })
//       ctx.translate(-(translateOffset.x + cellSize * cellCount * i), -translateOffset.y - cellSize * cellCount * rotations.length)
//       count--
//     }
//   }
//   const ret = {
//     cache,
//     waitForAllImages: () => new Promise<OffscreenCanvas>(resolve => {
//       if (count <= 0) {
//         resolve(cache)
//       } else {
//         setTimeout(() => ret.waitForAllImages?.().then(resolve), 100)
//       }
//     }),
//     imageSize: {
//       width: cellSize * cellCount,
//       height: cellSize * cellCount,
//     },
//   }
//   return ret
// }

const explosionCache = initExplosionCache()
const planeCache = initPlaneCache()


export type ImageCanvasRepository = {
  explosionCache: ImageCache
  planeCache: ImageCache
}

export const ImageCacheContext = createContext<ImageCanvasRepository>({
  explosionCache,
  planeCache,
})
