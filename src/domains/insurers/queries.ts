import { createClient } from '@/lib/supabase/server'
import type { Insurer } from '@/types/database'

/** Aseguradoras activas — visibles para cualquier usuario autenticado (RLS). */
export async function getActiveInsurers(): Promise<Insurer[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insurers')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

/** Activas e inactivas — solo resuelve filas si RLS permite (admin). */
export async function getAllInsurers(): Promise<Insurer[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insurers')
    .select('*')
    .order('name')
  return data ?? []
}
