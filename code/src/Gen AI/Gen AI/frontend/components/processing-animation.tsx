"use client"

import { useEffect, useRef, useState } from "react"

export default function ProcessingAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationFrameIdRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 300

    // Animation variables
    let particles: Particle[] = []
    let connections: Connection[] = []
    let nodes: Node[] = []

    // Colors
    const primaryColor = "#D02027"
    const secondaryColor = "#FF6B00"

    // Create nodes (representing AI processing centers)
    class Node {
      x: number
      y: number
      radius: number
      color: string
      pulseRadius: number
      maxPulseRadius: number
      pulseOpacity: number

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.pulseRadius = radius
        this.maxPulseRadius = radius * 3
        this.pulseOpacity = 1
      }

      draw() {
        if (!ctx) return

        // Draw node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Draw pulse effect
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${Number.parseInt(this.color.slice(1, 3), 16)}, ${Number.parseInt(this.color.slice(3, 5), 16)}, ${Number.parseInt(this.color.slice(5, 7), 16)}, ${this.pulseOpacity})`
        ctx.stroke()

        // Update pulse
        this.pulseRadius += 0.5
        this.pulseOpacity -= 0.01

        if (this.pulseRadius > this.maxPulseRadius) {
          this.pulseRadius = this.radius
          this.pulseOpacity = 1
        }
      }
    }

    // Create particles (representing data)
    class Particle {
      x: number
      y: number
      size: number
      color: string
      speed: number
      targetNode: number

      constructor(x: number, y: number, size: number, color: string, targetNode: number) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.speed = 1 + Math.random()
        this.targetNode = targetNode
      }

      draw() {
        if (!ctx) return

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }

      update() {
        const targetNode = nodes[this.targetNode]
        if (!targetNode) return

        const dx = targetNode.x - this.x
        const dy = targetNode.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > targetNode.radius) {
          this.x += (dx / distance) * this.speed
          this.y += (dy / distance) * this.speed
        } else {
          // Particle reached target, create new particle
          const randomNode = Math.floor(Math.random() * nodes.length)
          if (nodes[randomNode]) {
            this.x = nodes[randomNode].x
            this.y = nodes[randomNode].y
            this.targetNode = (randomNode + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length
          }
        }
      }
    }

    // Create connections between nodes
    class Connection {
      nodeA: number
      nodeB: number

      constructor(nodeA: number, nodeB: number) {
        this.nodeA = nodeA
        this.nodeB = nodeB
      }

      draw() {
        if (!ctx) return

        const nodeA = nodes[this.nodeA]
        const nodeB = nodes[this.nodeB]

        if (!nodeA || !nodeB) return

        ctx.beginPath()
        ctx.moveTo(nodeA.x, nodeA.y)
        ctx.lineTo(nodeB.x, nodeB.y)
        ctx.strokeStyle = "rgba(200, 200, 200, 0.2)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Initialize animation
    function init() {
      // Clear previous state
      particles = []
      connections = []
      nodes = []

      // Create nodes
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 80

      // Create central node
      nodes.push(new Node(centerX, centerY, 15, primaryColor))

      // Create surrounding nodes
      const nodeCount = 5
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        nodes.push(new Node(x, y, 8, i % 2 === 0 ? primaryColor : secondaryColor))
      }

      // Create connections
      for (let i = 1; i < nodes.length; i++) {
        connections.push(new Connection(0, i))

        // Connect to adjacent nodes
        connections.push(new Connection(i, i === nodes.length - 1 ? 1 : i + 1))
      }

      // Create particles
      for (let i = 0; i < 20; i++) {
        const randomNode = Math.floor(Math.random() * nodes.length)
        const targetNode = (randomNode + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length

        if (nodes[randomNode]) {
          particles.push(
            new Particle(
              nodes[randomNode].x,
              nodes[randomNode].y,
              2,
              Math.random() > 0.5 ? primaryColor : secondaryColor,
              targetNode,
            ),
          )
        }
      }
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) {
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      connections.forEach((connection) => connection.draw())

      // Draw nodes
      nodes.forEach((node) => node.draw())

      // Draw and update particles
      particles.forEach((particle) => {
        particle.draw()
        particle.update()
      })

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    init()
    setIsAnimating(true)
    animationFrameIdRef.current = requestAnimationFrame(animate)

    // Cleanup function
    return () => {
      setIsAnimating(false)
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="h-[300px] w-[300px]" aria-label="AI document processing animation" />
      <p className="mt-2 text-center font-medium text-banking-red">AI Processing in Progress</p>
    </div>
  )
}

