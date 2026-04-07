// hooks/useIntersectionObserver.js
import { useEffect, useRef } from 'react'

export function useSentinel({ onIntersect, enabled }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled || !ref.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onIntersect() },
      { 
        root: document.getElementById('operations-scrollable-container'),
        threshold: 0.1 
      }
    )
    
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [enabled, onIntersect])

  return ref
}