import { addPropertyControls, ControlType } from "framer"
import { useRef, useEffect, useState } from "react"

// Particle class definition
class Particle {
    vx: number = 0
    vy: number = 0
    // Constructor: Initializes a particle with its properties
    // Adjustable: size range, density range, speed range
    constructor(x, y, targetX, targetY) {
        this.x = x
        this.y = y
        this.targetX = targetX
        this.targetY = targetY
        this.size = Math.random() * 1.5 + 0.5 // Vary size between 2 and 5 // Constructor: Initializes a particle with its properties
        // Adjustable: size range, density range, speed range
        this.baseX = x
        this.baseY = y
        this.density = Math.random() * 30 + 1
        this.angle = Math.random() * 360
        this.speed = 0.02 + Math.random() * 0.04 // Adjustable: affects particle wobble speed
        this.color = this.generateColor()
        this.opacity = 1
    }

    // Generates a random color for the particle
    // Adjustable: hue, saturation, and lightness ranges
    generateColor() {
        // Generate a color variation around turquoise
        const hue = 170 + Math.random() * 40 - 20 // Turquoise hue is around 170 // Adjustable: color hue range
        const saturation = 70 + Math.random() * 70 // 70-100% // Adjustable: color saturation range
        const lightness = 50 + Math.random() * 70 // 50-70% // Adjustable: color lightness range
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    // Updates particle position based on mouse interaction and animation progress
    // Adjustable: maxDistance, disappearRadius, force multiplier
    update(progress: number, mouseX: number, mouseY: number) {
        const targetX = this.baseX + (this.targetX - this.baseX) * progress
        const targetY = this.baseY + (this.targetY - this.baseY) * progress

        // Interpolate position
        this.vx += (targetX - this.x) * 0.05
        this.vy += (targetY - this.y) * 0.05
        this.vx *= 0.95 // Add some damping
        this.vy *= 0.95
        this.x += this.vx
        this.y += this.vy

        // Mouse interaction (keep this part as is)
        let dx = mouseX - this.x
        let dy = mouseY - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        // Reduce the frequency of these expensive calculations
        if (Math.random() < 0.1) {
            // Only update 10% of particles each frame
            let dx = mouseX - this.x
            let dy = mouseY - this.y
            let distance = Math.sqrt(dx * dx + dy * dy)
            let forceDirectionX = dx / distance
            let forceDirectionY = dy / distance
            let maxDistance = 100
            let force = (maxDistance - distance) / maxDistance
            if (force < 0) force = 0

            let directionX = forceDirectionX * force * this.density * 0.3
            let directionY = forceDirectionY * force * this.density * 0.3

            this.x += directionX
            this.y += directionY
        }

        // Always update position based on progress
        this.x = this.baseX + (this.targetX - this.baseX) * progress
        this.y = this.baseY + (this.targetY - this.baseY) * progress
    }

    // Draws the particle on the canvas
    // Adjustable: shadowBlur
    draw(ctx) {
        ctx.save()

        // Glow effect
        ctx.shadowBlur = 2 // Adjustable: glow intensity
        ctx.shadowColor = this.color

        // Main particle with opacity
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
    }

    // Resets particle properties (used for particle pooling)
    reset(x, y, targetX, targetY) {
        // Reset particle properties
        this.x = x
        this.y = y
        this.targetX = targetX
        this.targetY = targetY
        // Other properties could be reset here if needed
    }
}

// ParticleSystem function (converted from class to functional approach)
function ParticleSystem(canvas: HTMLCanvasElement) {
    // ... (ParticleSystem logic here, adapted for React hooks)
    let ctx: CanvasRenderingContext2D
    let particles: Particle[] = []
    //let image: HTMLImageElement
    let isSetup = false
    let mouseX = 0
    let mouseY = 0
    let particlePool: Particle[] = []
    let lastTime = 0
    let offscreenCanvas: HTMLCanvasElement
    let offscreenCtx: CanvasRenderingContext2D
    let animationFrameId: number
    let targetScrollProgress = 0
    let currentScrollProgress = 0

    window.addEventListener("scroll", () => {
        targetScrollProgress = Math.max(
            0,
            Math.min(
                1,
                window.scrollY /
                    (document.documentElement.scrollHeight - window.innerHeight)
            )
        )
    })

    function smoothScroll() {
        currentScrollProgress +=
            (targetScrollProgress - currentScrollProgress) * 0.1
    }

    // Setup function
    function setup() {
        console.log("Setup started")
        ctx = canvas.getContext("2d")
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        offscreenCanvas = document.createElement("canvas")
        offscreenCanvas.width = canvas.width
        offscreenCanvas.height = canvas.height
        offscreenCtx = offscreenCanvas.getContext("2d")

        // Remove or comment out these lines
        // image = new Image();
        // image.onload = () => {
        //     setupParticles();
        //     isSetup = true;
        //     requestAnimationFrame(animate);
        // };
        // image.src = imageUrl;

        // Instead, call these directly
        setupParticles()
        isSetup = true
        requestAnimationFrame(animate)

        canvas.addEventListener("mousemove", (event) => {
            mouseX = event.x
            mouseY = event.y
        })
    }

    function getParticle(
        x: number,
        y: number,
        targetX: number,
        targetY: number
    ) {
        if (particlePool.length > 0) {
            const particle = particlePool.pop()
            particle.reset(x, y, targetX, targetY)
            return particle
        }
        return new Particle(x, y, targetX, targetY)
    }

    function setupParticles() {
        const particleCount = 500 // Adjust this number as needed
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            const targetX = Math.random() * canvas.width
            const targetY = Math.random() * canvas.height
            const particle = new Particle(x, y, targetX, targetY)
            particles.push(particle)
        }
        console.log("Particles setup complete")
    }

