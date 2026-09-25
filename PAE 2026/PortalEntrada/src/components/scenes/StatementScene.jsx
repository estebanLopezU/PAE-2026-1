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
          const words = gsap.utils.toArray('[data-st="word"]')
          gsap.set(words, { yPercent: 130 })
          gsap.set(
            '[data-st="kicker"], [data-st="body"], [data-st="tile-a"], [data-st="tile-b"]',
            { opacity: 0 },
          )
          gsap.set('[data-st="tile-a"]', { xPercent: -6, y: 40 })
          gsap.set('[data-st="tile-b"]', { xPercent: 6, y: 40 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-st="kicker"]', { opacity: 1, duration: 0.04 }, 0.02)
            .to(words, { yPercent: 0, duration: 0.24, stagger: 0.05 }, 0.07)
            .to('[data-st="body"]', { opacity: 1, y: 0, duration: 0.12 }, 0.48)
            .to('[data-st="tile-a"]', { opacity: 1, xPercent: 0, y: 0, duration: 0.14 }, 0.52)
            .to('[data-st="tile-b"]', { opacity: 1, xPercent: 0, y: 0, duration: 0.14 }, 0.6)
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
          const words = gsap.utils.toArray('[data-st="word"]')
          gsap.set(words, { yPercent: 130 })
          gsap.set(
            '[data-st="kicker"], [data-st="body"], [data-st="tile-a"], [data-st="tile-b"]',
            { opacity: 0 },
          )
          gsap.set('[data-st="tile-a"]', { xPercent: -4, y: 30 })
          gsap.set('[data-st="tile-b"]', { xPercent: 4, y: 30 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-st="kicker"]', { opacity: 1, duration: 0.06 }, 0.04)
            .to(words, { yPercent: 0, duration: 0.24, stagger: 0.05 }, 0.08)
            .to('[data-st="body"]', { opacity: 1, y: 0, duration: 0.12 }, 0.48)
            .to('[data-st="tile-a"]', { opacity: 1, xPercent: 0, y: 0, duration: 0.14 }, 0.52)
            .to('[data-st="tile-b"]', { opacity: 1, xPercent: 0, y: 0, duration: 0.14 }, 0.6)
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
        <div className="orb-statement-wrap" data-parallax="12">
          <NetworkOrb className="orb-statement" data-st="orb" />
        </div>

        <div className="statement-copy">
          <p className="kicker" data-st="kicker">
            EL PROYECTO
          </p>
          <h2 className="title-statement">
            <span className="stmt-line">
              <span className="mask">
                <span className="mask-in" data-st="word">
                  Diagnosticar
                </span>
              </span>
              <span className="mask">
                <span className="mask-in" data-st="word">
                  la
                </span>
              </span>
              <span className="mask">
                <span className="mask-in" data-st="word">
                  interoperabilidad
                </span>
              </span>
            </span>
            <span className="stmt-line">
              <span className="mask">
                <span className="mask-in" data-st="word">
                  del
                </span>
              </span>
              <span className="mask">
                <span className="mask-in is-accent" data-st="word">
                  Estado
                </span>
              </span>
              <span className="mask">
                <span className="mask-in is-accent" data-st="word">
                  colombiano.
                </span>
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

        <div className="ui-chip stmt-chip-a" data-parallax="14" aria-hidden="true">
          <div className="ui-chip-float">
            <span className="chip">
              <span className="chip-status" /> <b>127</b> ENTIDADES
            </span>
          </div>
        </div>
        <div className="ui-chip stmt-chip-b hide-sm" data-parallax="20" aria-hidden="true">
          <div className="ui-chip-float" style={{ animationDelay: '-2.2s' }}>
            <span className="chip">
              <span className="chip-status gs" /> ACTORES · <b className="gs">10</b> TIPOS
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}