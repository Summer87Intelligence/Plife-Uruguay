/**
 * Pools de datos plausibles para el universo mock de la demo comercial.
 * Nombres de empresas ficticios pero verosímiles para Uruguay; aseguradoras
 * reales del mercado; nombres de persona comunes en Uruguay.
 *
 * La lógica de generación (tiers de cuenta, madurez, relaciones) vive en
 * ./universe.ts — este archivo es solo "materia prima" plausible + reglas
 * de afinidad (rubro → ramo, participación de mercado).
 */

export const NOMBRES = [
  'Lucía', 'Martín', 'Valentina', 'Federico', 'Camila', 'Rodrigo', 'Sofía', 'Nicolás',
  'Agustina', 'Gonzalo', 'Florencia', 'Diego', 'Mariana', 'Ignacio', 'Victoria', 'Pablo',
  'Carolina', 'Andrés', 'Josefina', 'Sebastián', 'Antonella', 'Matías', 'Belén', 'Álvaro',
  'Daniela', 'Juan Pablo', 'Rocío', 'Emiliano', 'Natalia', 'Bruno',
] as const

export const APELLIDOS = [
  'García', 'Pérez', 'Rodríguez', 'Fernández', 'Bianchi', 'Silva', 'Ferreira', 'Machado',
  'Deleón', 'Pintos', 'Ríos', 'Ortiz', 'Correa', 'Suárez', 'Acosta', 'Bentancor',
  'Cabrera', 'Gómez', 'Larrosa', 'Methol', 'Núñez', 'Olivera', 'Píriz', 'Quiroga',
  'Rivero', 'Sosa', 'Techera', 'Umpiérrez', 'Varela', 'Zunino',
] as const

export const DEPARTAMENTOS = [
  'Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'San José', 'Paysandú', 'Salto', 'Rivera',
] as const

/** Para nombres tipo "Transportes del Sur", "Constructora del Litoral". */
export const PUNTOS_CARDINALES = ['Norte', 'Sur', 'Este', 'Oeste', 'Litoral', 'Centro'] as const

export type SectorKey =
  | 'comercio' | 'servicios_profesionales' | 'salud' | 'industria' | 'transporte'
  | 'construccion' | 'agro' | 'tecnologia' | 'educacion' | 'hoteleria' | 'inmobiliaria' | 'clubes'

interface CompanyTemplate {
  name: string
  industry: string
  campaignType: string
  sector: SectorKey
}

const INDUSTRY_TO_SECTOR: Record<string, SectorKey> = {
  'Estudio contable': 'servicios_profesionales',
  'Estudio jurídico': 'servicios_profesionales',
  'Servicios profesionales': 'servicios_profesionales',
  'Salud': 'salud',
  'Construcción': 'construccion',
  'Transporte y logística': 'transporte',
  'Comercio': 'comercio',
  'Administración de edificios': 'inmobiliaria',
  'Tecnología': 'tecnologia',
  'Clubes y asociaciones': 'clubes',
  'Industria alimenticia': 'industria',
  'Industria': 'industria',
  'Industria textil': 'industria',
  'Agropecuario': 'agro',
  'Turismo y hotelería': 'hoteleria',
}

/**
 * Las 41 empresas curadas a mano (nombres ya usados/validados en capturas
 * previas). Se completan hasta 120 con generación por sector — ver
 * SECTOR_DEFS y buildCompanyTemplates() en universe.ts.
 */
