'use client'

import {
  CheckCircle2, FileText, Tag, User, Activity, Clock, Lightbulb, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeDate } from '@/lib/utils'
import type { IAEngineProps } from './types'
import {
  countPromptsByCategory, getActiveProfile, getLatestRun, getProfilePrompts, getOutputsForRun, formatRunEntityLabel,
  RUN_STATUS_LABELS, PROMPT_STATUS_LABELS,
} from './helpers'
import { ProfileSelector } from './profile-selector'

interface DashboardTabProps extends IAEngineProps {
  activeProfileId: string
  onProfileChange: (id: string) => void
}

export function DashboardTab({
  stages, categories, prompts, profiles, profilePrompts, executionRuns, executionOutputs, entityNames,
  activeProfileId, onProfileChange,
}: DashboardTabProps) {
  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? getActiveProfile(profiles)
  const validatedCount = prompts.filter(p => p.status === 'validated').length
  const activeCategories = categories.filter(c => c.is_active).length
  const activeProfiles = profiles.filter(p => p.is_active).length
  const latestRun = getLatestRun(executionRuns)
  const profileLinks = getProfilePrompts(activeProfileId, profilePrompts, prompts)
  const enabledCount = profileLinks.filter(pl => pl.link.enabled_by_default).length
  const categoryCounts = countPromptsByCategory(prompts, categories)
  const systemOk = validatedCount > 0 && activeProfiles > 0 && profilePrompts.length > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} title="Prompts validados" value={validatedCount} color="blue" />
        <StatCard icon={Tag} title="Categorías activas" value={activeCategories} color="purple" />
        <StatCard icon={User} title="Perfiles activos" value={activeProfiles} color="green" />
        <StatCard
          icon={Clock}
          title="Última ejecución"
          value={latestRun ? RUN_STATUS_LABELS[latestRun.status] : 'Sin ejecuciones'}
          subtitle={latestRun ? formatRelativeDate(latestRun.created_at) : 'Sin ejecuciones todavía'}
          color="yellow"
        />
        <StatCard
          icon={Activity}
          title="Estado del sistema"
          value={systemOk ? 'Operativo' : 'Incompleto'}
          color={systemOk ? 'green' : 'yellow'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Resumen del motor</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Perfil activo</span><span className="font-medium text-gray-900">{activeProfile?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prompts validados</span><span className="font-medium text-gray-900">{validatedCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Estado</span><Badge variant={systemOk ? 'success' : 'warning'}>{systemOk ? 'Operativo' : 'Configuración pendiente'}</Badge></div>
              <div className="flex justify-between"><span className="text-gray-500">Última ejecución</span><span className="font-medium text-gray-900">{latestRun ? `${RUN_STATUS_LABELS[latestRun.status]} · ${formatRelativeDate(latestRun.created_at)}` : 'Sin ejecuciones todavía'}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Control de perfil</p>
            <ProfileSelector profiles={profiles} value={activeProfileId} onChange={onProfileChange} />
            <p className="text-sm text-gray-600">{enabledCount} de {profileLinks.length} prompts habilitados en el perfil.</p>
            {profileLinks.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orden de ejecución</p>
                {profileLinks.slice(0, 5).map(({ link, prompt }) => (
                  <p key={link.id} className="text-xs text-gray-700 truncate">
                    <span className="font-mono text-gray-400 mr-2">#{link.execution_order}</span>
                    {prompt?.name ?? 'Prompt no disponible'}
                  </p>
                ))}
                {profileLinks.length > 5 && <p className="text-xs text-gray-400">+{profileLinks.length - 5} más</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Prompts por categoría</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryCounts.map(({ category, count, colors }) => (
              <div key={category.id} className={`rounded-lg border px-4 py-3 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  <p className={`text-sm font-medium ${colors.text}`}>{category.label}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{count} prompt{count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Ejecuciones recientes</p>
          {executionRuns.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Sin ejecuciones"
              description="Todavía no hay ejecuciones del Motor IA PLIFE."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-2 pr-4 font-medium">Entidad</th>
                    <th className="pb-2 pr-4 font-medium">Perfil</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 pr-4 font-medium">Outputs</th>
                    <th className="pb-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {executionRuns.slice(0, 5).map(run => {
                    const runProfile = profiles.find(p => p.id === run.profile_id)
                    const outputCount = getOutputsForRun(run.id, executionOutputs).length
                    return (
                      <tr key={run.id}>
                        <td className="py-2.5 pr-4 text-gray-900">{formatRunEntityLabel(run, entityNames)}</td>
                        <td className="py-2.5 pr-4 text-gray-600">{runProfile?.name ?? '—'}</td>
                        <td className="py-2.5 pr-4"><Badge variant={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'destructive' : 'secondary'}>{RUN_STATUS_LABELS[run.status]}</Badge></td>
                        <td className="py-2.5 pr-4 text-gray-600">{outputCount}</td>
                        <td className="py-2.5 text-gray-500">{formatRelativeDate(run.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-gray-900">Insights del motor</p>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>{stages.length} etapas de ejecución comercial configuradas.</li>
              <li>{prompts.filter(p => p.status === 'draft').length} prompts en borrador pendientes de validación.</li>
              <li>El perfil {activeProfile?.name ?? 'activo'} agrupa {profileLinks.length} prompts comerciales.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-900">Calidad del sistema</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${validatedCount === prompts.length ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-gray-600">{validatedCount}/{prompts.length} prompts validados — {PROMPT_STATUS_LABELS.validated}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${activeCategories === categories.length ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-gray-600">{activeCategories} categorías activas para clasificación comercial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${systemOk ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-gray-600">Revisión humana integrada en el flujo PLIFE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
