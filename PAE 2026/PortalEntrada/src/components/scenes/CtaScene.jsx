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
          .fromTo(
            '[data-cta="title"]',
            { autoAlpha: 0, y: 54, rotationX: 28, transformPerspective: 800 },
            { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.14 },
            0.12,
          )
          .to('[data-cta="sub"]', { autoAlpha: 1, duration: 0.1 }, 0.26)
          .fromTo(
            '[data-cta="link"]',
            { autoAlpha: 0, y: 64, scale: 0.97, rotationX: 34, z: -160, transformPerspective: 900 },
            { autoAlpha: 1, y: 0, scale: 1, rotationX: 0, z: 0, duration: 0.16, stagger: 0.07, ease: 'power2.out' },
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
          gsap.set('[data-cta="link"]', {
            autoAlpha: 0,
            y: 64,
            scale: 0.97,
            rotationX: 34,
            z: -160,
            transformPerspective: 900,
          })
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
          gsap.set('[data-cta="link"]', {
            autoAlpha: 0,
            y: 64,
            scale: 0.97,
            rotationX: 34,
            z: -160,
            transformPerspective: 900,
          })
          gsap.set('[data-cta="orb"]', { opacity: 0.08, rotate: -4, scale: 1.15 })
          timeline()
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (pointer: fine)',
        () => {
          const links = gsap.utils.toArray('[data-cta="link"]')
          gsap.set(links, { transformPerspective: 900 })

          const handlers = links.map((el) => {
            const onEnter = () =>
              gsap.to(el, { y: -5, duration: 0.3, ease: 'power3.out' })
            const onMove = (e) => {
              const r = el.getBoundingClientRect()
              const rx = ((e.clientY - r.top) / r.height - 0.5) * -9
              const ry = ((e.clientX - r.left) / r.width - 0.5) * 9
              gsap.to(el, {
                rotateX: rx,
                rotateY: ry,
                duration: 0.4,
                ease: 'power2.out',
              })
            }
            const onLeave = () =>
              gsap.to(el, {
                rotateX: 0,
                rotateY: 0,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
              })
            el.addEventListener('mouseenter', onEnter)
            el.addEventListener('mousemove', onMove)
            el.addEventListener('mouseleave', onLeave)
            return { el, onEnter, onMove, onLeave }
          })

          return () => {
            handlers.forEach(({ el, onEnter, onMove, onLeave }) => {
              el.removeEventListener('mouseenter', onEnter)
              el.removeEventListener('mousemove', onMove)
              el.removeEventListener('mouseleave', onLeave)
            })
          }
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
        <div className="cta-orb-wrap" aria-hidden="true" data-parallax="10">
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

          <div className="ui-chip cta-chip hide-sm" data-parallax="16" aria-hidden="true">
          <div className="ui-chip-float" style={{ animationDelay: '-1.5s' }}>
            <span className="chip">
              <span className="chip-status" /> MÓDULOS · <b>2</b> EN LÍNEA
            </span>
          </div>
        </div>

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