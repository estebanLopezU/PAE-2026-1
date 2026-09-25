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

          const intro = gsap.timeline({ delay: 0.2 })
          intro
            .from('[data-hero="word"]', {
              yPercent: 120,
              duration: 0.9,
              stagger: 0.07,
              ease: 'power4.out',
            })
            .from('[data-hero="kicker"]', { autoAlpha: 0, y: 18, duration: 0.5 }, 0.25)
            .from('[data-hero="sub"]', { autoAlpha: 0, y: 14, duration: 0.5 }, 0.6)
            .from('[data-hero="pills"]', { autoAlpha: 0, y: 12, duration: 0.5 }, 0.75)

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
              { scale: 1.3, rotate: 8, yPercent: -2, duration: 1, ease: 'none' },
              0.12,
            )
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          gsap.set('[data-hero="orb"]', { scale: 0.8, rotate: -6, yPercent: 4 })

          const intro = gsap.timeline({ delay: 0.15 })
          intro
            .from('[data-hero="word"]', {
              yPercent: 120,
              duration: 0.8,
              stagger: 0.06,
              ease: 'power4.out',
            })
            .from('[data-hero="kicker"]', { autoAlpha: 0, y: 14, duration: 0.4 }, 0.2)
            .from('[data-hero="sub"]', { autoAlpha: 0, y: 10, duration: 0.4 }, 0.5)
            .from('[data-hero="pills"]', { autoAlpha: 0, y: 8, duration: 0.4 }, 0.62)

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
              { scale: 1.35, rotate: 5, yPercent: -4, duration: 1, ease: 'none' },
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
        <div className="orb-hero-wrap" data-parallax="14">
          <NetworkOrb className="orb-hero" data-hero="orb" />
        </div>

        <div className="hero-copy">
          <p className="kicker" data-hero="kicker">
            GOBIERNO DIGITAL COLOMBIA · PAE 2026
          </p>
          <h1 className="title-hero">
            <span className="title-line" data-hero="line-a">
              <span className="wmask">
                <span className="wmask-in" data-hero="word">
                  Plataforma
                </span>
              </span>
              <span className="wmask">
                <span className="wmask-in" data-hero="word">
                  de
                </span>
              </span>
            </span>
            <span className="title-line is-accent" data-hero="line-b">
              <span className="wmask">
                <span className="wmask-in w-hero-accent" data-hero="word">
                  gestión
                </span>
              </span>
              <span className="wmask">
                <span className="wmask-in w-hero-accent" data-hero="word">
                  pública
                </span>
              </span>
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

        <div className="ui-chip hero-chip-a" data-parallax="18" aria-hidden="true">
          <div className="ui-chip-float">
            <span className="chip">
              <span className="chip-status" /> X-ROAD · <b>CONECTADO</b>
            </span>
          </div>
        </div>
        <div className="ui-chip hero-chip-b hide-sm" data-parallax="26" aria-hidden="true">
          <div className="ui-chip-float" style={{ animationDelay: '-3s' }}>
            <span className="chip">
              <span className="chip-status gs" /> MADUREZ · <b className="gs">2.3/5</b>
            </span>
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