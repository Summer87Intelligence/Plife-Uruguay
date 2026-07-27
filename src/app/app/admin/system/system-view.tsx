'use client'
import { format } from 'date-fns'
import {
  Activity,
  Bot,
  BookOpen,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  Megaphone,
  Shield,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
  ROLE_LABELS,
} from '@/lib/constants'
import type { Profile, RiskLevel } from '@/types/database'

interface AIInteractionSummary {
  id: string
  agent_name: string
  risk_level: RiskLevel | null
  created_at: string
  documents_used: string[] | null
}

interface SystemViewProps {
  profile: Profile
  isAIConfigured: boolean
  isDemoModeActive: boolean
  counts: {
    contacts: number
    companies: number
    opportunities: number
    campaigns: number
    activities: number
    knowledgeDocuments: number
  }
  knowledgeStats: {
    totalChunks: number
    embeddedChunks: number
    embeddingsReady: boolean
  }
  recentAIInteractions: AIInteractionSummary[]
}

const COUNTS_CONFIG = [
  { key: 'contacts' as const,           label: 'Contactos',    Icon: Users },
  { key: 'companies' as const,          label: 'Empresas',     Icon: Building2 },
  { key: 'opportunities' as const,      label: 'Oportunidades',Icon: Activity },
  { key: 'campaigns' as const,          label: 'Campañas',     Icon: Megaphone },
  { key: 'activities' as const,         label: 'Actividades',  Icon: Shield },
  { key: 'knowledgeDocuments' as const, label: 'Documentos activos', Icon: FileText },
]

export function SystemView({
  profile,
  isAIConfigured,
  isDemoModeActive,
  counts,
  knowledgeStats,
  recentAIInteractions,
}: SystemViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Database className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Admin</p>
          <h1 className="text-xl font-bold text-gray-900">Estado del Sistema</h1>
        </div>
      </div>

      {/* Sesión actual */}
      <Card>
        <CardHeader>
          <CardTitle>Sesión actual</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-400 mb-0.5">Nombre</dt>
              <dd className="font-medium text-gray-900">{profile.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 mb-0.5">Email</dt>
              <dd className="font-medium text-gray-900 break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 mb-0.5">Rol</dt>
              <dd className="font-medium text-gray-900">{ROLE_LABELS[profile.role]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 mb-0.5">Perfil</dt>
              <dd>
                {profile.is_active ? (
                  <span className="inline-flex items-center gap-1 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                    <XCircle className="h-3.5 w-3.5" />
                    Inactivo
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 mb-0.5">Onboarding</dt>
              <dd>
                {profile.onboarding_completed ? (
                  <span className="inline-flex items-center gap-1 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completado
                  </span>
                ) : (
                  <span className="text-sm text-amber-600 font-medium">Pendiente</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Configuración del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Modo demo</span>
              {isDemoModeActive ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">
                  Inactivo
                </span>
              )}
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Motores internos</span>
              {isAIConfigured ? (
                <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
                  Modo determinístico
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-medium">
                  No disponible
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge base status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#1B3A6B]" />
            Base de Conocimiento (FASE 8)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Docs activos</p>
              <p className="text-xl font-bold text-gray-900">{counts.knowledgeDocuments}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total chunks</p>
              <p className="text-xl font-bold text-gray-900">{knowledgeStats.totalChunks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Chunks indexados</p>
              <p className={`text-xl font-bold ${knowledgeStats.embeddingsReady ? 'text-blue-700' : 'text-gray-400'}`}>
                {knowledgeStats.embeddingsReady ? `${knowledgeStats.embeddedChunks}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Búsqueda semántica</p>
              <div className="flex items-center gap-1.5 mt-1">
                {knowledgeStats.embeddingsReady && knowledgeStats.embeddedChunks > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
                    <Cpu className="h-3 w-3" /> Activa
                  </span>
                ) : knowledgeStats.embeddingsReady ? (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">
                    Pendiente indexar
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
                    SQL pendiente
                  </span>
                )}
              </div>
            </div>
          </div>
          {!knowledgeStats.embeddingsReady && (
            <p className="text-xs text-gray-400 mt-3">Aplicá <code className="text-xs bg-gray-100 px-1 rounded">supabase/knowledge-embeddings.sql</code> para activar embeddings y búsqueda semántica.</p>
          )}
        </CardContent>
      </Card>

      {/* Conteos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {COUNTS_CONFIG.map(({ key, label, Icon }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-[#1B3A6B]/50" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts[key]}</p>
          </div>
        ))}
      </div>

      {/* Últimas interacciones IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#1B3A6B]" />
            Últimas 5 interacciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAIInteractions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin interacciones registradas</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentAIInteractions.map(item => (
                <li key={item.id} className="flex items-center justify-between py-3 gap-4">
                  <span className="text-sm text-gray-700 capitalize truncate">
                    {item.agent_name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.risk_level && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[item.risk_level]}`}
                      >
                        {RISK_LEVEL_LABELS[item.risk_level]}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 tabular-nums">
                      {format(new Date(item.created_at), 'dd/MM/yy HH:mm')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