const EMPRESA_TEMPLATES_BASE: { name: string; industry: string; campaignType: string }[] = [
  { name: 'Estudio Contable Deleón & Asociados', industry: 'Estudio contable', campaignType: 'estudios_contables' },
  { name: 'Contadores Rivero Hnos.', industry: 'Estudio contable', campaignType: 'estudios_contables' },
  { name: 'Estudio Techera Auditores', industry: 'Estudio contable', campaignType: 'estudios_contables' },
  { name: 'Bentancor Consultores Tributarios', industry: 'Estudio contable', campaignType: 'estudios_contables' },
  { name: 'Estudio Jurídico Bianchi', industry: 'Estudio jurídico', campaignType: 'estudios_juridicos' },
  { name: 'Ferreira & Umpiérrez Abogados', industry: 'Estudio jurídico', campaignType: 'estudios_juridicos' },
  { name: 'Estudio Notarial Cabrera', industry: 'Estudio jurídico', campaignType: 'estudios_juridicos' },
  { name: 'Clínica Nova Salud', industry: 'Salud', campaignType: 'clinicas' },
  { name: 'Centro Médico Del Parque', industry: 'Salud', campaignType: 'clinicas' },
  { name: 'Instituto Odontológico Sosa', industry: 'Salud', campaignType: 'clinicas' },
  { name: 'Sanatorio Costa Azul', industry: 'Salud', campaignType: 'clinicas' },
  { name: 'Constructora del Este', industry: 'Construcción', campaignType: 'constructoras' },
  { name: 'Edificar S.A.', industry: 'Construcción', campaignType: 'constructoras' },
  { name: 'Machado Obras Civiles', industry: 'Construcción', campaignType: 'constructoras' },
  { name: 'Grupo Constructor Litoral', industry: 'Construcción', campaignType: 'constructoras' },
  { name: 'Transportes del Litoral', industry: 'Transporte y logística', campaignType: 'duenos_pymes' },
  { name: 'Logística Sur SRL', industry: 'Transporte y logística', campaignType: 'duenos_pymes' },
  { name: 'Distribuidora Acosta', industry: 'Transporte y logística', campaignType: 'duenos_pymes' },
  { name: 'Panadería Los Aromos', industry: 'Comercio', campaignType: 'duenos_pymes' },
  { name: 'Comercial Andes', industry: 'Comercio', campaignType: 'duenos_pymes' },
  { name: 'Supermercado Varela e Hijos', industry: 'Comercio', campaignType: 'duenos_pymes' },
  { name: 'Ferretería Núñez', industry: 'Comercio', campaignType: 'duenos_pymes' },
  { name: 'Hogar Compartido S.A.', industry: 'Administración de edificios', campaignType: 'duenos_pymes' },
  { name: 'Consorcio Torres del Puerto', industry: 'Administración de edificios', campaignType: 'duenos_pymes' },
  { name: 'Óptica Central', industry: 'Comercio', campaignType: 'duenos_pymes' },
  { name: 'Zunino Tecnología', industry: 'Tecnología', campaignType: 'empresas_tech' },
  { name: 'Softlab Uruguay', industry: 'Tecnología', campaignType: 'empresas_tech' },
  { name: 'Datacore Sistemas', industry: 'Tecnología', campaignType: 'empresas_tech' },
  { name: 'Club Náutico Carrasco', industry: 'Clubes y asociaciones', campaignType: 'clubes_asociaciones' },
  { name: 'Asociación Civil Los Fresnos', industry: 'Clubes y asociaciones', campaignType: 'clubes_asociaciones' },
  { name: 'Club Social Paysandú', industry: 'Clubes y asociaciones', campaignType: 'clubes_asociaciones' },
  { name: 'Píriz Consultora de RRHH', industry: 'Servicios profesionales', campaignType: 'profesionales_independientes' },
  { name: 'Larrosa & Olivera Consultores', industry: 'Servicios profesionales', campaignType: 'profesionales_independientes' },
  { name: 'Estudio de Arquitectura Quiroga', industry: 'Servicios profesionales', campaignType: 'profesionales_independientes' },
  { name: 'Frigorífico Del Este', industry: 'Industria alimenticia', campaignType: 'duenos_pymes' },
  { name: 'Curtiembre Nacional', industry: 'Industria', campaignType: 'duenos_pymes' },
  { name: 'Textiles Montevideo', industry: 'Industria textil', campaignType: 'duenos_pymes' },
  { name: 'Agropecuaria Santa Rosa', industry: 'Agropecuario', campaignType: 'duenos_pymes' },
  { name: 'Estancia Los Talas', industry: 'Agropecuario', campaignType: 'duenos_pymes' },
  { name: 'Vivero Correa', industry: 'Agropecuario', campaignType: 'duenos_pymes' },
  { name: 'Hotel Boutique La Barra', industry: 'Turismo y hotelería', campaignType: 'duenos_pymes' },
]

export const EMPRESA_TEMPLATES_CURADAS: CompanyTemplate[] = EMPRESA_TEMPLATES_BASE.map(t => ({
  ...t,
  sector: INDUSTRY_TO_SECTOR[t.industry],
}))

/** Nombre exacto pedido para la Historia A (cliente estratégico), sector transporte. */
export const NOMBRE_HISTORIA_A = 'Transportes del Sur'

