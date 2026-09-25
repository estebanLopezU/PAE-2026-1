import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'
import { MODULES } from '../../data'

gsap.registerPlugin(ScrollTrigger)

export default function CtaScene() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      const timeline = () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
          defaults: { ease: 'none' },
        })

        tl.to('[data-cta="kicker"]', { autoAlpha: 1, duration: 0.08 }, 0.05)
          .to('[data-cta="title"]', { autoAlpha: 1, duration: 0.14 }, 0.12)
          .to('[data-cta="sub"]', { autoAlpha: 1, duration: 0.1 }, 0.26)
          .fromTo(
            '[data-cta="link"]',
            { autoAlpha: 0, y: 64, scale: 0.97 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.16, stagger: 0.07, ease: 'power2.out' },
            0.34,
          )
          .to('[data-cta="foot"]', { autoAlpha: 1, duration: 0.08 }, 0.62)
          .fromTo(
            '[data-cta="orb"]',
            { opacity: 0.08, rotate: -4, scale: 1.15 },
            { opacity: 0.2, rotate: 6, scale: 1.35, duration: 1, ease: 'none' },
            0,
          )
        return tl
      }

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          gsap.set(
            '[data-cta="kicker"], [data-cta="title"], [data-cta="sub"], [data-cta="foot"]',
            { autoAlpha: 0 },
          )
          gsap.set('[data-cta="link"]', { autoAlpha: 0, y: 64, scale: 0.97 })
          gsap.set('[data-cta="orb"]', { opacity: 0.08, rotate: -4, scale: 1.15 })
          timeline()
        },
      )
      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          gsap.set(
            '[data-cta="kicker"], [data-cta="title"], [data-cta="sub"], [data-cta="foot"]',
            { autoAlpha: 0 },
          )
          gsap.set('[data-cta="link"]', { autoAlpha: 0, y: 64, scale: 0.97 })
          gsap.set('[data-cta="orb"]', { opacity: 0.08, rotate: -4, scale: 1.15 })
          timeline()
        },
      )
    }, rootRef)

    return () => {
      if (mm) mm.revert()
      ctx.revert()
    }
  }, [])

  const links = [MODULES.interop, MODULES.govstake]

  return (
    <section
      className="scene scene-cta"
      id="acceso"
      ref={rootRef}
      data-bg="4"
    >
      <div className="scene-sticky">
        <div className="cta-orb-wrap" aria-hidden="true">
          <div className="cta-orb" data-cta="orb" />
        </div>

        <div className="cta-inner">
          <p className="kicker" data-cta="kicker">
            ACCESO
          </p>
          <h2 className="title-cta" data-cta="title">
            Explorar el <em>ecosistema.</em>
          </h2>
          <p className="cta-sub" data-cta="sub">
            Dos módulos. Un solo propósito: un Estado que se entiende.
          </p>

          <nav className="cta-links" aria-label="Acceso a los módulos">
            {links.map((m) => (
              <a
                key={m.tone}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`module-link ml-${m.tone}`}
                data-cta="link"
                style={{ '--accent': m.accent }}
              >
                <span className="ml-head">
                  <span className="ml-tag">{m.tag}</span>
                  <span className="ml-name">{m.name}</span>
                </span>
                <span className="ml-title">{m.title}</span>
                <span className="ml-desc">{m.description}</span>
                <span className="ml-arrow">
                  Entrar
                  <ArrowUpRight size={20} strokeWidth={1.75} />
                </span>
              </a>
            ))}
          </nav>

          <footer className="cta-footer" data-cta="foot">
            <p>
              Ministerio de Tecnologías de la Información y las Comunicaciones · Colombia
            </p>
            <p>PAE 2026 · Gobierno Digital</p>
          </footer>
        </div>
      </div>
    </section>
  )
}