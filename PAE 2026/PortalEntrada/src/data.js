import { Map, Gauge, Users, BellRing } from 'lucide-react'

// URLs de cada módulo: configurables con VITE_INTEROP_URL / VITE_GOVSTAKE_URL
// (en producción apuntan a los frontends desplegados; en local, a los puertos de Vite)
export const MODULES = {
  interop: {
    tone: 'interop',
    tag: 'MÓDULO 01',
    title: 'X-ROAD COLOMBIA',
    name: 'Interoperabilidad',
    description:
      'Visor de interoperabilidad del Estado: mapa geográfico, madurez MinTIC, análisis con IA y reportes.',
    url: import.meta.env.VITE_INTEROP_URL || 'http://localhost:5173',
    accent: '#a78bfa',
  },
  govstake: {
    tone: 'govstake',
    tag: 'MÓDULO 02',
    title: 'GOVSTAKE 360',
    name: 'Gestión de actores',
    description:
      'Caracterización y seguimiento de grupos de interés públicos: matriz, alertas tempranas y compromisos.',
    url: import.meta.env.VITE_GOVSTAKE_URL || 'http://localhost:3002',
    accent: '#f472b6',
  },
}

export const FEATURES = [
  {
    n: '01',
    tone: 'interop',
    tag: 'INTEROP',
    title: 'Mapa vivo del territorio',
    text: '127 entidades públicas georreferenciadas con su estado de conexión a X-Road, sus sectores y sus servicios.',
    icon: Map,
  },
  {
    n: '02',
    tone: 'interop',
    tag: 'INTEROP',
    title: 'Madurez según MinTIC',
    text: 'Cuatro dominios —legal, organizacional, semántico y técnico— sintetizados en un índice nacional de 0 a 5.',
    icon: Gauge,
  },
  {
    n: '03',
    tone: 'govstake',
    tag: 'GOVSTAKE',
    title: 'Actores públicos 360°',
    text: 'Caracterización de 10 tipos de actores con 10 variables de análisis y un mapa de poder, legitimidad e influencia.',
    icon: Users,
  },
  {
    n: '04',
    tone: 'govstake',
    tag: 'GOVSTAKE',
    title: 'Alertas tempranas',
    text: 'Detecta riesgo de conflicto, cambios de posición y baja participación antes de que se conviertan en crisis.',
    icon: BellRing,
  },
]