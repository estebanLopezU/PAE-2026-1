import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_BASE = '/api/v1'

// ─── Color Palette ───────────────────────────────────────────
const COLORS = {
  primary: [0, 51, 102],
  secondary: [0, 102, 179],
  accent: [0, 153, 204],
  success: [16, 185, 129],
  warning: [245, 158, 11],
  danger: [239, 68, 68],
  darkBg: [15, 23, 42],
  darkCard: [30, 41, 59],
  lightText: [255, 255, 255],
  mutedText: [148, 163, 184],
  borderColor: [51, 65, 85],
  headerBg: [30, 58, 138],
}

// ─── API Helper ──────────────────────────────────────────────
async function fetchAPI(url, signal) {
  const token = localStorage.getItem('xroad_access_token')
  let response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  })

  // Manejo de refresh token igual que en el Dashboard para evitar fallos 401
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('xroad_refresh_token')

    if (refreshToken) {
      const refreshResponse = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal,
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const newAccessToken = refreshData?.access_token

        if (newAccessToken) {
          localStorage.setItem('xroad_access_token', newAccessToken)
          response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccessToken}`,
            },
            signal,
          })
        }
      }
    }
  }

  if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
  return response.json()
}

// ─── Fetch All Data ───────────────────────────────────────────
async function fetchAllReportData(signal) {
  const [
    kpis,
    sectorData,
    xroadStatus,
    sectorsData,
    entitiesData,
    servicesData,
    maturityAssessmentsRaw,
    relationshipsData,
    topMature,
  ] = await Promise.all([
    fetchAPI(`${API_BASE}/dashboard/kpis`, signal).catch(() => ({})),
    fetchAPI(`${API_BASE}/dashboard/by-sector`, signal).catch(() => []),
    fetchAPI(`${API_BASE}/dashboard/by-xroad-status`, signal).catch(() => []),
    fetchAPI(`${API_BASE}/sectors/?limit=500`, signal).catch(() => ({ items: [] })),
    fetchAPI(`${API_BASE}/entities/?limit=500`, signal).catch(() => ({ items: [] })),
    fetchAPI(`${API_BASE}/services/?limit=500`, signal).catch(() => ({ items: [] })),
    fetchAPI(`${API_BASE}/maturity/assessments?limit=500`, signal).catch(() => []),
    fetchAPI(`${API_BASE}/relationships/graph`, signal).catch(() => ({ nodes: [], links: [] })),
    fetchAPI(`${API_BASE}/dashboard/top-mature-entities?limit=20`, signal).catch(() => []),
  ])

  // Entities: paginated response { items, total }
  const allEntities = entitiesData?.items || []

  // Services: paginated response { items, total }
  const services = servicesData?.items || []

  // Maturity assessments: returns array directly
  const maturityAssessments = Array.isArray(maturityAssessmentsRaw)
    ? maturityAssessmentsRaw.map((a) => ({
        ...a,
        entity_name: a.entity_name || a.entity?.name || `ID: ${a.entity_id}`,
      }))
    : []

  return {
    kpis,
    sectorData: Array.isArray(sectorData) ? sectorData : [],
    xroadStatus: Array.isArray(xroadStatus) ? xroadStatus : [],
    sectorsList: Array.isArray(sectorsData) ? sectorsData : (sectorsData?.items || []),
    allEntities,
    services,
    maturityAssessments,
    relationshipsData,
    topMature: Array.isArray(topMature) ? topMature : [],
    generatedAt: new Date().toISOString(),
  }
}

// ─── Draw Header / Footer ────────────────────────────────────
function addHeaderFooter(doc, data, pageNumber) {
  const pageCount = doc.internal.getNumberOfPages()

  doc.setFillColor(...COLORS.darkBg)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, 'F')
  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(8)
  doc.text('INTEROP CORE - Plataforma de Inteligencia de Interoperabilidad • Colombia', 14, 8)
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(`Generado: ${new Date(data.generatedAt).toLocaleString('es-CO')}`, 14, 14)

  doc.setTextColor(...COLORS.mutedText)
  doc.setFontSize(7)
  doc.text(
    `Página ${pageNumber} de ${pageCount}`,
    doc.internal.pageSize.getWidth() - 14,
    14,
    { align: 'right' }
  )

  doc.setDrawColor(...COLORS.borderColor)
  doc.line(14, doc.internal.pageSize.getHeight() - 14, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 14)
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.mutedText)
  doc.text('Documento generado automáticamente • Interoperabilidad X-Road Colombia • SECURED BY X-ROAD PROTOCOL', 14, doc.internal.pageSize.getHeight() - 8)
}

// ─── Cover Page ──────────────────────────────────────────────
function buildCoverPage(doc, data) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFillColor(...COLORS.darkBg)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFillColor(...COLORS.secondary)
  doc.rect(0, 0, pageWidth, 8, 'F')
  doc.setFillColor(...COLORS.accent)
  doc.rect(0, 8, pageWidth, 3, 'F')

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(32)
  doc.text('INFORME DE INTEROPERABILIDAD', pageWidth / 2, 100, { align: 'center' })
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.accent)
  doc.text('Plataforma X-Road Colombia', pageWidth / 2, 115, { align: 'center' })

  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 - 40, 125, pageWidth / 2 + 40, 125)

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.mutedText)
  doc.text('Reporte Ejecutivo de Interoperabilidad • Dashboard General', pageWidth / 2, 138, { align: 'center' })

  const infoY = 160
  doc.setFillColor(...COLORS.darkCard)
  doc.roundedRect(pageWidth / 2 - 70, infoY, 140, 55, 3, 3, 'F')
  doc.setDrawColor(...COLORS.borderColor)
  doc.roundedRect(pageWidth / 2 - 70, infoY, 140, 55, 3, 3, 'S')

  doc.setFontSize(9)
  doc.setTextColor(...COLORS.mutedText)
  const infoItems = [
    `Total Entidades: ${data.kpis?.total_entities || 0}`,
    `Entidades Conectadas: ${data.kpis?.xroad_connected || 0}`,
    `Servicios Activos: ${data.kpis?.total_services || 0}`,
    `Madurez Promedio: ${data.kpis?.average_maturity_score || 0}%`,
    `Fecha de Generación: ${new Date(data.generatedAt).toLocaleDateString('es-CO')}`,
  ]
  infoItems.forEach((item, i) => {
    doc.text(`• ${item}`, pageWidth / 2 - 55, infoY + 10 + i * 9)
  })

  doc.setFillColor(...COLORS.accent)
  doc.rect(0, pageHeight - 11, pageWidth, 3, 'F')
  doc.setFillColor(...COLORS.secondary)
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F')
}

// ─── Executive Summary Page ──────────────────────────────────
function buildExecutiveSummary(doc, data) {
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('RESUMEN EJECUTIVO', 14, startY)

  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 100, startY + 3)

  doc.setFontSize(9)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(
    `El siguiente informe presenta un análisis detallado del estado actual de la interoperabilidad en la plataforma X-Road Colombia. A continuación se resumen los indicadores clave de rendimiento (KPIs) del ecosistema de interoperabilidad nacional.`,
    14, startY + 12, { maxWidth: 260 }
  )

  const kpiTableData = [
    ['Total de Entidades', String(data.kpis?.total_entities || 0), 'Entidades activas en plataforma'],
    ['Conectadas X-Road', String(data.kpis?.xroad_connected || 0), 'Interoperando actualmente'],
    ['Pendientes de Conexión', String(data.kpis?.xroad_pending || 0), 'En plan de onboarding'],
    ['No Conectadas', String(data.kpis?.xroad_not_connected || 0), 'Sin conexión X-Road'],
    ['Tasa de Conexión', `${data.kpis?.xroad_connection_rate || 0}%`, 'Cobertura nacional actual'],
    ['Servicios Activos', String(data.kpis?.total_services || 0), 'Servicios disponibles'],
    ['Madurez Promedio', `${data.kpis?.average_maturity_score || 0}%`, 'Nivel de capacidad estatal'],
  ]

  autoTable(doc, {
    startY: startY + 30,
    head: [['Indicador', 'Valor', 'Descripción']],
    body: kpiTableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 120 },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })
}

// ─── Distribution Charts Page ────────────────────────────────
function buildDistributionCharts(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('DISTRIBUCIÓN DEL ECOSISTEMA', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 120, startY + 3)

  // Sector Distribution
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.accent)
  doc.text('Distribución por Sector Económico', 14, startY + 18)

  const sectorTableData = (data.sectorData || []).map((s) => [
    s.sector || 'Sin sector',
    String(s.count || 0),
  ])

  autoTable(doc, {
    startY: startY + 24,
    head: [['Sector', 'Entidades']],
    body: sectorTableData.length > 0 ? sectorTableData : [['No hay datos', '0']],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })

  // X-Road Status
  const statusEndY = doc.lastAutoTable.finalY + 20
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.accent)
  doc.text('Estado de Conexión X-Road', 14, statusEndY)

  const statusLabels = { connected: 'Conectada', pending: 'Pendiente', not_connected: 'No conectada' }
  const statusTableData = (data.xroadStatus || []).map((s) => [
    statusLabels[s.status] || s.status,
    String(s.count || 0),
  ])

  autoTable(doc, {
    startY: statusEndY + 6,
    head: [['Estado de Conexión', 'Entidades']],
    body: statusTableData.length > 0 ? statusTableData : [['No hay datos', '0']],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })

  // Maturity Distribution
  const maturityEndY = doc.lastAutoTable.finalY + 20
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.accent)
  doc.text('Distribución de Niveles de Madurez', 14, maturityEndY)

  const maturityDist = data.kpis?.maturity_distribution || {}
  const maturityLabels = { 1: 'Nivel 1 - Inicial', 2: 'Nivel 2 - Básico', 3: 'Nivel 3 - Intermedio', 4: 'Nivel 4 - Avanzado' }
  const maturityTableData = [1, 2, 3, 4].map((level) => [
    maturityLabels[level] || `Nivel ${level}`,
    String(maturityDist[level] || 0),
  ])

  autoTable(doc, {
    startY: maturityEndY + 6,
    head: [['Nivel de Madurez', 'Entidades']],
    body: maturityTableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })
}

// ─── Entities Directory ──────────────────────────────────────
function buildEntitiesDirectory(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('DIRECTORIO DE ENTIDADES', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 110, startY + 3)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(`Total de entidades registradas: ${data.kpis?.total_entities || 0}`, 14, startY + 14)

  const entities = data.allEntities || []
  const sl = { connected: 'Conectada', pending: 'Pendiente', not_connected: 'No conectada' }

  const entitiesBySector = {}
  entities.forEach((e) => {
    const sector = e.sector_name || 'Sin sector'
    if (!entitiesBySector[sector]) entitiesBySector[sector] = []
    entitiesBySector[sector].push(e)
  })

  let currentY = startY + 22

  Object.entries(entitiesBySector).forEach(([sector, sectorEntities]) => {
    if (currentY > 240) {
      doc.addPage()
      addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
      currentY = 30
    }

    doc.setFontSize(10)
    doc.setTextColor(...COLORS.accent)
    doc.text(`SECTOR: ${sector.toUpperCase()}`, 14, currentY)
    currentY += 6

    const entityRows = sectorEntities.map((e) => [
      e.name || '',
      e.acronym || '—',
      e.nit || '—',
      e.department || 'Nacional',
      sl[e.xroad_status] || e.xroad_status || '—',
      e.maturity_level ? `Nivel ${e.maturity_level}` : 'No evaluado',
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Entidad', 'Sigla', 'NIT', 'Departamento', 'Estado X-Road', 'Madurez']],
      body: entityRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.headerBg,
        textColor: COLORS.lightText,
        fontStyle: 'bold',
        fontSize: 7,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: COLORS.lightText,
        fillColor: COLORS.darkCard,
      },
      alternateRowStyles: {
        fillColor: [20, 30, 50],
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      styles: {
        lineColor: COLORS.borderColor,
        lineWidth: 0.1,
      },
    })

    currentY = doc.lastAutoTable.finalY + 10
  })
}

// ─── Services Matrix ─────────────────────────────────────────
function buildServicesMatrix(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('MATRIZ DE SERVICIOS DE INTEROPERABILIDAD', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 160, startY + 3)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(`Total de servicios activos: ${data.kpis?.total_services || 0}`, 14, startY + 14)

  const services = data.services || []
  const serviceRows = services.map((s) => [
    s.name || '—',
    s.code || '—',
    s.entity_name || s.entity?.name || '—',
    s.protocol || '—',
    s.status || '—',
  ])

  autoTable(doc, {
    startY: startY + 22,
    head: [['Servicio', 'Código', 'Entidad', 'Protocolo', 'Estado']],
    body: serviceRows.length > 0 ? serviceRows : [['No hay servicios registrados', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
      overflow: 'ellipsis',
    },
  })

  // Summary by protocol
  const summaryEndY = doc.lastAutoTable.finalY + 20
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.accent)
  doc.text('Resumen de Servicios', 14, summaryEndY)

  const protocols = {}
  services.forEach((s) => {
    const p = s.protocol || 'Sin especificar'
    protocols[p] = (protocols[p] || 0) + 1
  })

  const protocolRows = Object.entries(protocols).map(([protocol, count]) => [protocol, String(count)])
  autoTable(doc, {
    startY: summaryEndY + 6,
    head: [['Protocolo', 'Cantidad de Servicios']],
    body: protocolRows.length > 0 ? protocolRows : [['Sin datos', '0']],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })
}

// ─── Maturity Evaluation ─────────────────────────────────────
function buildMaturityEvaluation(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('EVALUACIÓN DE MADUREZ', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 95, startY + 3)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(
    `Madurez promedio del ecosistema: ${data.kpis?.average_maturity_score || 0}% | Evaluaciones realizadas: ${data.maturityAssessments.length}`,
    14, startY + 14
  )

  // Top Mature Entities
  const topMature = data.topMature || []
  if (topMature.length > 0) {
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.success)
    doc.text('Entidades con Mayor Madurez', 14, startY + 28)

    const topRows = topMature.map((e, i) => [
      `#${i + 1}`,
      e.name || '',
      e.sector || '—',
      e.maturity_level ? `Nivel ${e.maturity_level}` : '—',
      `${e.maturity_score || 0}%`,
    ])

    autoTable(doc, {
      startY: startY + 34,
      head: [['#', 'Entidad', 'Sector', 'Nivel', 'Score']],
      body: topRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.success,
        textColor: COLORS.lightText,
        fontStyle: 'bold',
        fontSize: 7,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: COLORS.lightText,
        fillColor: COLORS.darkCard,
      },
      alternateRowStyles: {
        fillColor: [20, 30, 50],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
      },
      styles: {
        lineColor: COLORS.borderColor,
        lineWidth: 0.1,
      },
    })
  }

  // All Maturity Assessments
  const assessmentStartY = topMature.length > 0 ? doc.lastAutoTable.finalY + 15 : startY + 28

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.accent)
  doc.text('Registro Completo de Evaluaciones', 14, assessmentStartY)

  const mLevelLabels = { 1: 'Inicial', 2: 'Básico', 3: 'Intermedio', 4: 'Avanzado' }
  const assessments = data.maturityAssessments || []
  const assessmentRows = assessments.map((a) => [
    a.entity_name || a.entity?.name || `ID: ${a.entity_id}`,
    mLevelLabels[a.overall_level] || `Nivel ${a.overall_level}`,
    `${a.overall_score || 0}%`,
    a.assessment_date ? new Date(a.assessment_date).toLocaleDateString('es-CO') : '—',
    a.assessor_name || '—',
  ])

  autoTable(doc, {
    startY: assessmentStartY + 6,
    head: [['Entidad', 'Nivel Alcanzado', 'Score', 'Fecha', 'Auditor']],
    body: assessmentRows.length > 0 ? assessmentRows : [['No hay evaluaciones registradas', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })

  // Summary stats
  const statsEndY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.accent)
  doc.text('Resumen de Madurez', 14, statsEndY)

  const byLevel = { 1: 0, 2: 0, 3: 0, 4: 0 }
  assessments.forEach((a) => {
    const level = a.overall_level
    if (level >= 1 && level <= 4) byLevel[level]++
  })

  autoTable(doc, {
    startY: statsEndY + 6,
    head: [['Nivel', 'Cantidad de Entidades', 'Porcentaje']],
    body: [1, 2, 3, 4].map((level) => [
      `Nivel ${level} - ${mLevelLabels[level]}`,
      String(byLevel[level]),
      assessments.length > 0 ? `${((byLevel[level] / assessments.length) * 100).toFixed(1)}%` : '0%',
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.lightText,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.lightText,
      fillColor: COLORS.darkCard,
    },
    alternateRowStyles: {
      fillColor: [20, 30, 50],
    },
    styles: {
      lineColor: COLORS.borderColor,
      lineWidth: 0.1,
    },
  })
}

// ─── Onboarding Roadmap ──────────────────────────────────────
function buildOnboardingRoadmap(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('RUTA DE INTEGRACIÓN (ONBOARDING)', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 130, startY + 3)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.mutedText)
  doc.text(`Entidades pendientes de conexión: ${data.kpis?.xroad_pending || 0}`, 14, startY + 14)

  const pendingEntities = (data.allEntities || []).filter((e) => e.xroad_status === 'pending')

  const pendingRows = pendingEntities.map((e) => {
    const level = e.maturity_level || 1
    const etaMap = { 4: 'T2 2026', 3: 'T3 2026', 2: 'T4 2026', 1: '2027' }
    const status = level >= 3 ? 'En Proceso' : 'Pendiente'
    return [
      e.name || '',
      e.department || 'Nacional',
      status,
      etaMap[level] || '2027',
    ]
  })

  if (pendingRows.length > 0) {
    autoTable(doc, {
      startY: startY + 22,
      head: [['Entidad', 'Departamento', 'Estado', 'ETA']],
      body: pendingRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.warning,
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.lightText,
        fillColor: COLORS.darkCard,
      },
      alternateRowStyles: {
        fillColor: [20, 30, 50],
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
      },
      styles: {
        lineColor: COLORS.borderColor,
        lineWidth: 0.1,
      },
    })
  } else {
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.success)
    doc.text('✓ No hay entidades pendientes de integración en este momento.', 14, startY + 35)
  }

  // Network section
  const networkEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 50
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.accent)
  doc.text('RED DE INTERCONEXIÓN X-ROAD', 14, networkEndY)
  doc.setDrawColor(...COLORS.borderColor)
  doc.setLineWidth(0.1)
  doc.line(14, networkEndY + 3, 200, networkEndY + 3)

  doc.setFontSize(8)
  doc.setTextColor(...COLORS.mutedText)

  const relData = data.relationshipsData || {}
  const nodeCount = relData.nodes?.length || 0
  const linkCount = relData.links?.length || 0
  doc.text(`La red de interoperabilidad está compuesta por ${nodeCount} nodos activos y ${linkCount} conexiones establecidas.`, 14, networkEndY + 12, { maxWidth: 260 })

  if (linkCount > 0 && nodeCount > 0) {
    const topConnected = {}
    relData.links.forEach((link) => {
      const source = typeof link.source === 'object' ? (link.source.name || link.source.id) : link.source
      const target = typeof link.target === 'object' ? (link.target.name || link.target.id) : link.target
      topConnected[source] = (topConnected[source] || 0) + 1
      topConnected[target] = (topConnected[target] || 0) + 1
    })

    const sortedNodes = Object.entries(topConnected)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)

    if (sortedNodes.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.accent)
      doc.text('Nodos más interconectados', 14, networkEndY + 30)

      autoTable(doc, {
        startY: networkEndY + 35,
        head: [['Entidad', 'Conexiones']],
        body: sortedNodes.map(([name, count]) => [String(name), String(count)]),
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.headerBg,
          textColor: COLORS.lightText,
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: {
          fontSize: 7,
          textColor: COLORS.lightText,
          fillColor: COLORS.darkCard,
        },
        alternateRowStyles: {
          fillColor: [20, 30, 50],
        },
        styles: {
          lineColor: COLORS.borderColor,
          lineWidth: 0.1,
        },
      })
    }
  }
}

