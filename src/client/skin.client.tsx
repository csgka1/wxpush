/** @jsxImportSource hono/jsx/dom */
import { render } from 'hono/jsx/dom'
import ParticleEffect from '../components/ParticleEffect.client'

const root = document.getElementById('particles-root')

if (!(root instanceof HTMLElement)) {
    throw new Error('Particle effect mount element was not found')
}

render(<ParticleEffect />, root)
