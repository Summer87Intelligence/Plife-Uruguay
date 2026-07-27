export const ROUTES = {
  login: '/login',
  hoy: '/app/hoy',
  leads: '/app/leads',
  leadsNew: '/app/leads/new',
  pipeline: '/app/pipeline',
  demo: '/app/demo',
  radarB2B: '/app/radar-b2b',
  empresas: '/app/empresas',
  contactos: '/app/contactos',
  oportunidades: '/app/oportunidades',
  campanas: '/app/campanas',
  copiloto: '/app/copiloto',
  conocimiento: '/app/conocimiento',
  propuestas: '/app/propuestas',
  propuestasNueva: '/app/propuestas/nueva',
  direccion: '/app/direccion',
  admin: '/app/admin',
  adminSystem: '/app/admin/system',
} as const

export type AppRoute = typeof ROUTES[keyof typeof ROUTES]