// ─── Final Notes ─────────────────────────────────────────────
function buildFinalNotes(doc, data) {
  doc.addPage()
  addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
  const startY = 30

  doc.setTextColor(...COLORS.lightText)
  doc.setFontSize(16)
  doc.text('NOTAS TÉCNICAS Y LEGALES', 14, startY)
  doc.setDrawColor(...COLORS.accent)
  doc.setLineWidth(0.3)
  doc.line(14, startY + 3, 105, startY + 3)

  const notes = [
    {
      title: 'FUENTE DE DATOS',
      body: 'Los datos presentados en este informe son obtenidos directamente de la plataforma X-Road Colombia a través de sus APIs de interoperabilidad. La información es actualizada en tiempo real y refleja el estado actual del ecosistema.',
    },
    {
      title: 'MARCO NORMATIVO',
      body: 'Este informe se rige bajo el Marco de Interoperabilidad del Gobierno de Colombia (MinTIC) y las directrices de la Política de Gobierno Digital, Decreto 620 de 2020 y demás normativa aplicable.',
    },
    {
      title: 'EVALUACIÓN DE MADUREZ',
      body: 'La evaluación de madurez se realiza siguiendo los lineamientos del Marco de Interoperabilidad, evaluando cuatro dominios: Legal, Organizacional, Semántico y Técnico.',
    },
    {
      title: 'SEGURIDAD',
      body: 'Toda la información transmitida a través de la plataforma X-Road es cifrada y firmada digitalmente. Los accesos al sistema son registrados y auditados.',
    },
    {
      title: 'ACTUALIZACIÓN',
      body: 'Este informe se genera dinámicamente y refleja los datos más recientes disponibles en la plataforma. Se recomienda generar un nuevo informe periódicamente.',
    },
  ]

  let currentY = startY + 18
  notes.forEach((note) => {
    if (currentY > 240) {
      doc.addPage()
      addHeaderFooter(doc, data, doc.internal.getCurrentPageInfo().pageNumber)
      currentY = 35
    }

    doc.setFillColor(...COLORS.darkCard)
    doc.roundedRect(14, currentY, 260, 30, 3, 3, 'F')
    doc.setDrawColor(...COLORS.borderColor)
    doc.roundedRect(14, currentY, 260, 30, 3, 3, 'S')

    doc.setFontSize(9)
    doc.setTextColor(...COLORS.accent)
    doc.text(note.title, 20, currentY + 7)

    doc.setFontSize(7)
    doc.setTextColor(...COLORS.mutedText)
    doc.text(note.body, 20, currentY + 15, { maxWidth: 245 })

    currentY += 36
  })
}

