import { useRef, useEffect, useCallback } from 'react'

interface SaveRef {
  fn: () => any
  loop: (() => any) | undefined
  timer: number
}

export default function useInterval(
  callback: () => any,
  delay: number | null | undefined,
  immediate?: boolean
) {
  const saved = useRef<SaveRef>({
    fn: callback,
    loop: undefined,
    timer: 0
  })

  useEffect(() => {
    immediate && callback()
  }, [])

  useEffect(() => {
    saved.current.fn = callback
  }, [callback])

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
    stop: useCallback(() => clearTimeout(saved.current.timer), []),
    resume: useCallback(() => {
      clearTimeout(saved.current.timer)
      saved.current.timer = saved.current.loop && saved.current.loop()
    }, [])
  }
}