export interface SectorDef {
  key: SectorKey
  targetTotal: number
  campaignType: string
  industryLabel: string
  /** Patrones de nombre: {ap} = apellido, {ap2} = segundo apellido, {card} = punto cardinal. */
  namePatterns: string[]
  /** Subconjunto de RAMOS_DEMO con mayor probabilidad para este sector (afinidad rubro→ramo). */
  ramosAfines: string[]
}

export const SECTOR_DEFS: SectorDef[] = [
  {
    key: 'comercio', targetTotal: 18, campaignType: 'duenos_pymes', industryLabel: 'Comercio',
    namePatterns: ['Almacén {ap}', 'Autoservicio {ap}', 'Comercial {ap}', 'Bazar {ap}', 'Tienda {ap} e Hijos', 'Ferretería {ap}', 'Panadería {ap}'],
    ramosAfines: ['Comercio', 'Incendio', 'Responsabilidad civil'],
  },
  {
    key: 'servicios_profesionales', targetTotal: 16, campaignType: 'profesionales_independientes', industryLabel: 'Servicios profesionales',
    namePatterns: ['Estudio {ap}', '{ap} & {ap2} Consultores', 'Consultora {ap}', 'Estudio Jurídico {ap}', 'Estudio Contable {ap}'],
    ramosAfines: ['Responsabilidad civil', 'Vida', 'Incendio'],
  },
  {
    key: 'salud', targetTotal: 12, campaignType: 'clinicas', industryLabel: 'Salud',
    namePatterns: ['Clínica {ap}', 'Centro Médico {ap}', 'Laboratorio Clínico {ap}', 'Policlínica {ap}'],
    ramosAfines: ['Responsabilidad civil', 'Accidentes de trabajo', 'Incendio'],
  },
  {
    key: 'industria', targetTotal: 12, campaignType: 'duenos_pymes', industryLabel: 'Industria',
    namePatterns: ['Industrias {ap}', 'Metalúrgica {ap}', 'Manufacturas {ap}', 'Fábrica {ap}'],
    ramosAfines: ['Incendio', 'Accidentes de trabajo', 'Responsabilidad civil'],
  },
  {
    key: 'transporte', targetTotal: 11, campaignType: 'duenos_pymes', industryLabel: 'Transporte y logística',
    namePatterns: ['Transportes {ap}', 'Transportes del {card}', 'Logística {ap}', 'Distribuidora {ap}'],
    ramosAfines: ['Transporte', 'Vehículos', 'Responsabilidad civil'],
  },
  {
    key: 'construccion', targetTotal: 10, campaignType: 'constructoras', industryLabel: 'Construcción',
    namePatterns: ['Constructora {ap}', '{ap} Obras Civiles', 'Edificar {ap}', 'Grupo Constructor {ap}'],
    ramosAfines: ['Accidentes de trabajo', 'Responsabilidad civil', 'Incendio'],
  },
  {
    key: 'agro', targetTotal: 9, campaignType: 'duenos_pymes', industryLabel: 'Agropecuario',
    namePatterns: ['Agropecuaria {ap}', 'Estancia {ap}', 'Cooperativa Agraria {ap}', 'Establecimiento {ap}'],
    ramosAfines: ['Vehículos', 'Responsabilidad civil', 'Incendio'],
  },
  {
    key: 'tecnologia', targetTotal: 8, campaignType: 'empresas_tech', industryLabel: 'Tecnología',
    namePatterns: ['{ap} Tecnología', 'Softlab {ap}', 'Datacore {ap}', '{ap} Sistemas'],
    ramosAfines: ['Responsabilidad civil', 'Vida'],
  },
  {
    key: 'educacion', targetTotal: 7, campaignType: 'general', industryLabel: 'Educación',
    namePatterns: ['Instituto {ap}', 'Colegio {ap}', 'Academia {ap}', 'Centro Educativo {ap}'],
    ramosAfines: ['Responsabilidad civil', 'Accidentes de trabajo', 'Incendio'],
  },
  {
    key: 'hoteleria', targetTotal: 6, campaignType: 'duenos_pymes', industryLabel: 'Turismo y hotelería',
    namePatterns: ['Hotel {ap}', 'Hotel Boutique {ap}', 'Posada {ap}', 'Cabañas {ap}'],
    ramosAfines: ['Incendio', 'Responsabilidad civil', 'Hogar'],
  },
  {
    key: 'inmobiliaria', targetTotal: 6, campaignType: 'duenos_pymes', industryLabel: 'Administración de edificios',
    namePatterns: ['Inmobiliaria {ap}', 'Consorcio {ap}', 'Administración de Edificios {ap}', 'Edificio {ap}'],
    ramosAfines: ['Hogar', 'Incendio', 'Responsabilidad civil'],
  },
  {
    key: 'clubes', targetTotal: 5, campaignType: 'clubes_asociaciones', industryLabel: 'Clubes y asociaciones',
    namePatterns: ['Club {ap}', 'Asociación Civil {ap}', 'Club Social {ap}'],
    ramosAfines: ['Responsabilidad civil', 'Incendio'],
  },
]