// ─── Main Export Function ────────────────────────────────────
export async function exportComprehensivePDF(onProgress) {
  const status = (msg) => {
    if (onProgress) onProgress(msg)
  }

  const controller = new AbortController()

  try {
    status('Recopilando datos del ecosistema...')
    const data = await fetchAllReportData(controller.signal)

    status('Generando documento PDF...')
    const doc = new jsPDF('p', 'mm', 'a4')

    // 1. Cover Page
    buildCoverPage(doc, data)

    // 2. Executive Summary
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildExecutiveSummary(doc, data)

    // 3. Distribution Charts
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildDistributionCharts(doc, data)

    // 4. Entities Directory
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildEntitiesDirectory(doc, data)

    // 5. Services Matrix
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildServicesMatrix(doc, data)

    // 6. Maturity Evaluation
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildMaturityEvaluation(doc, data)

    // 7. Onboarding Roadmap & Network
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildOnboardingRoadmap(doc, data)

    // 8. Final Notes
    doc.addPage()
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    buildFinalNotes(doc, data)

    status('Finalizando documento...')
    const filename = `informe_interoperabilidad_xroad_${new Date().toISOString().slice(0, 10)}.pdf`

    // Fallback robusto de descarga para entornos/navegadores donde doc.save puede fallar
    try {
      doc.save(filename)
    } catch {
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    }

    status('') // Clear status
    return { success: true, filename }
  } catch (err) {
    if (err.name === 'AbortError') {
      status('')
      return { success: false, error: 'Operación cancelada' }
    }
    status(`Error: ${err.message}`)
    console.error('Error generando PDF:', err)
    throw err
  }
}

export default exportComprehensivePDF