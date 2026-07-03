import { createClient } from '@/lib/supabase/server'
import { getProfile, canAccessAll } from '@/lib/auth'
import { isInternalOpenAccessEnabled } from '@/lib/internal-open-access'
import { redirect } from 'next/navigation'
import { IAView } from './ia-view'
import type { EntityNameMap } from '@/components/ia/types'
import type { AIExecutionRun } from '@/types/database'

async function resolveEntityNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  runs: AIExecutionRun[],
): Promise<EntityNameMap> {
  const entityNames: EntityNameMap = {}
  if (runs.length === 0) return entityNames

  const companyIds = [...new Set(runs.filter(r => r.entity_type === 'company').map(r => r.entity_id))]
  const opportunityIds = [...new Set(runs.filter(r => r.entity_type === 'opportunity').map(r => r.entity_id))]

  const [companiesRes, opportunitiesRes] = await Promise.all([
    companyIds.length > 0
      ? supabase.from('companies').select('id, name').in('id', companyIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    opportunityIds.length > 0
      ? supabase.from('opportunities').select('id, title').in('id', opportunityIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ])

  for (const company of companiesRes.data ?? []) {
    entityNames[`company:${company.id}`] = company.name
  }
  for (const opportunity of opportunitiesRes.data ?? []) {
    entityNames[`opportunity:${opportunity.id}`] = opportunity.title
  }

  return entityNames
}

export default async function IAPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isInternalOpenAccessEnabled() && !canAccessAll(profile)) redirect('/app/hoy')

  const supabase = await createClient()

  const [
    { data: stages,        error: stagesErr },
    { data: categories,    error: categoriesErr },
    { data: prompts,       error: promptsErr },
    { data: profiles,      error: profilesErr },
    { data: profilePrompts, error: ppErr },
    { data: executionRuns, error: runsErr },
    { data: executionOutputs, error: outputsErr },
    { data: promptSuggestions, error: suggestionsErr },
  ] = await Promise.all([
    supabase.from('ai_stages').select('*').order('sort_order'),
    supabase.from('ai_categories').select('*').order('label'),
    supabase.from('ai_prompts').select('*').order('name'),
    supabase.from('ai_analysis_profiles').select('*').order('name'),
    supabase.from('ai_profile_prompts').select('*').order('execution_order'),
    supabase.from('ai_execution_runs').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('ai_execution_outputs').select('*').order('execution_order'),
    supabase.from('ai_prompt_suggestions').select('*').order('created_at', { ascending: false }),
  ])

  const allErrors = [stagesErr, categoriesErr, promptsErr, profilesErr, ppErr, runsErr, outputsErr, suggestionsErr]

  const schemaNotApplied = allErrors.some(
    e => e?.code === '42P01' || e?.message?.includes('does not exist')
  )

  const supabaseError = !schemaNotApplied
    ? (allErrors.find(e => e !== null)?.message ?? null)
    : null

  const runs = executionRuns ?? []
  const entityNames = !schemaNotApplied && !supabaseError
    ? await resolveEntityNames(supabase, runs)
    : {}

  return (
    <IAView
      stages={stages ?? []}
      categories={categories ?? []}
      prompts={prompts ?? []}
      profiles={profiles ?? []}
      profilePrompts={profilePrompts ?? []}
      executionRuns={runs}
      executionOutputs={executionOutputs ?? []}
      promptSuggestions={promptSuggestions ?? []}
      entityNames={entityNames}
      schemaNotApplied={schemaNotApplied}
      supabaseError={supabaseError}
    />
  )
}
