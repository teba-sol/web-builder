import type { MouseEvent } from 'react'
import { useSpring, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useMouseParallax(range = 10) {
  const reduced = usePrefersReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.35 })
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.35 })
  const rotateY = useTransform(sx, [-1, 1], reduced ? [0, 0] : [-range, range])
  const rotateX = useTransform(sy, [-1, 1], reduced ? [0, 0] : [range, -range])

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 2)
    my.set(((event.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return { rotateX, rotateY, onMove, onLeave, mx: sx, my: sy }
}

export function useParallaxOffset(value: MotionValue<number>, amount: number) {
  return useTransform(value, [-1, 1], [-amount, amount])
}
