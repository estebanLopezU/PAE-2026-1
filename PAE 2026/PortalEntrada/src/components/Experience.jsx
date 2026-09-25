import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ArrowDown } from 'lucide-react'
import HeroScene from './scenes/HeroScene'
import StatementScene from './scenes/StatementScene'
import FeaturesScene from './scenes/FeaturesScene'
import ShowcaseScene from './scenes/ShowcaseScene'
import CtaScene from './scenes/CtaScene'
import WipeTransition from './WipeTransition'

gsap.registerPlugin(ScrollTrigger)

const BG_STOPS = [
  { at: 0.0, color: '#090711' },
  { at: 0.14, color: '#141024' },
  { at: 0.36, color: '#1a0c22' },
  { at: 0.6, color: '#070510' },
  { at: 0.84, color: '#0e0924' },
  { at: 1.0, color: '#120a28' },
]

const WIPES = [
  { tag: '01 · EL PROYECTO', words: ['Descubrir', 'el', 'Estado'] },
  { tag: '02 · CAPACIDADES', words: ['Construir', 'capacidades'] },
  { tag: '03 · EL DIAGNÓSTICO', words: ['Medir', 'el', 'pulso'] },
  { tag: '04 · EL ACCESO', words: ['Entrar', 'al', 'ecosistema'] },
]

export default function Experience() {
  const rootRef = useRef(null)
  const bgRef = useRef(null)
  const spotRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const lenis = new Lenis({
          lerp: 0.09,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.6,
        })
        lenis.on('scroll', ScrollTrigger.update)
        const ticker = (time) => lenis.raf(time * 1000)
        gsap.ticker.add(ticker)
        gsap.ticker.lagSmoothing(0)

        const bgTl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
          defaults: { ease: 'none' },
        })
        BG_STOPS.forEach((stop, i) => {
          if (i === 0) return
          bgTl.to(bgRef.current, { backgroundColor: stop.color }, stop.at)
        })

        gsap.to('.progress-bar', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
          },
        })

        return () => {
          gsap.ticker.remove(ticker)
          lenis.destroy()
        }
      })

      mm.add(
        '(prefers-reduced-motion: no-preference) and (pointer: fine)',
        () => {
          const spot = spotRef.current

          const spotX = gsap.quickTo(spot, 'x', {
            duration: 0.9,
            ease: 'power3.out',
          })
          const spotY = gsap.quickTo(spot, 'y', {
            duration: 0.9,
            ease: 'power3.out',
          })

          const parallax = gsap.utils.toArray('[data-parallax]').map((el) => ({
            x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
            strength: parseFloat(el.dataset.parallax) || 12,
          }))

          const onMove = (e) => {
            const nx = e.clientX / window.innerWidth - 0.5
            const ny = e.clientY / window.innerHeight - 0.5
            spotX(nx * 120)
            spotY(ny * 120)
            for (const p of parallax) {
              p.x(nx * p.strength)
              p.y(ny * p.strength)
            }
          }

          window.addEventListener('mousemove', onMove, { passive: true })
          return () => window.removeEventListener('mousemove', onMove)
        },
      )
    }, rootRef)

    return () => {
      if (mm) mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <div id="experience" ref={rootRef}>
      <div className="bg-fx" ref={bgRef} aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="m-spot" ref={spotRef} aria-hidden="true" />

      <div className="progress" aria-hidden="true">
        <div className="progress-bar" />
      </div>

      <header className="topbar">
        <a className="brand" href="#hero">
          GOBIERNO DIGITAL <span className="brand-dot">·</span> PAE 2026
        </a>
        <a className="topbar-cta" href="#acceso">
          Entrar
          <ArrowDown size={14} strokeWidth={2} />
        </a>
      </header>

      <main>
        <HeroScene />
        <WipeTransition tag={WIPES[0].tag} words={WIPES[0].words} />
        <StatementScene />
        <WipeTransition tag={WIPES[1].tag} words={WIPES[1].words} />
        <FeaturesScene />
        <WipeTransition tag={WIPES[2].tag} words={WIPES[2].words} />
        <ShowcaseScene />
        <WipeTransition tag={WIPES[3].tag} words={WIPES[3].words} />
        <CtaScene />
      </main>
    </div>
  )
}