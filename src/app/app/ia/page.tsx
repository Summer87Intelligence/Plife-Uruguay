import { createClient } from '@/lib/supabase/server'
import { getProfile, canAccessAll } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { IAView } from './ia-view'

export default async function IAPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!canAccessAll(profile)) redirect('/app/hoy')

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

  // 42P01 = relation does not exist (schema not applied)
  const schemaNotApplied = allErrors.some(
    e => e?.code === '42P01' || e?.message?.includes('does not exist')
  )

  // Any other Supabase error (permissions, network, etc.)
  const supabaseError = !schemaNotApplied
    ? (allErrors.find(e => e !== null)?.message ?? null)
    : null

  return (
    <IAView
      stages={stages ?? []}
      categories={categories ?? []}
      prompts={prompts ?? []}
      profiles={profiles ?? []}
      profilePrompts={profilePrompts ?? []}
      executionRuns={executionRuns ?? []}
      executionOutputs={executionOutputs ?? []}
      promptSuggestions={promptSuggestions ?? []}
      schemaNotApplied={schemaNotApplied}
      supabaseError={supabaseError}
    />
  )
}
