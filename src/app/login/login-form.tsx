'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield } from 'lucide-react'

type LoginFormProps = {
  showMissingProfile: boolean
}

export function LoginForm({ showMissingProfile }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/app/hoy')
      router.refresh()
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.refresh()
    setSigningOut(false)
  }

  if (showMissingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B3A6B] to-[#2A5298] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">PLIFE Growth OS</h1>
            <p className="text-blue-200 text-sm mt-1">Plataforma Comercial Interna</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Cuenta sin perfil</h2>
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 mb-6">
              <p className="text-sm text-amber-800">
                Tu usuario existe, pero todavía no tiene perfil habilitado.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              loading={signingOut}
              className="w-full"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </Button>
          </div>

          <p className="text-center text-blue-200/60 text-xs mt-6">
            © 2025 PLIFE Uruguay · Uso interno
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A6B] to-[#2A5298] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PLIFE Growth OS</h1>
          <p className="text-blue-200 text-sm mt-1">Plataforma Comercial Interna</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
          <p className="text-sm text-gray-500 mb-6">Accedé con tu cuenta PLIFE</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@plife.uy"
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          © 2025 PLIFE Uruguay · Uso interno
        </p>
      </div>
    </div>
  )
}
