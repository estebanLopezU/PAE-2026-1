import { useId } from 'react'

const TAU = Math.PI * 2

const point = (cx, cy, radius, angle) => [
  cx + Math.cos(angle) * radius,
  cy + Math.sin(angle) * radius,
]

// Emblema de red: nodos y enlaces que evocan interoperabilidad y actores conectados.
export default function NetworkOrb({
  className = '',
  primary = '#a78bfa',
  secondary = '#f472b6',
  spin = true,
}) {
  const uid = useId().replace(/[:]/g, '')
  const cx = 200
  const cy = 200
  const outerR = 150
  const innerR = 72

  const outer = Array.from({ length: 6 }, (_, i) =>
    point(cx, cy, outerR, (TAU * i) / 6 - Math.PI / 2),
  )
  const inner = Array.from({ length: 4 }, (_, i) =>
    point(cx, cy, innerR, (TAU * i) / 4 - Math.PI / 4),
  )

  const lines = []
  for (let i = 0; i < outer.length; i++) {
    lines.push([cx, cy, ...outer[i]])
    lines.push([...outer[i], ...outer[(i + 1) % outer.length]])
  }
  for (let i = 0; i < inner.length; i++) {
    lines.push([cx, cy, ...inner[i]])
    lines.push([...inner[i], ...outer[i]])
    lines.push([...inner[i], ...outer[(i + 1) % outer.length]])
  }

  const gid = `orbGrad${uid}`
  const lid = `orbLine${uid}`
  const hid = `orbHalo${uid}`

  return (
    <div
      className={`orb ${spin ? 'orb-spin' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" role="presentation">
        <defs>
          <radialGradient id={hid} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.55" />
            <stop offset="55%" stopColor={secondary} stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
          <linearGradient id={lid} x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor={primary} stopOpacity="0" />
            <stop offset="55%" stopColor={primary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r={196} fill={`url(#${hid})`} />

        <g className="orb-rings">
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 26}
            fill="none"
            stroke={`url(#${lid})`}
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="3 10"
          />
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke={`url(#${lid})`}
            strokeOpacity="0.6"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke={`url(#${lid})`}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </g>

        <g stroke={`url(#${gid})`} strokeWidth="1" strokeOpacity="0.4">
          {lines.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        {[...outer, ...inner].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="7" fill={`url(#${gid})`} opacity="0.18" />
            <circle
              cx={x}
              cy={y}
              r="3"
              fill={i < 4 ? secondary : primary}
              opacity="0.95"
            />
          </g>
        ))}

        <circle cx={cx} cy={cy} r="18" fill={`url(#${gid})`} opacity="0.2" />
        <circle cx={cx} cy={cy} r="7.5" fill="#f5f0ff" />
        <circle cx={cx} cy={cy} r="7.5" fill="none" stroke={secondary} strokeWidth="2" />
      </svg>
    </div>
  )
}