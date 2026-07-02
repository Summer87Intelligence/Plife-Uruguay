'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getProfile, canAccessAll } from '@/lib/auth'
import { validateStructuredPrompt } from '@/domains/ia-engine/prompt-validation'
import { runMockAIEngine } from '@/domains/ia-engine/mock-runner'
import { buildStructuredPrompt } from '@/domains/ia-engine/prompt-builder'

const CategorySchema = z.object({
  label: z.string().min(1, 'Nombre requerido').max(100),
  key: z.string().min(1, 'Slug requerido').max(50)
    .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo'),
  description: z.string().max(500).optional(),
  tone: z.string().max(50).optional(),
  is_active: z.boolean(),
})

const ProfileSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  target_client_type: z.string().max(100).optional(),
  target_industries: z.string().max(200).optional(),
  base_instructions: z.string().max(2000).optional(),
  is_active: z.boolean(),
})

const AddPromptSchema = z.object({
  profile_id: z.string().uuid(),
  prompt_id: z.string().uuid(),
  execution_order: z.number().int().min(1).max(9999),
  enabled_by_default: z.boolean(),
})

const PromptSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  description: z.string().max(500).optional(),
  stage_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  role_persona: z.string().max(8000).default(''),
  context_environment: z.string().max(8000).default(''),
  objective: z.string().max(8000).default(''),
  specific_task: z.string().max(8000).default(''),
  constraints: z.string().max(8000).default(''),
  output_format: z.string().max(8000).default(''),
  target_audience: z.string().max(2000).default(''),
  status: z.enum(['draft', 'validated', 'archived']),
  is_active: z.boolean(),
})

export type CategoryFormData = z.infer<typeof CategorySchema>
export type ProfileFormData = z.infer<typeof ProfileSchema>
export type AddPromptFormData = z.infer<typeof AddPromptSchema>
export type PromptFormData = z.infer<typeof PromptSchema>

const MockAnalysisSchema = z.object({
  entityType: z.enum(['company', 'contact', 'opportunity', 'campaign']),
  entityId: z.string().uuid('ID de entidad debe ser un UUID válido'),
  profileId: z.string().uuid('Perfil inválido'),
})

export type RunMockAnalysisInput = z.infer<typeof MockAnalysisSchema>

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !canAccessAll(profile)) return null
  return profile
}

// ---- ai_categories ----

export async function createCategory(data: CategoryFormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: cat, error } = await supabase
    .from('ai_categories')
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      tone: parsed.data.tone || 'neutral',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: cat }
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = CategorySchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: cat, error } = await supabase
    .from('ai_categories')
    .update({
      ...parsed.data,
      description: parsed.data.description ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: cat }
}

// ---- ai_analysis_profiles ----

export async function createProfile(data: ProfileFormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = ProfileSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: prof, error } = await supabase
    .from('ai_analysis_profiles')
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      target_client_type: parsed.data.target_client_type || null,
      target_industries: parsed.data.target_industries || null,
      base_instructions: parsed.data.base_instructions ?? '',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: prof }
}

export async function updateProfile(id: string, data: Partial<ProfileFormData>) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = ProfileSchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: prof, error } = await supabase
    .from('ai_analysis_profiles')
    .update({
      ...parsed.data,
      description: parsed.data.description ?? null,
      target_client_type: parsed.data.target_client_type ?? null,
      target_industries: parsed.data.target_industries ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: prof }
}

// ---- ai_profile_prompts ----

export async function addPromptToProfile(data: AddPromptFormData) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = AddPromptSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: link, error } = await supabase
    .from('ai_profile_prompts')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Este prompt ya está vinculado al perfil' }
    return { error: error.message }
  }
  revalidatePath('/app/ia')
  return { data: link }
}

export async function updateProfilePrompt(id: string, data: { execution_order?: number; enabled_by_default?: boolean }) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const supabase = await createClient()
  const { data: link, error } = await supabase
    .from('ai_profile_prompts')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: link }
}

// ---- ai_prompts ----

