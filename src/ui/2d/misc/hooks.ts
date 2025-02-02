import { useCallback, useEffect, useRef } from "react"

const useAnimationFrame = (callback: (deltaTime: number, totalTime: number) => void, interval: number = 0) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const animate = useCallback((time: number) => {
    const deltaTime = previousTimeRef.current ? time - previousTimeRef.current : 0
    const timeBeforeCallback = new Date().getTime()
    callback(deltaTime, time)
    const callbackTime = new Date().getTime() - timeBeforeCallback

    previousTimeRef.current = time
    const remainTime = interval - callbackTime
    if (remainTime > 0) {
      timeoutRef.current = setTimeout(() => {
        requestRef.current = requestAnimationFrame(animate)
      }, remainTime)
    } else {
      timeoutRef.current = undefined
      requestRef.current = requestAnimationFrame(animate)
    }
  }, [callback, interval])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        console.log('cancel animation frame', requestRef.current)
        cancelAnimationFrame(requestRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [animate])
}

export {
  useAnimationFrame,
}