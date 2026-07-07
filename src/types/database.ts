export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'direccion' | 'lider_comercial' | 'asesor' | 'compliance' | 'capacitacion' | 'viewer'
export type ContactStatus = 'nuevo' | 'contactado' | 'interesado' | 'reunion_agendada' | 'diagnostico_realizado' | 'en_seguimiento' | 'en_analisis' | 'cerrado_ganado' | 'cerrado_perdido' | 'seguimiento_futuro'
export type InterestLevel = 'bajo' | 'medio' | 'alto' | 'muy_alto'
export type CompanyB2BStatus = 'detectada' | 'analizada' | 'priorizada' | 'asignada' | 'contactada' | 'reunion_agendada' | 'en_negociacion' | 'descartada' | 'convertida'
export type OpportunityStage = 'nueva' | 'calificada' | 'contactada' | 'reunion_agendada' | 'diagnostico_realizado' | 'propuesta_conceptual' | 'validacion_plife' | 'seguimiento' | 'cerrada_ganada' | 'cerrada_perdida' | 'dormida'
export type OpportunityType = 'b2c' | 'b2b' | 'reclutamiento'
export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'critico'
export type ActivityType = 'llamada' | 'reunion' | 'mensaje' | 'email' | 'nota' | 'tarea' | 'whatsapp' | 'linkedin'
export type CampaignStatus = 'borrador' | 'activa' | 'pausada' | 'finalizada' | 'archivada'
export type CampaignType = 'duenos_pymes' | 'empresas_familiares' | 'estudios_contables' | 'estudios_juridicos' | 'clinicas' | 'empresas_tech' | 'constructoras' | 'clubes_asociaciones' | 'profesionales_independientes' | 'ejecutivos' | 'reclutamiento_asesores' | 'general'
export type DocumentStatus = 'activo' | 'inactivo' | 'en_revision' | 'archivado'
// LEGADO: Compliance fue removido del producto en FASE 15C. Este tipo y las tablas
// `compliance_rules` / `compliance_reviews` se conservan sólo como espejo del schema
// remoto de Supabase (no se aplicó SQL). Ninguna pantalla ni motor los usa.
export type ComplianceAction = 'aprobado' | 'bloqueado' | 'revision_requerida' | 'modificado'

