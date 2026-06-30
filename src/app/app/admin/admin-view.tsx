'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Settings, Users, Bot, Shield, Sparkles, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ROLE_LABELS } from '@/lib/constants'
import { isDemoMode } from '@/lib/demo'
import type { Profile, Team, AIPromptVersion } from '@/types/database'

interface AdminViewProps {
  users: Profile[]
  teams: (Team & { leader?: { full_name: string } | null })[]
  prompts: AIPromptVersion[]
}

type Tab = 'usuarios' | 'equipos' | 'agentes_ia'

export function AdminView({ users, teams, prompts }: AdminViewProps) {
  const [tab, setTab] = useState<Tab>('usuarios')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Administración</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios, equipos y configuración del sistema</p>
        </div>
      </div>

      {isDemoMode() && (
        <div className="flex items-start gap-3 rounded-xl border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 px-4 py-3">
          <Sparkles className="h-4 w-4 text-[#1B3A6B] shrink-0 mt-0.5" />
          <p className="text-sm text-[#1B3A6B]">
            <strong>Modo demo activo.</strong> Los datos visibles son de demostración. Para ocultar este modo, poné <code className="text-xs">NEXT_PUBLIC_DEMO_MODE=false</code> y reiniciá la app.
          </p>
        </div>
      )}

      {/* Link a estado del sistema */}
      <Link
        href="/app/admin/system"
        className="inline-flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline"
      >
        <Database className="h-4 w-4" />
        Ver estado del sistema →
      </Link>

      {/* Tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden w-fit">
        {([
          { id: 'usuarios', label: 'Usuarios', icon: Users },
          { id: 'equipos', label: 'Equipos', icon: Shield },
          { id: 'agentes_ia', label: 'Agentes IA', icon: Bot },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios activos ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-50">
              {users.map(user => (
                <li key={user.id} className="flex items-center gap-4 py-3">
                  <Avatar name={user.full_name} src={user.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B] px-2.5 py-0.5 text-xs font-medium">
                    {ROLE_LABELS[user.role]}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {tab === 'equipos' && (
        <Card>
          <CardHeader>
            <CardTitle>Equipos ({teams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin equipos configurados</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {teams.map(team => (
                  <li key={team.id} className="py-3">
                    <p className="text-sm font-semibold text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.leader?.full_name ? `Líder: ${team.leader.full_name}` : 'Sin líder asignado'}</p>
                    {team.description && <p className="text-xs text-gray-400 mt-0.5">{team.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'agentes_ia' && (
        <Card>
          <CardHeader>
            <CardTitle>Agentes IA activos ({prompts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-50">
              {prompts.map(prompt => (
                <li key={prompt.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{prompt.agent_name.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">v{prompt.version} · {prompt.model}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">temp: {prompt.temperature}</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">Activo</span>
                    </div>
                  </div>
                  {prompt.notes && <p className="text-xs text-gray-400 mt-1">{prompt.notes}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
