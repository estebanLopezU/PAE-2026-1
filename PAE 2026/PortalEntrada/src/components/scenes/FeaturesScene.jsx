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
          gsap.set(cards, { opacity: 0, xPercent: 14, scale: 0.96, y: 24 })

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
              { opacity: 0, xPercent: 14, scale: 0.96, y: 24 },
              { opacity: 1, xPercent: 0, scale: 1, y: 0, duration: 0.4 },
              t.enter,
            ).to(
              cards[i],
              { opacity: 0, xPercent: -12, scale: 0.97, duration: 0.4 },
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
          gsap.set(cards, { opacity: 0, xPercent: 8, scale: 0.97 })

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
              { opacity: 0, xPercent: 8, scale: 0.97 },
              { opacity: 1, xPercent: 0, scale: 1, duration: 0.4 },
              t.enter,
            ).to(cards[i], { opacity: 0, xPercent: -8, duration: 0.4 }, t.exit)
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