export const POSICIONES = [
  'Gerente General', 'Dueño', 'Socio Gerente', 'Contador', 'Responsable de RRHH',
  'Gerente Administrativo', 'Directora Financiera', 'Encargado de Compras', 'Gerente de Operaciones',
] as const

/** Aseguradoras reales del mercado (para la demo, no vinculadas al catálogo real de Admin todavía). */
export const ASEGURADORAS_DEMO = ['BSE', 'Porto Seguro', 'Mapfre', 'SURA', 'Zurich', 'HDI'] as const

/** Participación de mercado relativa (BSE dominante, como en el mercado real de Uruguay). No suma 100 exacto, es relativa. */
export const ASEGURADORA_WEIGHTS: Record<string, number> = {
  BSE: 30, Mapfre: 18, SURA: 17, 'Porto Seguro': 15, Zurich: 12, HDI: 8,
}

export const RAMOS_DEMO = [
  'Vehículos', 'Responsabilidad civil', 'Accidentes de trabajo', 'Vida',
  'Incendio', 'Transporte', 'Hogar', 'Comercio',
] as const

interface Comercial {
  id: string
  full_name: string
  role: 'direccion' | 'lider_comercial' | 'asesor'
  /** Perfil narrativo/de desempeño — solo para generación, no es un campo de UI. */
  perfil: 'director' | 'lider' | 'estrella' | 'solido' | 'crecimiento' | 'atrasado'
  /** Cantidad objetivo de empresas en cartera (define la desigualdad de carga entre el equipo). */
  carteraObjetivo: number
}

/**
 * Equipo comercial (6): 1 Director Comercial, 1 Líder Comercial, 4 Asesores con
 * desempeño desigual a propósito (para que Dirección tenga variación real que
 * mostrar, no un equipo parejo e irreal). `role: 'direccion'` reutiliza el
 * valor ya existente en UserRole — no se agrega ningún rol nuevo al sistema.
 */
export const COMERCIALES_DEMO: Comercial[] = [
  { id: 'com-01', full_name: 'Ana Deleón', role: 'direccion', perfil: 'director', carteraObjetivo: 8 },
  { id: 'com-02', full_name: 'Sofía Machado', role: 'lider_comercial', perfil: 'lider', carteraObjetivo: 22 },
  { id: 'com-03', full_name: 'Rodrigo Silva', role: 'asesor', perfil: 'estrella', carteraObjetivo: 24 },
  { id: 'com-04', full_name: 'Valentina Ríos', role: 'asesor', perfil: 'solido', carteraObjetivo: 22 },
  { id: 'com-05', full_name: 'Federico Bianchi', role: 'asesor', perfil: 'crecimiento', carteraObjetivo: 18 },
  { id: 'com-06', full_name: 'Martín Pérez', role: 'asesor', perfil: 'atrasado', carteraObjetivo: 26 },
]

export const PRODUCTOS_POR_RAMO: Record<string, string[]> = {
  'Vehículos': ['Flota comercial', 'Automóvil particular todo riesgo', 'Vehículos utilitarios'],
  'Responsabilidad civil': ['RC profesional', 'RC general de la empresa', 'RC directores y gerentes'],
  'Accidentes de trabajo': ['Colectivo de accidentes laborales', 'Cobertura de obra en construcción'],
  'Vida': ['Vida colectiva de socios', 'Vida individual ejecutivo', 'Vida saldo deudor'],
  'Incendio': ['Incendio y contenido comercial', 'Incendio edificio administrado'],
  'Transporte': ['Carga general', 'Transporte de mercadería propia'],
  'Hogar': ['Hogar edificio administrado', 'Hogar múltiple integral'],
  'Comercio': ['Comercio — local + mercadería', 'Multirriesgo comercial'],
}
