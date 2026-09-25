import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function WipeTransition({ tag, words, height = '40vh' }) {
  const zoneRef = useRef(null)
  const panelRef = useRef(null)
  const tagRef = useRef(null)
  const fillRef = useRef(null)
  const wordsRef = useRef([])

  useLayoutEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const panel = panelRef.current
        const tagEl = tagRef.current
        const fillEl = fillRef.current
        const wordEls = wordsRef.current

        gsap.set(panel, {
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        })
        gsap.set(wordEls, { yPercent: 130 })
        gsap.set(tagEl, { opacity: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: zoneRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          defaults: { ease: 'none' },
        })

        tl.to(
          panel,
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.45 },
          0.05,
        )
          .to(wordEls, { yPercent: 0, duration: 0.14, stagger: 0.05 }, 0.3)
          .to(tagEl, { opacity: 1, duration: 0.1 }, 0.32)
          .to(fillEl, { scaleX: 1, duration: 0.26 }, 0.32)
          .to(wordEls, { yPercent: -130, duration: 0.13, stagger: 0.045 }, 0.62)
          .to(fillEl, { scaleX: 0, duration: 0.24 }, 0.67)
          .to(
            panel,
            { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', duration: 0.45 },
            0.72,
          )
      })
    }, zoneRef)

    return () => {
      if (mm) mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <div className="wt-zone" style={{ height }} ref={zoneRef} aria-hidden="true">
      <div className="wt-overlay">
        <div className="wt-panel" ref={panelRef}>
          <span className="wt-tag" ref={tagRef}>
            {tag}
          </span>
          <div className="wt-words">
            {words.map((w, i) => (
              <span className="wt-mask" key={`${w}-${i}`}>
                <span
                  className="wt-word"
                  ref={(el) => {
                    if (el) wordsRef.current[i] = el
                  }}
                >
                  {w}
                </span>
              </span>
            ))}
          </div>
        </div>
        <span className="wt-track">
          <span className="wt-track-fill" ref={fillRef} />
        </span>
      </div>
    </div>
  )
}