"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Circle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function BackgroundEffect() {
  const [circles, setCircles] = useState<Circle[]>([])

  useEffect(() => {
    // Generate random circles
    const newCircles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 40, // 40-100px
      duration: Math.random() * 20 + 20, // 20-40s
      delay: Math.random() * -20, // -20-0s (negative for already started animations)
    }))

    setCircles(newCircles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full flex items-center justify-center bg-primary/5 dark:bg-primary/10"
          style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Check className="text-primary/30 dark:text-primary/40" size={circle.size * 0.5} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  )
}
