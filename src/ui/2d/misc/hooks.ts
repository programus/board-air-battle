import { useCallback, useEffect, useRef } from "react"

const useAnimationFrame = (callback: (deltaTime: number, totalTime: number) => void) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callback(deltaTime, time)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [callback])

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