export const ROUTES = {
  login: '/login',
  hoy: '/app/hoy',
  demo: '/app/demo',
  radarB2B: '/app/radar-b2b',
  empresas: '/app/empresas',
  contactos: '/app/contactos',
  oportunidades: '/app/oportunidades',
  campanas: '/app/campanas',
  copiloto: '/app/copiloto',
  compliance: '/app/compliance',
  conocimiento: '/app/conocimiento',
  direccion: '/app/direccion',
  admin: '/app/admin',
  adminSystem: '/app/admin/system',
} as const

export type AppRoute = typeof ROUTES[keyof typeof ROUTES]
