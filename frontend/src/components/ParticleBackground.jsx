import { useEffect, useRef } from 'react'

const PARTICLE_CONFIG = {
  count: 60,
  color: '#0D9488',
  opacity: 0.07,
  speed: 0.3,
  radius: 2,
}

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let isVisible = true

    // Set canvas dimensions to match window
    const setDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setDimensions()

    // Handle resize with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      setDimensions()
    })
    resizeObserver.observe(document.body)

    // Handle visibility changes
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initialize particles
    const particles = Array.from({ length: PARTICLE_CONFIG.count }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
      vy: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
    }))

    let time = 0

    // Animation loop
    const draw = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.005 // slow wave evolution

      // Draw Particles
      ctx.globalAlpha = PARTICLE_CONFIG.opacity
      ctx.fillStyle = PARTICLE_CONFIG.color
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, PARTICLE_CONFIG.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Waves
      ctx.lineWidth = 1
      ctx.strokeStyle = PARTICLE_CONFIG.color
      ctx.globalAlpha = PARTICLE_CONFIG.opacity * 1.5 // Waves slightly more visible

      const drawWave = (offsetY, amplitude, frequency, phase) => {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 5) {
          const y = offsetY + Math.sin(x * frequency + phase) * amplitude
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // 2 slow sine waves
      drawWave(canvas.height * 0.7, 50, 0.003, time)
      drawWave(canvas.height * 0.8, 80, 0.002, time * 1.2 + Math.PI)

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  )
}
