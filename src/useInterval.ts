import { useRef, useEffect } from 'react'

interface saveRef {
  fn: () => any
  loop: (() => any) | undefined
  timer: number
}

export default function useInterval(
  callback: () => any,
  delay: number | null | undefined,
  immediate?: boolean
) {
  const saved = useRef<saveRef>({
    fn: callback,
    loop: undefined,
    timer: 0
  })

  useEffect(() => {
    saved.current.fn = callback
    if (immediate) {
      saved.current.fn()
    }
  }, [callback, immediate])

  // Use setTimeout rather than interval
  useEffect(() => {
    const savedRef = saved.current
    savedRef.loop = () => {
      return setTimeout(() => {
        saved.current.fn()
        savedRef.timer = (savedRef.loop as () => any)()
      }, delay as number)
    }

    if (delay) {
      savedRef.timer = savedRef.loop()
      return () => clearTimeout(savedRef.timer)
    }
  }, [delay])
  return {
    stop: () => clearTimeout(saved.current.timer),
    resume: () => saved.current.loop && saved.current.loop()
  }
}