// --- Motor de prompts PLIFE (FASE 12O-B) -----------------------------------
export type AIPromptStatus = 'draft' | 'validated' | 'archived'
export type AIExecutionEntityType = 'company' | 'contact' | 'opportunity' | 'campaign'
export type AIExecutionRunStatus = 'queued' | 'running' | 'completed' | 'completed_with_errors' | 'failed'
export type AIExecutionOutputStatus = 'queued' | 'running' | 'completed' | 'failed' | 'skipped'
export type AIPromptSuggestionStatus = 'open' | 'accepted' | 'dismissed'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  phone: string | null
  is_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  leader_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface TeamMember {
  id: string
  team_id: string
  profile_id: string
  joined_at: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  position: string | null
  source: string | null
  status: ContactStatus
  interest_level: InterestLevel | null
  detected_need: string | null
  last_interaction_at: string | null
  next_action: string | null
  next_action_date: string | null
  notes: string | null
  data_consent: boolean
  data_origin: string | null
  company_id: string | null
  assigned_to: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface ContactWithRelations extends Contact {
  company?: Company | null
  assigned_profile?: Profile | null
}

export interface Company {
  id: string
  name: string
  industry: string | null
  website: string | null
  linkedin_url: string | null
  instagram_url: string | null
  location: string | null
  estimated_size: string | null
  estimated_employees: number | null
  source: string | null
  b2b_score: number | null
  b2b_status: CompanyB2BStatus
  commercial_angle: string | null
  ideal_contact: string | null
  risk_notes: string | null
  opportunity_detected: string | null
  notes: string | null
  assigned_to: string | null
  campaign_id: string | null
  ai_analysis: Json | null
  ai_analyzed_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Opportunity {
  id: string
  title: string
  type: OpportunityType
  stage: OpportunityStage
  estimated_value: number | null
  probability: number | null
  ai_score: number | null
  human_score: number | null
  detected_need: string | null
  suggested_product: string | null
  commercial_risk: RiskLevel | null
  risk_notes: string | null
  next_action: string | null
  next_action_date: string | null
  loss_reason: string | null
  notes: string | null
  contact_id: string | null
  company_id: string | null
  assigned_to: string | null
  campaign_id: string | null
  lead_id: string | null
  last_activity_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  assigned_to: string | null
  created_by: string | null
  title: string
  display_name: string | null
  lead_type: string
  source: string
  status: string
  pipeline_stage: string
  priority: string
  temperature: string
  interest_area: string | null
  phone: string | null
  email: string | null
  company_name_raw: string | null
  person_name_raw: string | null
  company_id: string | null
  contact_id: string | null
  campaign_id: string | null
  radar_source_id: string | null
  opportunity_id: string | null
  next_action: string | null
  next_action_date: string | null
  notes: string | null
  converted_at: string | null
  discarded_at: string | null
  discard_reason: string | null
  metadata: Json
}

export interface OpportunityWithRelations extends Opportunity {
  contact?: Contact | null
  company?: Company | null
  assigned_profile?: Profile | null
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string | null
  outcome: string | null
  duration_minutes: number | null
  scheduled_at: string | null
  completed_at: string | null
  is_completed: boolean
  contact_id: string | null
  company_id: string | null
  opportunity_id: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface Note {
  id: string
  content: string
  is_pinned: boolean
  contact_id: string | null
  company_id: string | null
  opportunity_id: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  objective: string | null
  target_segment: string | null
  icp_description: string | null
  initial_message: string | null
  call_script: string | null
  expected_objections: string[] | null
  follow_up_sequence: Json | null
  start_date: string | null
  end_date: string | null
  total_targets: number
  total_contacted: number
  total_responses: number
  total_meetings: number
  total_converted: number
  responsible_id: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface KnowledgeDocument {
  id: string
  name: string
  description: string | null
  file_url: string | null
  file_type: string | null
  file_size_bytes: number | null
  status: DocumentStatus
  category: string | null
  version: number
  tags: string[] | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface KnowledgeChunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  metadata: Json | null
  embedding?: number[] | null
  created_at: string
}

export interface AIInteraction {
  id: string
  agent_name: string
  prompt_version_id: string | null
  user_id: string
  input_context: Json
  full_prompt: string
  response: string
  model_used: string
  tokens_used: number | null
  risk_level: RiskLevel | null
  risk_flags: string[] | null
  documents_used: string[] | null
  was_approved: boolean | null
  was_modified: boolean | null
  final_content: string | null
  contact_id: string | null
  company_id: string | null
  opportunity_id: string | null
  campaign_id: string | null
  created_at: string
}

// LEGADO (FASE 15C): Compliance removido del producto. Tipo conservado sólo como
// espejo del schema remoto de Supabase; sin uso en la aplicación.
export interface ComplianceRule {
  id: string
  name: string
  description: string | null
  pattern: string
  is_regex: boolean
  risk_level: RiskLevel
  suggested_alternative: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ComplianceReview {
  id: string
  ai_interaction_id: string | null
  content_reviewed: string
  risk_level: RiskLevel
  risk_reasons: string[] | null
  action: ComplianceAction
  suggested_version: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rules_triggered: string[] | null
  created_at: string
}

export interface AuditEvent {
  id: string
  event_type: string
  entity_type: string
  entity_id: string | null
  user_id: string | null
  user_email: string | null
  user_role: string | null
  old_data: Json | null
  new_data: Json | null
  metadata: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AIPromptVersion {
  id: string
  agent_name: string
  version: number
  system_prompt: string
  user_prompt_template: string | null
  model: string
  temperature: number | null
  max_tokens: number | null
  is_active: boolean
  notes: string | null
  created_at: string
  created_by: string | null
}

export interface TrainingModule {
  id: string
  title: string
  description: string | null
  content: Json | null
  category: string | null
  level: string
  estimated_minutes: number | null
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface RoleplaySession {
  id: string
  user_id: string
  scenario: string
  transcript: Json
  ai_feedback: string | null
  score: number | null
  duration_minutes: number | null
  completed_at: string | null
  created_at: string
}

export interface ObjectionItem {
  id: string
  objection: string
  context: string | null
  recommended_response: string
  category: string | null
  tags: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

// --- Motor de prompts PLIFE (FASE 12O-B) -----------------------------------

export interface AIStage {
  id: string
  key: string
  label: string
  description: string | null
  sort_order: number
  tone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AICategory {
  id: string
  key: string
  label: string
  description: string | null
  tone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIPrompt {
  id: string
  name: string
  description: string | null
  stage_id: string | null
  category_id: string | null
  role_persona: string
  context_environment: string
  objective: string
  specific_task: string
  constraints: string
  output_format: string
  target_audience: string
  provider: string
  model: string
  temperature: number
  max_tokens: number
  status: AIPromptStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIAnalysisProfile {
  id: string
  name: string
  description: string | null
  target_client_type: string | null
  target_industries: string | null
  base_instructions: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIProfilePrompt {
  id: string
  profile_id: string
  prompt_id: string
  execution_order: number
  enabled_by_default: boolean
  created_at: string
  updated_at: string
}

export interface AIPromptSuggestion {
  id: string
  prompt_id: string
  suggestion_type: string
  reason: string
  suggested_content: string | null
  status: AIPromptSuggestionStatus
  created_at: string
}

export interface AIExecutionRun {
  id: string
  entity_type: AIExecutionEntityType
  entity_id: string
  profile_id: string | null
  status: AIExecutionRunStatus
  started_at: string | null
  finished_at: string | null
  error_message: string | null
  created_by: string | null
  created_at: string
}

export interface AIExecutionOutput {
  id: string
  run_id: string
  stage_id: string | null
  prompt_id: string | null
  execution_order: number
  status: AIExecutionOutputStatus
  output: string | null
  error_message: string | null
  tokens_input: number | null
  tokens_output: number | null
  cost_estimate: number | null
  duration_ms: number | null
  created_at: string
}

// Database generic type for Supabase client
// Each table includes `Relationships: []` and the schema includes `Views` /
// `CompositeTypes` because @supabase/postgrest-js requires this shape to satisfy
// its `GenericSchema` constraint; otherwise the typed client falls back to `never`.
// `Loose` re-maps the row keys so the resulting type gains an implicit string
// index signature. Plain `interface` types are NOT assignable to
// `Record<string, unknown>` (which `GenericTable` requires), so without this the
// schema fails the `GenericSchema` constraint and the client degrades to `never`.
type Loose<T> = { [K in keyof T]: T[K] }

// Foreign-key relationship descriptor consumed by postgrest-js to type embedded
// selects such as `company:companies(id, name)`. Only the relationships actually
// used by embedded queries are declared.
type Rel<FK extends string, Col extends string, Ref extends string> = {
  foreignKeyName: FK
  columns: [Col]
  isOneToOne: false
  referencedRelation: Ref
  referencedColumns: ['id']
}

type GenericRel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

type TableDef<Row, Rels extends GenericRel[] = []> = {
  Row: Loose<Row>
  Insert: Partial<Loose<Row>>
  Update: Partial<Loose<Row>>
  Relationships: Rels
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      teams: TableDef<Team, [Rel<'teams_leader_id_fkey', 'leader_id', 'profiles'>]>
      team_members: TableDef<TeamMember>
      contacts: TableDef<Contact, [
        Rel<'contacts_company_id_fkey', 'company_id', 'companies'>,
        Rel<'contacts_assigned_to_fkey', 'assigned_to', 'profiles'>,
      ]>
      companies: TableDef<Company>
      leads: TableDef<Lead, [
        Rel<'leads_assigned_to_fkey', 'assigned_to', 'profiles'>,
        Rel<'leads_created_by_fkey', 'created_by', 'profiles'>,
        Rel<'leads_company_id_fkey', 'company_id', 'companies'>,
        Rel<'leads_contact_id_fkey', 'contact_id', 'contacts'>,
        Rel<'leads_campaign_id_fkey', 'campaign_id', 'campaigns'>,
        Rel<'leads_opportunity_id_fkey', 'opportunity_id', 'opportunities'>,
      ]>
      opportunities: TableDef<Opportunity, [
        Rel<'opportunities_contact_id_fkey', 'contact_id', 'contacts'>,
        Rel<'opportunities_company_id_fkey', 'company_id', 'companies'>,
        Rel<'opportunities_assigned_to_fkey', 'assigned_to', 'profiles'>,
        Rel<'opportunities_lead_id_fkey', 'lead_id', 'leads'>,
      ]>
      activities: TableDef<Activity, [Rel<'activities_created_by_fkey', 'created_by', 'profiles'>]>
      notes: TableDef<Note>
      campaigns: TableDef<Campaign>
      knowledge_documents: TableDef<KnowledgeDocument>
      knowledge_chunks: TableDef<KnowledgeChunk>
      ai_interactions: TableDef<AIInteraction, [Rel<'ai_interactions_user_id_fkey', 'user_id', 'profiles'>]>
      ai_prompt_versions: TableDef<AIPromptVersion>
      compliance_rules: TableDef<ComplianceRule>
      compliance_reviews: TableDef<ComplianceReview>
      audit_events: TableDef<AuditEvent>
      training_modules: TableDef<TrainingModule>
      roleplay_sessions: TableDef<RoleplaySession>
      objections_library: TableDef<ObjectionItem>
      // Motor de prompts PLIFE (FASE 12O-B)
      ai_stages: TableDef<AIStage>
      ai_categories: TableDef<AICategory>
      ai_prompts: TableDef<AIPrompt, [
        Rel<'ai_prompts_stage_id_fkey',    'stage_id',    'ai_stages'>,
        Rel<'ai_prompts_category_id_fkey', 'category_id', 'ai_categories'>,
      ]>
      ai_analysis_profiles: TableDef<AIAnalysisProfile>
      ai_profile_prompts: TableDef<AIProfilePrompt, [
        Rel<'ai_profile_prompts_profile_id_fkey', 'profile_id', 'ai_analysis_profiles'>,
        Rel<'ai_profile_prompts_prompt_id_fkey',  'prompt_id',  'ai_prompts'>,
      ]>
      ai_prompt_suggestions: TableDef<AIPromptSuggestion, [
        Rel<'ai_prompt_suggestions_prompt_id_fkey', 'prompt_id', 'ai_prompts'>,
      ]>
      ai_execution_runs: TableDef<AIExecutionRun, [
        Rel<'ai_execution_runs_profile_id_fkey',  'profile_id',  'ai_analysis_profiles'>,
        Rel<'ai_execution_runs_created_by_fkey',  'created_by',  'profiles'>,
      ]>
      ai_execution_outputs: TableDef<AIExecutionOutput, [
        Rel<'ai_execution_outputs_run_id_fkey',    'run_id',    'ai_execution_runs'>,
        Rel<'ai_execution_outputs_stage_id_fkey',  'stage_id',  'ai_stages'>,
        Rel<'ai_execution_outputs_prompt_id_fkey', 'prompt_id', 'ai_prompts'>,
      ]>
    }
    Views: Record<string, never>
    CompositeTypes: Record<string, never>
    Functions: {
      search_knowledge: {
        Args: { query_embedding: number[]; match_threshold?: number; match_count?: number }
        Returns: Array<{ id: string; document_id: string; content: string; similarity: number; metadata: Json; document_name: string }>
      }
      log_audit_event: {
        Args: { p_event_type: string; p_entity_type: string; p_entity_id: string; p_old_data?: Json; p_new_data?: Json; p_metadata?: Json }
        Returns: string
      }
      get_user_role: { Args: Record<never, never>; Returns: UserRole }
      is_admin_or_direccion: { Args: Record<never, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      contact_status: ContactStatus
      interest_level: InterestLevel
      company_b2b_status: CompanyB2BStatus
      opportunity_stage: OpportunityStage
      opportunity_type: OpportunityType
      risk_level: RiskLevel
      activity_type: ActivityType
      campaign_status: CampaignStatus
      campaign_type: CampaignType
      document_status: DocumentStatus
      compliance_action: ComplianceAction
      // Motor de prompts PLIFE (FASE 12O-B)
      ai_prompt_status: AIPromptStatus
      ai_execution_entity_type: AIExecutionEntityType
      ai_execution_run_status: AIExecutionRunStatus
      ai_execution_output_status: AIExecutionOutputStatus
      ai_prompt_suggestion_status: AIPromptSuggestionStatus
    }
  }
}
