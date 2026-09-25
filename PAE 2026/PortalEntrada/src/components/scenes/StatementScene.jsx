import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NetworkOrb from '../NetworkOrb'

gsap.registerPlugin(ScrollTrigger)

export default function StatementScene() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          gsap.set('[data-st="line"]', { yPercent: 115 })
          gsap.set(
            '[data-st="kicker"], [data-st="body"], [data-st="tile-a"], [data-st="tile-b"]',
            { opacity: 0, y: 48 },
          )

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          const lines = gsap.utils.toArray('[data-st="line"]')

          tl.to('[data-st="kicker"]', { opacity: 1, y: 0, duration: 0.04 }, 0.02)
            .to(lines, { yPercent: 0, duration: 0.18, stagger: 0.1 }, 0.07)
            .to('[data-st="body"]', { opacity: 1, y: 0, duration: 0.12 }, 0.48)
            .to('[data-st="tile-a"]', { opacity: 1, y: 0, duration: 0.12 }, 0.52)
            .to('[data-st="tile-b"]', { opacity: 1, y: 0, duration: 0.12 }, 0.6)
            .fromTo(
              '[data-st="orb"]',
              { xPercent: 14, yPercent: -10, scale: 1 },
              { xPercent: 40, yPercent: -46, scale: 0.7, opacity: 0.22, duration: 1 },
              0,
            )
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          gsap.set('[data-st="line"]', { yPercent: 115 })
          gsap.set(
            '[data-st="kicker"], [data-st="body"], [data-st="tile-a"], [data-st="tile-b"]',
            { opacity: 0, y: 36 },
          )

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          const lines = gsap.utils.toArray('[data-st="line"]')

          tl.to('[data-st="kicker"]', { opacity: 1, duration: 0.06 }, 0.04)
            .to(lines, { yPercent: 0, duration: 0.2, stagger: 0.12 }, 0.08)
            .to('[data-st="body"]', { opacity: 1, y: 0, duration: 0.12 }, 0.48)
            .to('[data-st="tile-a"]', { opacity: 1, y: 0, duration: 0.12 }, 0.52)
            .to('[data-st="tile-b"]', { opacity: 1, y: 0, duration: 0.12 }, 0.6)
            .fromTo(
              '[data-st="orb"]',
              { scale: 1, opacity: 0.5 },
              { scale: 0.55, opacity: 0.12, duration: 1 },
              0,
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
    <section className="scene scene-statement" ref={rootRef} data-bg="1">
      <div className="scene-sticky">
        <NetworkOrb className="orb-statement" data-st="orb" />

        <div className="statement-copy">
          <p className="kicker" data-st="kicker">
            EL PROYECTO
          </p>
          <h2 className="title-statement">
            <span className="mask">
              <span className="mask-in" data-st="line">
                Diagnosticar la
              </span>
            </span>
            <span className="mask">
              <span className="mask-in" data-st="line">
                interoperabilidad del
              </span>
            </span>
            <span className="mask">
              <span className="mask-in is-accent" data-st="line">
                Estado colombiano.
              </span>
            </span>
          </h2>

          <p className="statement-body" data-st="body">
            Una suite que convierte datos del Estado en decisiones: mide cuán
            interconectadas están las entidades públicas y cuán preparadas
            están sus organizaciones para relacionarse con quienes las rodean.
          </p>

          <div className="statement-modules">
            <article
              className="stmt-tile tile-interop"
              data-st="tile-a"
            >
              <span className="tile-tag">X-ROAD COLOMBIA</span>
              <h3>Interoperabilidad</h3>
              <p>
                Mapeo diagnóstico de las entidades públicas y su madurez
                tecnológica según el Marco de Interoperabilidad del MinTIC.
              </p>
            </article>
            <article
              className="stmt-tile tile-govstake"
              data-st="tile-b"
            >
              <span className="tile-tag">GOVSTAKE 360</span>
              <h3>Gestión de actores</h3>
              <p>
                Caracterización, priorización y seguimiento de los grupos de
                interés que hacen posible el cambio institucional.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}