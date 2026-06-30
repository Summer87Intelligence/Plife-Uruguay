import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole, Profile, Database } from '@/types/database'

export type SessionAndProfile = {
  user: Awaited<ReturnType<typeof getSession>>
  profile: Profile | null
  missingProfile: boolean
  inactiveProfile: boolean
}

export function devAuthLog(message: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[auth] ${message}`, data ?? '')
  }
}

export function isValidProfile(session: Pick<SessionAndProfile, 'profile' | 'missingProfile' | 'inactiveProfile'>): boolean {
  return !!session.profile && session.profile.is_active && !session.missingProfile && !session.inactiveProfile
}

export async function resolveSessionAndProfile(
  supabase: SupabaseClient<Database>
): Promise<SessionAndProfile> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, missingProfile: false, inactiveProfile: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const missingProfile = !profile
  const inactiveProfile = !!profile && !profile.is_active

  return { user, profile, missingProfile, inactiveProfile }
}

export async function getSessionAndProfile(): Promise<SessionAndProfile> {
  const supabase = await createClient()
  const session = await resolveSessionAndProfile(supabase)

  devAuthLog('getSessionAndProfile', {
    hasUser: !!session.user,
    hasProfile: !!session.profile,
    missingProfile: session.missingProfile,
    inactiveProfile: session.inactiveProfile,
  })

  return session
}

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
  const { profile, missingProfile, inactiveProfile } = await getSessionAndProfile()
  if (missingProfile || inactiveProfile) return null
  return profile
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