    function update(progress: number) {
        if (!isSetup) return

        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0.6)"
        offscreenCtx.fillRect(
            0,
            0,
            offscreenCanvas.width,
            offscreenCanvas.height
        )

        particles.forEach((particle) => {
            particle.update(progress, mouseX, mouseY)
            particle.draw(offscreenCtx)
        })

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(offscreenCanvas, 0, 0)
    }

    function animate(timestamp: number) {
        if (!lastTime) lastTime = timestamp
        const delta = timestamp - lastTime

        if (delta > 1000 / 60) {
            // Change from 24 to 30 or even 15 for less frequent updates
            const scrollProgress = Math.max(
                0,
                Math.min(
                    1,
                    window.scrollY /
                        (document.documentElement.scrollHeight -
                            window.innerHeight)
                )
            )
            smoothScroll()
            update(currentScrollProgress)
            lastTime = timestamp
        }

        animationFrameId = requestAnimationFrame(animate)
    }

    function start() {
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate)
        }
    }

    function stop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }
    }

    setup()
    start()

    return {
        stop,
    }
    let resizeTimeout: number
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            offscreenCanvas.width = canvas.width
            offscreenCanvas.height = canvas.height
            setupParticles() // Re-setup particles for new dimensions
        }, 250)
    })

    // Return any methods that need to be called from outside
}

export function ParticleAnimation(props) {
    const canvasRef = useRef(null)
    const [particleSystem, setParticleSystem] = useState(null)

    useEffect(() => {
        if (canvasRef.current && !particleSystem) {
            const newParticleSystem = ParticleSystem(canvasRef.current)
            setParticleSystem(newParticleSystem)
        }

        return () => {
            if (particleSystem) {
                particleSystem.stop()
            }
        }
    }, [canvasRef, particleSystem])

    return (
        <canvas
            ref={canvasRef}
            id="particle-canvas"
            style={{ width: "100%", height: "100%" }}
        />
    )
}

ParticleAnimation.defaultProps = {
    imageUrl: "https://via.placeholder.com/150",
}

addPropertyControls(ParticleAnimation, {
    imageUrl: {
        type: ControlType.String,
        title: "Image URL",
        defaultValue: "https://via.placeholder.com/150",
    },
})
