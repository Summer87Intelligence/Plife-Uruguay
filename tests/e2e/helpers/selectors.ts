// Stable selectors by role/text — avoid brittle CSS class selectors.
export const SEL = {
  // Auth
  emailInput: 'Email',
  passwordInput: 'Contraseña',
  loginButton: /ingresar/i,
  loginHeading: /iniciar sesión/i,

  // Dashboard
  dashboardHeading: /Vista de Dirección/i,
  demoRecorrido: /Recorrido sugerido para la demo/i,
  statOpps: /Oportunidades activas/i,
  statCompanies: /Empresas B2B/i,
  statCampaigns: /Campañas activas/i,

  // Radar B2B
  radarHeading: /Radar B2B/i,

  // Knowledge
  knowledgeHeading: /base de conocimiento|documentos/i,

  // Admin System
  systemHeading: /Estado del Sistema/i,

  // Generic error signals (should NOT appear)
  internalServerError: /Internal Server Error/i,
  missingProfile: /Cuenta sin perfil/i,
  tooManyRedirects: /ERR_TOO_MANY_REDIRECTS/i,
} as const
