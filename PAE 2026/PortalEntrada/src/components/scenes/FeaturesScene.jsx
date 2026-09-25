import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FEATURES } from '../../data'

gsap.registerPlugin(ScrollTrigger)

const ROW_TIMES = [
  { enter: 0.0, exit: 0.62 },
  { enter: 0.92, exit: 1.62 },
  { enter: 1.92, exit: 2.62 },
  { enter: 2.92, exit: 3.72 },
]

const MARQUEE_TXT = 'INTEROPERABILIDAD · GOVERNABILIDAD · DATOS · ACTORES · X-ROAD · '

export default function FeaturesScene() {
  const rootRef = useRef(null)
  const railRef = useRef(null)

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          const cards = gsap.utils.toArray('[data-feat="card"]')
          const dots = gsap.utils.toArray('[data-feat="dot"]')
          gsap.set(cards, {
            opacity: 0,
            xPercent: 30,
            scale: 0.94,
            y: 28,
            rotationY: -34,
            z: -260,
            transformPerspective: 1000,
            transformOrigin: '50% 50%',
          })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              onUpdate: (self) => {
                const idx = Math.min(
                  dots.length - 1,
                  Math.floor(self.progress * dots.length),
                )
                dots.forEach((d, i) => d.classList.toggle('is-active', i === idx))
              },
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-feat="head"]', { opacity: 0, y: -40, duration: 0.12 }, 0)

          ROW_TIMES.forEach((t, i) => {
            tl.fromTo(
              cards[i],
              {
                opacity: 0,
                xPercent: 30,
                scale: 0.94,
                y: 28,
                rotationY: -34,
                z: -260,
                transformPerspective: 1000,
              },
              {
                opacity: 1,
                xPercent: 0,
                scale: 1,
                y: 0,
                rotationY: 0,
                z: 0,
                duration: 0.4,
              },
              t.enter,
            ).to(
              cards[i],
              {
                opacity: 0,
                xPercent: -28,
                scale: 0.95,
                rotationY: 30,
                z: -240,
                duration: 0.4,
              },
              t.exit,
            )
          })
        },
      )

      mm.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
        () => {
          const cards = gsap.utils.toArray('[data-feat="card"]')
          const dots = gsap.utils.toArray('[data-feat="dot"]')
          gsap.set(cards, {
            opacity: 0,
            xPercent: 16,
            scale: 0.95,
            rotationY: -16,
            z: -90,
            transformPerspective: 900,
          })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
              onUpdate: (self) => {
                const idx = Math.min(
                  dots.length - 1,
                  Math.floor(self.progress * dots.length),
                )
                dots.forEach((d, i) => d.classList.toggle('is-active', i === idx))
              },
            },
            defaults: { ease: 'none' },
          })

          tl.to('[data-feat="head"]', { opacity: 0, y: -30, duration: 0.12 }, 0)

          ROW_TIMES.forEach((t, i) => {
            tl.fromTo(
              cards[i],
              { opacity: 0, xPercent: 16, scale: 0.95, rotationY: -16, z: -90, transformPerspective: 900 },
              { opacity: 1, xPercent: 0, scale: 1, rotationY: 0, z: 0, duration: 0.4 },
              t.enter,
            ).to(
              cards[i],
              { opacity: 0, xPercent: -16, rotationY: 14, z: -80, duration: 0.4 },
              t.exit,
            )
          })
        },
      )
    }, rootRef)

    return () => {
      if (mm) mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section className="scene scene-features" ref={rootRef} data-bg="2">
      <div className="scene-sticky">
        <div className="features-head" data-feat="head">
          <p className="kicker">CAPACIDADES</p>
          <h2 className="title-features">
            Dos módulos.
            <br />
            <em>Un solo ecosistema.</em>
          </h2>
        </div>

        <div className="marquee features-marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>{MARQUEE_TXT}</span>
            <span className="mq-alt" aria-hidden="true">{MARQUEE_TXT}</span>
          </div>
        </div>

        <div className="features-stage" data-feat="stage">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <article
                className={`feature-card fc-${f.tone}`}
                data-feat="card"
                key={f.n}
              >
                <div className="fc-meta">
                  <span className="fc-index">{f.n}</span>
                  <span className={`fc-tag fc-tag-${f.tone}`}>{f.tag}</span>
                </div>
                <Icon className="fc-icon" size={30} strokeWidth={1.5} />
                <h3 className="fc-title">{f.title}</h3>
                <p className="fc-text">{f.text}</p>
              </article>
            )
          })}
        </div>

        <div className="ui-chip feat-chip hide-sm" data-parallax="16" aria-hidden="true">
          <div className="ui-chip-float">
            <span className="chip">
              <span className="chip-status" /> OPERATIVO · <b>60%</b>
            </span>
          </div>
        </div>

        <div className="features-rail" aria-hidden="true">
          {FEATURES.map((f, i) => (
            <div className="rail-dot-wrap" key={f.n} data-feat="dot">
              <span className={`rail-dot rdot-${f.tone}`} />
              <span className="rail-label">
                {f.n} · {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}