import { createClient } from '@/lib/supabase/server'
import type { InsuranceBranch } from '@/types/database'

/** Ramos activos — visibles para cualquier usuario autenticado (RLS). */
export async function getActiveInsuranceBranches(): Promise<InsuranceBranch[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insurance_branches')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

/** Activos e inactivos — solo resuelve filas si RLS permite (admin). */
export async function getAllInsuranceBranches(): Promise<InsuranceBranch[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insurance_branches')
    .select('*')
    .order('name')
  return data ?? []
}
