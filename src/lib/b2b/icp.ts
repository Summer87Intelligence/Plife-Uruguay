import type { CampaignType } from '@/types/database'

export type ICPKey =
  | 'duenos_pymes'
  | 'socios_directores'
  | 'estudios_contables'
  | 'estudios_juridicos'
  | 'clinicas'
  | 'empresas_tech'
  | 'constructoras'
  | 'clubes_asociaciones'
  | 'ejecutivos'
  | 'reclutamiento_asesores'

export interface ICP {
  key: ICPKey
  nombre: string
  descripcion: string
  dolores: string[]
  angulo_comercial: string
  contacto_ideal: string
  objeciones: string[]
  campaña_recomendada: CampaignType
  señales_positivas: string[]
  señales_riesgo: string[]
  industrias_relacionadas: string[]
}

export const ICP_DATA: Record<ICPKey, ICP> = {
  duenos_pymes: {
    key: 'duenos_pymes',
    nombre: 'Dueños de pymes',
    descripcion: 'Propietarios y gerentes de pequeñas y medianas empresas con entre 5 y 50 empleados.',
    dolores: [
      'El negocio depende de ellos personalmente',
      'Sin plan de continuidad si fallecen o quedan incapacitados',
      'Mezcla de finanzas personales y del negocio',
      'No tienen acceso a beneficios estructurados como las grandes empresas',
    ],
    angulo_comercial: 'Protección del patrimonio familiar y continuidad del negocio ante imprevistos del dueño.',
    contacto_ideal: 'Dueño, gerente general o socio administrador',
    objeciones: ['Ya tengo seguro', 'No es el momento', 'Es caro', 'Tengo que hablarlo con mi socio'],
    campaña_recomendada: 'duenos_pymes',
    señales_positivas: [
      'Empresa con más de 5 años de antigüedad',
      'Dueño con familia a cargo',
      'Negocio en crecimiento o con empleados clave',
      'Sin plan de sucesión formal',
    ],
    señales_riesgo: [
      'Negocio estacional o con ingresos variables',
      'Múltiples socios sin acuerdo previo',
      'Sector con márgenes ajustados',
    ],
    industrias_relacionadas: ['comercio', 'retail', 'servicios', 'distribución', 'gastronóm', 'logístic'],
  },

  socios_directores: {
    key: 'socios_directores',
    nombre: 'Socios y directores de empresas',
    descripcion: 'Socios fundadores o directores de empresas familiares o de capital privado con 10 a 100 empleados.',
    dolores: [
      'Riesgo de pérdida del socio clave',
      'Conflictos sucesorios sin respaldar legalmente',
      'Ausencia de beneficios para el equipo directivo',
      'Exposición personal ante obligaciones de la empresa',
    ],
    angulo_comercial: 'Plan de continuidad para la sociedad y protección cruzada entre socios.',
    contacto_ideal: 'Socio fundador, presidente o director general',
    objeciones: ['Tenemos abogado que lo maneja', 'No es prioridad ahora', 'Ya tenemos acuerdos entre socios'],
    campaña_recomendada: 'empresas_familiares',
    señales_positivas: [
      'Empresa con dos o más socios',
      'Segunda generación involucrada',
      'Activos significativos en el negocio',
      'Empresa familiar consolidada',
    ],
    señales_riesgo: [
      'Conflictos previos entre socios',
      'Empresa en reestructuración',
      'Alta dependencia de un solo cliente',
    ],
    industrias_relacionadas: ['familiar', 'empresa familiar', 'holding', 'grupo', 'hermanos'],
  },

  estudios_contables: {
    key: 'estudios_contables',
    nombre: 'Estudios contables',
    descripcion: 'Estudios con 3 a 30 profesionales que gestionan la contabilidad y finanzas de pymes.',
    dolores: [
      'Socios sin protección individual adecuada',
      'Equipo profesional sin beneficios estructurados',
      'Dependencia alta del estudio en los socios clave',
      'Clientes que preguntan sobre protección y ellos no tienen respuesta',
    ],
    angulo_comercial: 'Proteger a los socios del estudio y ofrecer PLIFE como solución para sus clientes pyme.',
    contacto_ideal: 'Socio fundador o contador principal',
    objeciones: ['Ya trabajamos con un corredor', 'Nuestros clientes no lo piden', 'No es lo nuestro'],
    campaña_recomendada: 'estudios_contables',
    señales_positivas: [
      'Cartera activa de clientes pymes',
      'Socios con más de 10 años de trayectoria',
      'Equipo propio (no solo socios)',
      'Interés en agregar valor a clientes',
    ],
    señales_riesgo: [
      'Estudio unipersonal con un solo contador',
      'Trabajo principalmente con personas físicas',
      'Relación ya establecida con corredor competidor',
    ],
    industrias_relacionadas: ['contable', 'contador', 'auditor', 'estudio', 'asesoría contable'],
  },

  estudios_juridicos: {
    key: 'estudios_juridicos',
    nombre: 'Estudios jurídicos',
    descripcion: 'Estudios de abogados con 2 a 20 profesionales especializados en derecho civil, comercial o laboral.',
    dolores: [
      'Socios sin plan de continuidad ante ausencia imprevista',
      'Alta dependencia en uno o dos abogados clave',
      'Equipo profesional sin beneficios de largo plazo',
      'Clientes corporativos que preguntan sobre protección patrimonial',
    ],
    angulo_comercial: 'Protección de socios del estudio y derivación de clientes que requieran planificación patrimonial.',
    contacto_ideal: 'Socio director o abogado principal',
    objeciones: ['No es el momento', 'Tenemos gestor propio', 'Lo vemos en otra oportunidad'],
    campaña_recomendada: 'estudios_juridicos',
    señales_positivas: [
      'Cartera de clientes corporativos',
      'Dos o más socios activos',
      'Práctica en derecho societario o sucesiones',
      'Manejo de patrimonios familiares',
    ],
    señales_riesgo: [
      'Solo práctica en derecho penal o público',
      'Estudio muy pequeño (1 abogado)',
      'Sin clientes empresariales',
    ],
    industrias_relacionadas: ['jurídic', 'juridic', 'legal', 'abogad', 'derecho', 'notaria', 'escribanía'],
  },

  clinicas: {
    key: 'clinicas',
    nombre: 'Clínicas y profesionales de salud',
    descripcion: 'Clínicas, centros de salud y grupos médicos con personal propio entre 10 y 200 profesionales.',
    dolores: [
      'Alta rotación del personal médico',
      'Profesionales que valoran beneficios diferenciales',
      'Sin plan de retención estructurado para el equipo',
      'Riesgo institucional ante ausencia de médicos clave',
    ],
    angulo_comercial: 'Plan de beneficios como herramienta de retención y diferenciación del equipo médico.',
    contacto_ideal: 'Director médico, gerente administrativo o jefe de RRHH',
    objeciones: ['El personal es tercerizado', 'Ya damos beneficios', 'Lo maneja administración central'],
    campaña_recomendada: 'clinicas',
    señales_positivas: [
      'Plantilla propia (no solo guardia)',
      'Centro en crecimiento o nueva sede',
      'Personal fijo con contrato',
      'Clínica privada con foco en calidad',
    ],
    señales_riesgo: [
      'Personal mayoritariamente tercerizado',
      'Clínica mutual con procesos muy estandarizados',
      'Sin presupuesto para beneficios',
    ],
    industrias_relacionadas: ['salud', 'clínica', 'clinica', 'médic', 'medic', 'hospital', 'odontolog', 'centro de salud'],
  },

  empresas_tech: {
    key: 'empresas_tech',
    nombre: 'Empresas tech',
    descripcion: 'Startups, software factories y empresas de tecnología con 15 a 120 empleados.',
    dolores: [
      'Alta rotación de talento técnico',
      'Competencia con empresas internacionales en beneficios',
      'Necesidad de diferenciarse para atraer perfiles senior',
      'Fundadores sin protección personal adecuada',
    ],
    angulo_comercial: 'Beneficios de protección como diferencial para retener y atraer talento técnico.',
    contacto_ideal: 'CEO, CTO, responsable de People/RRHH o socio fundador',
    objeciones: ['Ya tenemos beneficios', 'Lo ve la gente de People', 'No es prioridad', 'Somos remote-first'],
    campaña_recomendada: 'empresas_tech',
    señales_positivas: [
      'Empresa en crecimiento de headcount',
      'Equipo mixto local e internacional',
      'Beneficios actuales percibidos como insuficientes',
      'Fundadores con perfil consultivo',
    ],
    señales_riesgo: [
      'Startup pre-revenue sin presupuesto',
      'Equipo 100% contratistas sin relación de dependencia',
      'Empresa en proceso de restructuración',
    ],
    industrias_relacionadas: ['tech', 'software', 'tecnolog', 'digital', 'desarrollo', 'it ', 'startup', 'saas', 'ecommerc'],
  },

  constructoras: {
    key: 'constructoras',
    nombre: 'Constructoras e inmobiliarias',
    descripcion: 'Empresas de construcción, inmobiliarias y desarrolladoras con 10 a 100 empleados.',
    dolores: [
      'Alta exposición al riesgo de los socios y directivos',
      'Personal de obra sin beneficios estructurados',
      'Proyectos de largo plazo que dependen de los dueños',
      'Estacionalidad del negocio',
    ],
    angulo_comercial: 'Protección de los socios y continuidad de la empresa ante imprevistos durante proyectos en curso.',
    contacto_ideal: 'Dueño, director comercial o gerente de obra',
    objeciones: ['Tenemos ART que cubre todo', 'No es el momento del año', 'El negocio va por etapas'],
    campaña_recomendada: 'constructoras',
    señales_positivas: [
      'Empresa con proyectos de largo plazo activos',
      'Socios con patrimonio vinculado a la empresa',
      'Personal propio (no solo subcontratados)',
      'Empresa familiar con segunda generación',
    ],
    señales_riesgo: [
      'Negocio con alta estacionalidad',
      'Solo subcontratistas, sin personal propio',
      'Margen del negocio ajustado',
    ],
    industrias_relacionadas: ['construc', 'inmobiliar', 'desarrollador', 'real estate', 'arquitect', 'obra'],
  },

  clubes_asociaciones: {
    key: 'clubes_asociaciones',
    nombre: 'Clubes y asociaciones',
    descripcion: 'Clubes deportivos, asociaciones profesionales, gremios y cámaras con membresía activa.',
    dolores: [
      'Asociados sin beneficio colectivo de valor',
      'Membresía sin diferencial claro respecto a otros clubes',
      'Directiva sin protección institucional',
      'Presupuesto limitado para invertir en beneficios',
    ],
    angulo_comercial: 'Beneficio colectivo para asociados como diferencial de valor de la membresía.',
    contacto_ideal: 'Presidente, secretario general o responsable de membresía',
    objeciones: ['Los socios no lo pedirían', 'Es una decisión de asamblea', 'No tenemos presupuesto'],
    campaña_recomendada: 'clubes_asociaciones',
    señales_positivas: [
      'Base de socios activa y creciente',
      'Directiva comprometida con el valor de la membresía',
      'Club con socios de perfil profesional o empresarial',
      'Historia de beneficios colectivos previos',
    ],
    señales_riesgo: [
      'Proceso de decisión por asamblea (ciclo muy largo)',
      'Membresia pequeña o inactiva',
      'Institución sin tradición de beneficios',
    ],
    industrias_relacionadas: ['club', 'asociaci', 'gremio', 'cámara', 'sindicat', 'deportiv', 'gimnasio', 'fitness', 'bienestar'],
  },

  ejecutivos: {
    key: 'ejecutivos',
    nombre: 'Ejecutivos y mandos medios',
    descripcion: 'Gerentes, directores y mandos medios de empresas medianas y grandes con ingresos altos.',
    dolores: [
      'Ingresos altos sin protección personal proporcional',
      'Beneficios corporativos insuficientes ante necesidades personales',
      'Desprotección familiar ante ausencia imprevista',
      'Sin planificación patrimonial de largo plazo',
    ],
    angulo_comercial: 'Protección personal y familiar proporcional a su nivel de ingresos y responsabilidad.',
    contacto_ideal: 'El mismo ejecutivo (decisión personal)',
    objeciones: ['Ya tengo los beneficios de la empresa', 'Lo veo cuando me jubile', 'No tengo tiempo ahora'],
    campaña_recomendada: 'ejecutivos',
    señales_positivas: [
      'Ingresos variables significativos (bonos, comisiones)',
      'Familia con hijos dependientes',
      'Edad entre 35 y 55 años',
      'Interés en planificación financiera',
    ],
    señales_riesgo: [
      'Empresa con beneficios corporativos muy completos',
      'Ejecutivo próximo a cambio de trabajo',
      'Sin familia a cargo',
    ],
    industrias_relacionadas: ['ejecutiv', 'gerenc', 'director', 'mando medio'],
  },

  reclutamiento_asesores: {
    key: 'reclutamiento_asesores',
    nombre: 'Reclutamiento de asesores',
    descripcion: 'Profesionales con perfil comercial que podrían sumarse a la red de asesores PLIFE.',
    dolores: [
      'Techo de ingresos en empleo relación de dependencia',
      'Falta de autonomía e independencia profesional',
      'Buscan trabajo con propósito y de impacto',
      'Experiencia comercial sin canal claro donde aplicarla',
    ],
    angulo_comercial: 'Propuesta de carrera independiente con ingresos por desempeño y acompañamiento de PLIFE.',
    contacto_ideal: 'El candidato directamente (perfil comercial o consultor)',
    objeciones: ['No tengo experiencia en seguros', 'No quiero vender', '¿Cuánto se gana?', '¿Cuánto tengo que invertir?'],
    campaña_recomendada: 'reclutamiento_asesores',
    señales_positivas: [
      'Experiencia en ventas consultivas',
      'Red de contactos empresarial',
      'Vocación de servicio y asesoramiento',
      'Interés en independencia laboral',
    ],
    señales_riesgo: [
      'Sin red de contactos inicial',
      'Expectativa de ingreso fijo inmediato',
      'Sin experiencia comercial previa',
    ],
    industrias_relacionadas: ['asesor', 'consultor', 'vendedor', 'comercial', 'agente'],
  },
}

