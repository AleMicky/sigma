import type { PropsWithChildren } from "react"
import { useRouterState } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
        }
        className="flex min-h-0 flex-1 flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
