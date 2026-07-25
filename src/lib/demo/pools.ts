/**
 * Pools de datos plausibles para el universo mock de la demo comercial.
 * Nombres de empresas ficticios pero verosímiles para Uruguay; aseguradoras
 * reales del mercado; nombres de persona comunes en Uruguay.
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

interface CompanyTemplate {
  name: string
  industry: string
  campaignType: string
}

/** Empresas ficticias pero plausibles, agrupadas por rubro (alineadas a CampaignType). */
export const EMPRESA_TEMPLATES: CompanyTemplate[] = [
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

export const POSICIONES = [
  'Gerente General', 'Dueño', 'Socio Gerente', 'Contador', 'Responsable de RRHH',
  'Gerente Administrativo', 'Directora Financiera', 'Encargado de Compras', 'Gerente de Operaciones',
] as const

/** Aseguradoras reales del mercado (para la demo, no vinculadas al catálogo real de Admin todavía). */
export const ASEGURADORAS_DEMO = ['BSE', 'Porto Seguro', 'Mapfre', 'SURA', 'Zurich', 'HDI'] as const

export const RAMOS_DEMO = [
  'Vehículos', 'Responsabilidad civil', 'Accidentes de trabajo', 'Vida',
  'Incendio', 'Transporte', 'Hogar', 'Comercio',
] as const

interface Comercial {
  id: string
  full_name: string
  role: 'asesor' | 'lider_comercial'
}

export const COMERCIALES_DEMO: Comercial[] = [
  { id: 'com-01', full_name: 'Ana Deleón', role: 'lider_comercial' },
  { id: 'com-02', full_name: 'Rodrigo Silva', role: 'asesor' },
  { id: 'com-03', full_name: 'Martín Pérez', role: 'asesor' },
  { id: 'com-04', full_name: 'Valentina Ríos', role: 'asesor' },
  { id: 'com-05', full_name: 'Federico Bianchi', role: 'asesor' },
  { id: 'com-06', full_name: 'Camila Ferreira', role: 'asesor' },
  { id: 'com-07', full_name: 'Nicolás Ortiz', role: 'asesor' },
  { id: 'com-08', full_name: 'Sofía Machado', role: 'lider_comercial' },
  { id: 'com-09', full_name: 'Diego Acosta', role: 'asesor' },
  { id: 'com-10', full_name: 'Mariana Suárez', role: 'asesor' },
  { id: 'com-11', full_name: 'Ignacio Cabrera', role: 'asesor' },
  { id: 'com-12', full_name: 'Florencia Correa', role: 'asesor' },
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
