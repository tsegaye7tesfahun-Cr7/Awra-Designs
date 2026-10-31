import { useEffect, useRef, useState } from 'react'

// Only renders on devices with a fine pointer (desktop mouse)
export default function Cursor() {
  const dotRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const raf = useRef(null)

  useEffect(() => {
    // Don't show on touch-only devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
      const el = document.elementFromPoint(e.clientX, e.clientY)
      setIsPointer(el ? window.getComputedStyle(el).cursor === 'pointer' : false)
    }

    const tick = () => {
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', move)
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      {/* Outer ring */}
      <div
        className="absolute rounded-full border border-white/30 transition-all duration-200"
        style={{
          width: isPointer ? 36 : 28,
          height: isPointer ? 36 : 28,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Inner dot */}
      <div
        className="absolute rounded-full bg-white transition-all duration-150"
        style={{
          width: isPointer ? 4 : 3,
          height: isPointer ? 4 : 3,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
