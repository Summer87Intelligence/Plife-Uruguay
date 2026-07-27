'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Cpu, Tag, Layers, LayoutDashboard, Settings, FileText, Activity,
  AlertCircle, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import type { IAEngineProps, MainTab } from '@/components/ia/types'
import { getActiveProfile, getLatestRun } from '@/components/ia/helpers'
import { ProfileSelector } from '@/components/ia/profile-selector'
import { DashboardTab } from '@/components/ia/tab-dashboard'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'
import { ConfiguracionTab } from '@/components/ia/tab-configuracion'
import { PromptsTab } from '@/components/ia/tab-prompts'
import { CategoriasTab } from '@/components/ia/tab-categorias'
import { PerfilesTab } from '@/components/ia/tab-perfiles'
import { EjecucionesTab } from '@/components/ia/tab-ejecuciones'
import { CommercialEnginesOverview } from '@/components/ia/commercial-engines-overview'

interface IAViewProps extends IAEngineProps {
  schemaNotApplied?: boolean
  supabaseError?: string | null
}

const TABS: { id: MainTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
  { id: 'prompts', label: 'Prompts activos', icon: FileText },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'perfiles', label: 'Perfiles de análisis', icon: Layers },
  { id: 'ejecuciones', label: 'Ejecuciones', icon: Activity },
]

export function IAView({
  stages, categories, prompts, profiles, profilePrompts, executionRuns, executionOutputs, promptSuggestions, entityNames,
  schemaNotApplied, supabaseError,
}: IAViewProps) {
  const [tab, setTab] = useState<MainTab>('dashboard')
  const defaultProfile = getActiveProfile(profiles)
  const [activeProfileId, setActiveProfileId] = useState(defaultProfile?.id ?? profiles[0]?.id ?? '')

  const blocked = schemaNotApplied || !!supabaseError
  const validatedCount = prompts.filter(p => p.status === 'validated').length
  const activeCategories = categories.filter(c => c.is_active).length
  const activeProfiles = profiles.filter(p => p.is_active).length
  const latestRun = getLatestRun(executionRuns)
  const systemOk = validatedCount > 0 && activeProfiles > 0 && profilePrompts.length > 0

  const engineProps: IAEngineProps = {
    stages, categories, prompts, profiles, profilePrompts, executionRuns, executionOutputs, promptSuggestions, entityNames,
  }

  return (
    <div className="space-y-6">
      {/* Hero — Motores (presentación comercial) */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#1B3A6B] flex items-center justify-center shrink-0">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Motores</h1>
                <p className="text-sm text-gray-500 mt-0.5 max-w-2xl">
                  Usá los motores para ordenar una idea, detectar un nicho y preparar una propuesta comercial.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/app/propuestas/nueva">
                <FileText className="h-4 w-4" />
                Crear nueva propuesta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motores comerciales: qué hacen, disponibles, flujo y ejemplo */}
      <CommercialEnginesOverview />

      {/* Divisor: configuración técnica del motor de prompts */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Configuración técnica</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Config técnica: motor de prompts PLIFE (avanzado, ruta heredada /app/ia) */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Cpu className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Motor de prompts PLIFE</h2>
                <p className="text-sm text-gray-500 mt-0.5 max-w-xl">
                  Configuración avanzada: prompts, perfiles y ejecución por etapas (modo determinístico interno). Ruta técnica heredada.
                </p>
              </div>
            </div>
            {!blocked && profiles.length > 0 && (
              <ProfileSelector
                profiles={profiles}
                value={activeProfileId}
                onChange={setActiveProfileId}
                label="Perfil activo"
              />
            )}
          </div>

          {!blocked && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard title="Prompts validados" value={validatedCount} color="blue" />
              <StatCard title="Categorías activas" value={activeCategories} color="purple" />
              <StatCard title="Perfiles activos" value={activeProfiles} color="green" />
              <StatCard
                title="Última ejecución"
                value={latestRun ? 'Registrada' : 'Sin ejecuciones'}
                subtitle={latestRun ? undefined : 'Sin ejecuciones todavía'}
                color="yellow"
              />
              <StatCard title="Estado del sistema" value={systemOk ? 'Operativo' : 'Incompleto'} color={systemOk ? 'green' : 'yellow'} />
            </div>
          )}
        </CardContent>
      </Card>

      <SectionGuideCard
        title="Cómo usar el motor de prompts"
        description="Usá el motor de prompts para preparar seguimiento, mensajes y lectura comercial. Los outputs siempre requieren revisión humana antes de usarse. No define primas, coberturas ni reemplaza condiciones MAPFRE."
        steps={[
          'Revisá el perfil comercial PLIFE activo',
          'Verificá que los prompts estén validados',
          'Ejecutá el análisis desde la empresa u oportunidad',
          'Revisá los outputs antes de usarlos',
        ]}
        nextStep="Siempre con revisión humana"
      />

      {schemaNotApplied && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Schema del motor de prompts no aplicado</p>
            <p className="text-sm text-orange-700 mt-0.5">
              Las tablas del motor IA no existen en la base de datos. Contactá al administrador
              del sistema para aplicar la configuración pendiente.
            </p>
          </div>
        </div>
      )}

      {supabaseError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error al conectar con la base de datos</p>
            <p className="mt-1 text-xs text-red-600 font-mono break-all">{supabaseError}</p>
          </div>
        </div>
      )}

      {!blocked && (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-[#1B3A6B] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'dashboard' && (
            <DashboardTab {...engineProps} activeProfileId={activeProfileId} onProfileChange={setActiveProfileId} />
          )}
          {tab === 'configuracion' && (
            <ConfiguracionTab {...engineProps} activeProfileId={activeProfileId} onProfileChange={setActiveProfileId} />
          )}
          {tab === 'prompts' && (
            <PromptsTab {...engineProps} activeProfileId={activeProfileId} onProfileChange={setActiveProfileId} />
          )}
          {tab === 'categorias' && (
            <CategoriasTab categories={categories} prompts={prompts} />
          )}
          {tab === 'perfiles' && (
            <PerfilesTab {...engineProps} />
          )}
          {tab === 'ejecuciones' && (
            <EjecucionesTab
              executionRuns={executionRuns}
              executionOutputs={executionOutputs}
              profiles={profiles}
              prompts={prompts}
              stages={stages}
              entityNames={entityNames}
              activeProfileId={activeProfileId}
            />
          )}
        </>
      )}
    </div>
  )
}
