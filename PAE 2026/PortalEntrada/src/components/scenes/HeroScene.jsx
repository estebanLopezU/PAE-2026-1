import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NetworkOrb from '../NetworkOrb'

gsap.registerPlugin(ScrollTrigger)

export default function HeroScene() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          gsap.set('[data-hero="orb"]', { scale: 0.86, rotate: -10, yPercent: 2 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-hero="kicker"]', { opacity: 0, y: -60 }, 0)
            .to(
              '[data-hero="line-a"]',
              { xPercent: -62, opacity: 0, scale: 0.92, duration: 0.55 },
              0.02,
            )
            .to(
              '[data-hero="line-b"]',
              { xPercent: 48, opacity: 0, scale: 0.95, duration: 0.55 },
              0.1,
            )
            .to('[data-hero="sub"]', { opacity: 0, y: 30 }, 0.12)
            .to('[data-hero="pills"]', { opacity: 0, y: 24 }, 0.18)
            .to('[data-hero="scroll-hint"]', { opacity: 0, y: 20 }, 0.06)
            .fromTo(
              '[data-hero="orb"]',
              { scale: 0.86, rotate: -10, yPercent: 2 },
              { scale: 1.16, rotate: 7, yPercent: -2, duration: 1, ease: 'none' },
              0.12,
            )
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          gsap.set('[data-hero="orb"]', { scale: 0.8, rotate: -6, yPercent: 4 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-hero="kicker"]', { opacity: 0, y: -40 }, 0)
            .to('[data-hero="line-a"]', { xPercent: -40, opacity: 0, duration: 0.5 }, 0.04)
            .to('[data-hero="line-b"]', { xPercent: 34, opacity: 0, duration: 0.5 }, 0.1)
            .to('[data-hero="sub"]', { opacity: 0 }, 0.14)
            .to('[data-hero="pills"]', { opacity: 0 }, 0.2)
            .to('[data-hero="scroll-hint"]', { opacity: 0 }, 0.08)
            .fromTo(
              '[data-hero="orb"]',
              { scale: 0.8, rotate: -6, yPercent: 4 },
              { scale: 1.25, rotate: 5, yPercent: -4, duration: 1, ease: 'none' },
              0.1,
            )
        },
      )
    }, rootRef)

    return () => {
      if (mm) mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section className="scene scene-hero" id="hero" ref={rootRef} data-bg="0">
      <div className="scene-sticky">
        <NetworkOrb className="orb-hero" data-hero="orb" />

        <div className="hero-copy">
          <p className="kicker" data-hero="kicker">
            GOBIERNO DIGITAL COLOMBIA · PAE 2026
          </p>
          <h1 className="title-hero">
            <span className="title-line" data-hero="line-a">
              Plataforma de
            </span>
            <span className="title-line is-accent" data-hero="line-b">
              gestión pública
            </span>
          </h1>
          <p className="hero-sub" data-hero="sub">
            Un ecosistema para diagnosticar la interoperabilidad y gestionar a
            los actores del <em>Estado colombiano.</em>
          </p>
          <div className="hero-pills" data-hero="pills">
            <span className="pill pill-interop">INTEROP · X-ROAD</span>
            <span className="pill pill-govstake">GOVSTAKE 360</span>
          </div>
        </div>

        <div className="scroll-hint" data-hero="scroll-hint">
          <span className="scroll-hint-label">Scroll para descubrir</span>
          <span className="scroll-hint-line" />
        </div>
      </div>
    </section>
  )
}