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

gsap.registerPlugin(ScrollTrigger)

const BG_STOPS = [
  { at: 0.0, color: '#090711' },
  { at: 0.14, color: '#141024' },
  { at: 0.36, color: '#1a0c22' },
  { at: 0.6, color: '#070510' },
  { at: 0.84, color: '#0e0924' },
  { at: 1.0, color: '#120a28' },
]

export default function Experience() {
  const rootRef = useRef(null)
  const bgRef = useRef(null)

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
        <StatementScene />
        <FeaturesScene />
        <ShowcaseScene />
        <CtaScene />
      </main>
    </div>
  )
}