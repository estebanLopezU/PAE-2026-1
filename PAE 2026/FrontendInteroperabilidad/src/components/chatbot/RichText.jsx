// Render ligero de markdown para las respuestas de AgentGD.
// Evita una dependencia nueva: cubre negrita, codigo, listas, titulos y tablas.

function Inline({ text }) {
  const partes = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={i} className="font-semibold text-white">{parte.slice(2, -2)}</strong>
        }
        if (parte.startsWith('`') && parte.endsWith('`')) {
          return (
            <code key={i} className="rounded bg-black/40 px-1 py-0.5 font-mono text-[0.85em] text-white/90">
              {parte.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{parte}</span>
      })}
    </>
  )
}

function Tabla({ filas }) {
  const [cabecera, ...cuerpo] = filas
  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[11px]">
        <thead>
          <tr>
            {cabecera.map((celda, i) => (
              <th key={i} className="border-b border-white/20 px-2 py-1 font-semibold text-white/90">
                <Inline text={celda} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cuerpo.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td key={j} className="border-b border-white/10 px-2 py-1 align-top text-white/80">
                  <Inline text={celda} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function RichText({ texto = '' }) {
  const lineas = String(texto).replace(/\r/g, '').split('\n')
  const bloques = []
  let lista = null
  let tabla = null

  const cerrarLista = () => {
    if (lista) {
      bloques.push(
        <ul key={`ul-${bloques.length}`} className="my-1 list-disc space-y-0.5 pl-4">
          {lista.map((item, i) => (
            <li key={i}><Inline text={item} /></li>
          ))}
        </ul>
      )
      lista = null
    }
  }
  const cerrarTabla = () => {
    if (tabla) {
      bloques.push(<Tabla key={`tabla-${bloques.length}`} filas={tabla} />)
      tabla = null
    }
  }

  lineas.forEach((linea) => {
    const limpia = linea.trimEnd()

    if (!limpia.trim()) {
      cerrarLista()
      cerrarTabla()
      return
    }

    if (limpia.trim().startsWith('|')) {
      cerrarLista()
      const celdas = limpia.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
      const esSeparador = celdas.every((c) => /^:?-{2,}:?$/.test(c))
      if (esSeparador) return
      if (!tabla) tabla = []
      tabla.push(celdas)
      return
    }
    cerrarTabla()

    if (/^#{1,4}\s/.test(limpia)) {
      cerrarLista()
      const texto = limpia.replace(/^#{1,4}\s/, '')
      bloques.push(
        <p key={`h-${bloques.length}`} className="mt-2 mb-1 text-[13px] font-semibold text-white">
          <Inline text={texto} />
        </p>
      )
      return
    }

    if (/^\s*[-*]\s+/.test(limpia)) {
      const item = limpia.replace(/^\s*[-*]\s+/, '')
      if (!lista) lista = []
      lista.push(item)
      return
    }

    if (/^\s*\d+[.)]\s+/.test(limpia)) {
      const item = limpia.replace(/^\s*\d+[.)]\s+/, '')
      if (!lista) lista = []
      lista.push(item)
      return
    }

    cerrarLista()
    if (/^---+$/.test(limpia.trim())) {
      bloques.push(<hr key={`hr-${bloques.length}`} className="my-2 border-white/10" />)
      return
    }

    bloques.push(
      <p key={`p-${bloques.length}`} className="mb-1.5 last:mb-0">
        <Inline text={limpia} />
      </p>
    )
  })

  cerrarLista()
  cerrarTabla()

  return <div className="text-[13px] leading-relaxed text-white/90">{bloques}</div>
}
