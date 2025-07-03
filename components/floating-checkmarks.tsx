"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

export function FloatingCheckmarks() {
  const [circles, setCircles] = useState([])

  useEffect(() => {
    // Generate random circles with checkmarks
    const newCircles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20, // 20-60px
      opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
      duration: Math.random() * 20 + 30, // 30-50s
      delay: Math.random() * -20, // -20-0s (negative for already started animations)
    }))

    setCircles(newCircles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute rounded-full flex items-center justify-center bg-white/20"
          style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            opacity: circle.opacity,
            animation: `float ${circle.duration}s ${circle.delay}s infinite linear`,
          }}
        >
          <Check className="text-white" size={circle.size * 0.5} strokeWidth={1.5} />
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(30px, -30px) rotate(5deg);
          }
          50% {
            transform: translate(-20px, 20px) rotate(-5deg);
          }
          75% {
            transform: translate(20px, 30px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  )
}