export async function updatePrompt(id: string, data: Partial<PromptFormData>) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = PromptSchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: prompt, error } = await supabase
    .from('ai_prompts')
    .update({
      ...parsed.data,
      description: parsed.data.description ?? null,
      stage_id: parsed.data.stage_id ?? null,
      category_id: parsed.data.category_id ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/app/ia')
  return { data: prompt }
}

// ---- ai_prompt_suggestions ----

export async function regeneratePromptSuggestions(promptId: string) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const supabase = await createClient()

  const { data: prompt, error: promptErr } = await supabase
    .from('ai_prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  if (promptErr) return { error: promptErr.message }
  if (!prompt) return { error: 'Prompt no encontrado' }

  let categoryKey: string | null = null
  if (prompt.category_id) {
    const { data: category } = await supabase
      .from('ai_categories')
      .select('key')
      .eq('id', prompt.category_id)
      .single()
    categoryKey = category?.key ?? null
  }

  const validation = validateStructuredPrompt({
    name: prompt.name,
    role_persona: prompt.role_persona,
    context_environment: prompt.context_environment,
    objective: prompt.objective,
    specific_task: prompt.specific_task,
    constraints: prompt.constraints,
    output_format: prompt.output_format,
    target_audience: prompt.target_audience,
    status: prompt.status,
    categoryKey,
  })

  const { error: dismissErr } = await supabase
    .from('ai_prompt_suggestions')
    .update({ status: 'dismissed' })
    .eq('prompt_id', promptId)
    .eq('status', 'open')

  if (dismissErr) return { error: dismissErr.message }

  if (validation.suggestions.length > 0) {
    const rows = validation.suggestions.map(s => ({
      prompt_id: promptId,
      suggestion_type: s.suggestion_type,
      reason: s.reason,
      suggested_content: s.suggested_content ?? null,
      status: 'open' as const,
    }))

    const { error: insertErr } = await supabase
      .from('ai_prompt_suggestions')
      .insert(rows)

    if (insertErr) return { error: insertErr.message }
  }

  revalidatePath('/app/ia')
  return {
    data: {
      status: validation.status,
      suggestionCount: validation.suggestions.length,
    },
  }
}

// ---- ai_execution_runs (mock) ----

export async function runMockAnalysis(input: RunMockAnalysisInput) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = MockAnalysisSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { entityType, entityId, profileId } = parsed.data
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: profile, error: profileErr } = await supabase
    .from('ai_analysis_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (profileErr) return { error: profileErr.message }
  if (!profile) return { error: 'Perfil no encontrado' }

  const [
    { data: profilePromptLinks, error: linksErr },
    { data: allPrompts, error: promptsErr },
    { data: stages, error: stagesErr },
    { data: categories, error: categoriesErr },
  ] = await Promise.all([
    supabase.from('ai_profile_prompts').select('*').eq('profile_id', profileId).order('execution_order'),
    supabase.from('ai_prompts').select('*'),
    supabase.from('ai_stages').select('*'),
    supabase.from('ai_categories').select('*'),
  ])

  if (linksErr) return { error: linksErr.message }
  if (promptsErr) return { error: promptsErr.message }
  if (stagesErr) return { error: stagesErr.message }
  if (categoriesErr) return { error: categoriesErr.message }

  const promptMap = new Map((allPrompts ?? []).map(p => [p.id, p]))
  const stageMap = new Map((stages ?? []).map(s => [s.id, s]))
  const categoryMap = new Map((categories ?? []).map(c => [c.id, c]))

  const eligiblePrompts = (profilePromptLinks ?? [])
    .filter(link => link.enabled_by_default)
    .map(link => {
      const prompt = promptMap.get(link.prompt_id)
      if (!prompt || prompt.status !== 'validated' || !prompt.is_active) return null
      const stage = prompt.stage_id ? stageMap.get(prompt.stage_id) : null
      const category = prompt.category_id ? categoryMap.get(prompt.category_id) : null
      return {
        link,
        prompt,
        stage,
        category,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.link.execution_order - b.link.execution_order)

  if (eligiblePrompts.length === 0) {
    return {
      error: 'No hay prompts validados y activos habilitados en este perfil. Verificá ai_profile_prompts y el estado de los prompts.',
    }
  }

  const { data: run, error: runInsertErr } = await supabase
    .from('ai_execution_runs')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      profile_id: profileId,
      status: 'running',
      started_at: now,
      created_by: admin.id,
    })
    .select()
    .single()

  if (runInsertErr || !run) {
    return { error: runInsertErr?.message ?? 'No se pudo crear la ejecución' }
  }

  try {
    const mockInput = {
      entityType,
      entityId,
      profileId,
      profileName: profile.name,
      prompts: eligiblePrompts.map(({ link, prompt, stage, category }) => ({
        id: prompt.id,
        name: prompt.name,
        stageLabel: stage?.label ?? null,
        categoryLabel: category?.label ?? null,
        executionOrder: link.execution_order,
        promptPreview: buildStructuredPrompt(prompt),
      })),
    }

    const mockOutputs = runMockAIEngine(mockInput)

    const outputRows = mockOutputs.map((mock, idx) => {
      const source = eligiblePrompts[idx]
      return {
        run_id: run.id,
        stage_id: source.prompt.stage_id,
        prompt_id: source.prompt.id,
        execution_order: mock.executionOrder,
        status: 'completed' as const,
        output: mock.output,
        tokens_input: 0,
        tokens_output: 0,
        cost_estimate: 0,
        duration_ms: mock.durationMs,
      }
    })

    const { error: outputsErr } = await supabase
      .from('ai_execution_outputs')
      .insert(outputRows)

    if (outputsErr) {
      await supabase
        .from('ai_execution_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: outputsErr.message,
        })
        .eq('id', run.id)
      return { error: `Error al guardar outputs: ${outputsErr.message}` }
    }

    const { error: runUpdateErr } = await supabase
      .from('ai_execution_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
      })
      .eq('id', run.id)

    if (runUpdateErr) {
      return { error: runUpdateErr.message }
    }

    revalidatePath('/app/ia')
    return { data: { runId: run.id, outputCount: outputRows.length } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado en ejecución mock'
    await supabase
      .from('ai_execution_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', run.id)
    return { error: message }
  }
}