export function detectICP(industry: string | null): ICPKey {
  if (!industry) return 'duenos_pymes'
  const lower = industry.toLowerCase()

  if (lower.includes('salud') || lower.includes('clínica') || lower.includes('clinica') ||
      lower.includes('médic') || lower.includes('medic') || lower.includes('hospital') ||
      lower.includes('odontolog') || lower.includes('farmac')) return 'clinicas'

  if (lower.includes('contable') || lower.includes('contador') || lower.includes('auditor') ||
      lower.includes('asesoría contable')) return 'estudios_contables'

  if (lower.includes('jurídic') || lower.includes('juridic') || lower.includes('legal') ||
      lower.includes('abogad') || lower.includes('notaria') || lower.includes('escribanía')) return 'estudios_juridicos'

  if (lower.includes('tech') || lower.includes('software') || lower.includes('tecnolog') ||
      lower.includes('digital') || lower.includes('startup') || lower.includes('saas') ||
      lower.includes('ecommerc') || lower.includes('desarrollo')) return 'empresas_tech'

  if (lower.includes('construc') || lower.includes('inmobiliar') || lower.includes('real estate') ||
      lower.includes('desarrollador') || lower.includes('obra')) return 'constructoras'

  if (lower.includes('gimnasio') || lower.includes('fitness') || lower.includes('bienestar') ||
      lower.includes('club') || lower.includes('deportiv') || lower.includes('asociaci') ||
      lower.includes('gremio') || lower.includes('cámara') || lower.includes('camara')) return 'clubes_asociaciones'

  if (lower.includes('familiar') || lower.includes('familia') || lower.includes('sociedad') ||
      lower.includes('holding') || lower.includes('grupo') || lower.includes('hermanos')) return 'socios_directores'

  return 'duenos_pymes'
}

export function getICP(key: ICPKey): ICP {
  return ICP_DATA[key]
}

export const ICP_NOMBRES: Record<ICPKey, string> = Object.fromEntries(
  Object.entries(ICP_DATA).map(([k, v]) => [k, v.nombre])
) as Record<ICPKey, string>
