import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NetworkOrb from '../NetworkOrb'

gsap.registerPlugin(ScrollTrigger)

const DOMINIOS = [
  { label: 'Legal', desc: 'marco normativo' },
  { label: 'Organizacional', desc: 'estructura y procesos' },
  { label: 'Semántico', desc: 'vocabularios compartidos' },
  { label: 'Técnico', desc: 'servicios e infraestructura' },
]

export default function ShowcaseScene() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          gsap.set('[data-sh="numInner"]', { scale: 1.06, yPercent: 12 })
          gsap.set('[data-sh="kicker"], [data-sh="line"]', { opacity: 0 })
          gsap.set('[data-sh="num"]', {
            opacity: 0,
            yPercent: 40,
            scale: 1.6,
            filter: 'blur(10px)',
          })
          gsap.set('[data-sh="stat"]', { opacity: 0, y: 26 })
          gsap.set('[data-sh="layer"]', {
            y: (i) => (i - 1.5) * 10,
            scale: 0.94,
            rotationX: 0,
            z: 0,
          })

          const counter = { v: 0 }
          const numValEl = gsap.utils.toArray('[data-sh="numVal"]')[0]

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.fromTo(
            '[data-sh="orb"]',
            { scale: 0.5, opacity: 0.4, filter: 'blur(16px)' },
            { scale: 1.45, opacity: 1, filter: 'blur(0px)', duration: 0.6 },
            0,
          )
            .fromTo('[data-sh="stack"]', { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.14)
            .to(
              '[data-sh="layer"]',
              {
                y: (i) => (i - 1.5) * 94,
                z: (i) => (1.5 - i) * 34,
                scale: 1,
                rotationX: 7,
                duration: 0.26,
                stagger: 0.02,
              },
              0.18,
            )
            .to('[data-sh="layer"]', {
              y: (i) => (i - 1.5) * 220,
              rotationX: -6,
              scale: 1.07,
              filter: 'blur(6px)',
              duration: 0.16,
              stagger: 0.015,
            }, 0.5)
            .to('[data-sh="stack"]', { opacity: 0, duration: 0.1 }, 0.53)
            .to('[data-sh="kicker"]', { opacity: 1, duration: 0.1 }, 0.5)
            .fromTo(
              '[data-sh="num"]',
              { opacity: 0, yPercent: 40, scale: 1.6, rotationX: 34, filter: 'blur(10px)', transformPerspective: 1000 },
              { opacity: 1, yPercent: 0, scale: 1, rotationX: 0, filter: 'blur(0px)', duration: 0.26 },
              0.56,
            )
            .to('[data-sh="numInner"]', { scale: 1, yPercent: 0, duration: 0.24 }, 0.56)
            .to(
              counter,
              {
                v: 2.3,
                duration: 0.26,
                onUpdate: () => {
                  numValEl.textContent = counter.v.toFixed(1)
                },
              },
              0.58,
            )
            .to('[data-sh="line"]', { opacity: 1, duration: 0.12 }, 0.76)
            .fromTo(
              '[data-sh="stat"]',
              { opacity: 0, y: 26, rotationX: 28, z: -160, transformPerspective: 800 },
              { opacity: 1, y: 0, rotationX: 0, z: 0, duration: 0.1, stagger: 0.06 },
              0.84,
            )
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          gsap.set('[data-sh="numInner"]', { scale: 1.05, yPercent: 8 })
          gsap.set('[data-sh="kicker"], [data-sh="line"]', { opacity: 0 })
          gsap.set('[data-sh="num"]', {
            opacity: 0,
            yPercent: 26,
            scale: 1.4,
            filter: 'blur(8px)',
          })
          gsap.set('[data-sh="stat"]', { opacity: 0, y: 18 })
          gsap.set('[data-sh="layer"]', {
            y: (i) => (i - 1.5) * 8,
            scale: 0.95,
            rotationX: 0,
            z: 0,
          })

          const counterMobile = { v: 0 }
          const numValElMobile = gsap.utils.toArray('[data-sh="numVal"]')[0]

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
            defaults: { ease: 'none' },
          })

          tl.fromTo(
            '[data-sh="orb"]',
            { scale: 0.6, opacity: 0.35, filter: 'blur(10px)' },
            { scale: 1.3, opacity: 0.9, filter: 'blur(0px)', duration: 0.6 },
            0,
          )
            .fromTo('[data-sh="stack"]', { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.14)
            .to(
              '[data-sh="layer"]',
              {
                y: (i) => (i - 1.5) * 74,
                scale: 1,
                rotationX: 6,
                duration: 0.24,
                stagger: 0.02,
              },
              0.18,
            )
            .to('[data-sh="layer"]', {
              y: (i) => (i - 1.5) * 170,
              rotationX: -5,
              scale: 1.06,
              filter: 'blur(5px)',
              duration: 0.14,
              stagger: 0.012,
            }, 0.48)
            .to('[data-sh="stack"]', { opacity: 0, duration: 0.09 }, 0.51)
            .to('[data-sh="kicker"]', { opacity: 1, duration: 0.1 }, 0.5)
            .fromTo(
              '[data-sh="num"]',
              { opacity: 0, yPercent: 26, scale: 1.4, rotationX: 30, filter: 'blur(8px)', transformPerspective: 900 },
              { opacity: 1, yPercent: 0, scale: 1, rotationX: 0, filter: 'blur(0px)', duration: 0.24 },
              0.56,
            )
            .to('[data-sh="numInner"]', { scale: 1, yPercent: 0, duration: 0.24 }, 0.56)
            .to(
              counterMobile,
              {
                v: 2.3,
                duration: 0.26,
                onUpdate: () => {
                  numValElMobile.textContent = counterMobile.v.toFixed(1)
                },
              },
              0.58,
            )
            .to('[data-sh="line"]', { opacity: 1, duration: 0.12 }, 0.76)
            .fromTo(
              '[data-sh="stat"]',
              { opacity: 0, y: 18, rotationX: 24, z: -120, transformPerspective: 800 },
              { opacity: 1, y: 0, rotationX: 0, z: 0, duration: 0.1, stagger: 0.06 },
              0.84,
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
    <section className="scene scene-showcase" id="showcase" ref={rootRef} data-bg="3">
      <div className="scene-sticky">
        <div className="showcase-orb-wrap" data-parallax="18">
          <NetworkOrb className="orb-showcase" data-sh="orb" />
        </div>
        <div className="showcase-beam" aria-hidden="true" />

        <div className="dom-stack" data-sh="stack" aria-hidden="true">
          {DOMINIOS.map((d) => (
            <div className="dom-layer" data-sh="layer" key={d.label}>
              <span className="dom-label">{d.label}</span>
              <span className="dom-desc">{d.desc}</span>
            </div>
          ))}
        </div>

        <div className="showcase-copy">
          <p className="kicker" data-sh="kicker">
            EL ESTADO DE LA INTEROPERABILIDAD
          </p>
          <p className="showcase-num" data-sh="num">
            <span className="showcase-num-inner" data-sh="numInner">
              <span className="num-val" data-sh="numVal">
                2.3
              </span>
              <span className="num-unit">/5</span>
            </span>
          </p>
          <p className="showcase-line" data-sh="line">
            es la madurez promedio de la interoperabilidad en Colombia:
            <em> un nivel básico</em>, aún lejos de lo óptimo.
          </p>

          <ul className="showcase-stats" role="list">
            <li data-sh="stat">
              <strong>127</strong>
              <span>entidades mapeadas</span>
            </li>
            <li data-sh="stat">
              <strong>60%</strong>
              <span>operativas con servicios</span>
            </li>
            <li data-sh="stat">
              <strong>1.9</strong>
              <span>madurez semántica · el eslabón débil</span>
            </li>
          </ul>
        </div>
      <div className="ui-chip sh-chip" data-parallax="14" aria-hidden="true">
          <div className="ui-chip-float" style={{ animationDelay: '-4s' }}>
            <span className="chip">
              <span className="chip-status gs" /> SEMÁNTICA · <b className="gs">1.9</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}