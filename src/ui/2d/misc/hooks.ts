import { useCallback, useEffect, useRef } from "react"

const useAnimationFrame = (callback: (deltaTime: number, totalTime: number) => void, interval: number = 0) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback((time: number) => {
    const deltaTime = previousTimeRef.current ? time - previousTimeRef.current : 0
    const timeBeforeCallback = new Date().getTime()
    callback(deltaTime, time)
    const callbackTime = new Date().getTime() - timeBeforeCallback

    previousTimeRef.current = time
    const remainTime = interval - callbackTime
    if (remainTime > 0) {
      setTimeout(() => {
        requestRef.current = requestAnimationFrame(animate)
      }, remainTime)
    } else {
      requestRef.current = requestAnimationFrame(animate)
    }
  }, [callback, interval])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])
}

export {
  useAnimationFrame,
}