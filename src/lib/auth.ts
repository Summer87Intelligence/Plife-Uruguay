import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole, Profile } from '@/types/database'

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) redirect('/login')
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getProfile()
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/app/hoy')
  }
  return profile
}

export function canAccessAll(profile: Profile): boolean {
  return ['admin', 'direccion'].includes(profile.role)
}
