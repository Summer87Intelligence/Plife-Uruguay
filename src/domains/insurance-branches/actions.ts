'use server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { normalizeText } from '@/domains/duplicates/normalize'
import type { InsuranceBranch } from '@/types/database'
import type { InsuranceBranchFormData } from './types'
import { InsuranceBranchSchema } from './validation'

type ActionResult = { data: InsuranceBranch } | { error: string }

async function requireAdminProfile(): Promise<{ error: string } | null> {
  const profile = await getProfile()
  if (!profile) return { error: 'No autenticado' }
  if (profile.role !== 'admin') return { error: 'No autorizado: solo administración puede gestionar ramos' }
  return null
}

export async function createInsuranceBranch(data: InsuranceBranchFormData): Promise<ActionResult> {
  const unauthorized = await requireAdminProfile()
  if (unauthorized) return unauthorized

  const parsed = InsuranceBranchSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: branch, error } = await supabase
    .from('insurance_branches')
    .insert({
      name: parsed.data.name,
      normalized_name: normalizeText(parsed.data.name),
      created_by: user?.id ?? null,
      updated_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un ramo con ese nombre' }
    return { error: error.message }
  }

  revalidatePath('/app/admin')
  return { data: branch }
}

export async function updateInsuranceBranchName(id: string, name: string): Promise<ActionResult> {
  const unauthorized = await requireAdminProfile()
  if (unauthorized) return unauthorized

  const parsed = InsuranceBranchSchema.safeParse({ name })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: branch, error } = await supabase
    .from('insurance_branches')
    .update({
      name: parsed.data.name,
      normalized_name: normalizeText(parsed.data.name),
      updated_by: user?.id ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un ramo con ese nombre' }
    return { error: error.message }
  }

  revalidatePath('/app/admin')
  return { data: branch }
}

export async function setInsuranceBranchActive(id: string, is_active: boolean): Promise<ActionResult> {
  const unauthorized = await requireAdminProfile()
  if (unauthorized) return unauthorized

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: branch, error } = await supabase
    .from('insurance_branches')
    .update({ is_active, updated_by: user?.id ?? null })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/admin')
  return { data: branch }
}
