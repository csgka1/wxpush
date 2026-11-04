/** @jsxImportSource hono/jsx/dom */
import { useState } from 'hono/jsx/dom'

type Particle = {
    size: number
    color: string
    left: number
    top: number
    delay: number
    duration: number
}

const colors = [
    'rgba(0, 188, 212, 0.2)',
    'rgba(0, 150, 136, 0.2)',
    'rgba(77, 182, 172, 0.15)'
]

export default function ParticleEffect() {
    const [particles] = useState<Particle[]>(() =>
        Array.from({ length: 25 }, () => ({
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 20,
            duration: 20 + Math.random() * 15
        }))
    )

    return (
        <div class="particles">
            {particles.map((particle, index) => (
                <div
                    key={index}
                    class="particle"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: particle.color,
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`
                    }}
                />
            ))}
        </div>
    )
}
