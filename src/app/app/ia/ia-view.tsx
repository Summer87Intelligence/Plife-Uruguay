'use client'
import { useState } from 'react'
import {
  Cpu, Tag, Layers, LayoutDashboard, Plus, Pencil,
  ChevronDown, ChevronUp, Link2, CheckCircle2, AlertCircle,
  GitBranch, FileText, User, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Textarea } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { formatRelativeDate } from '@/lib/utils'
import type { AIStage, AICategory, AIPrompt, AIAnalysisProfile, AIProfilePrompt, AIPromptStatus } from '@/types/database'
import {
  createCategory, updateCategory,
  createProfile, updateProfile,
  addPromptToProfile, updateProfilePrompt,
  type CategoryFormData, type ProfileFormData, type AddPromptFormData,
} from './actions'

interface IAViewProps {
  stages: AIStage[]
  categories: AICategory[]
  prompts: AIPrompt[]
  profiles: AIAnalysisProfile[]
  profilePrompts: AIProfilePrompt[]
  schemaNotApplied?: boolean
  supabaseError?: string | null
}

type MainTab = 'dashboard' | 'categorias' | 'perfiles'

const PROMPT_STATUS_LABELS: Record<AIPromptStatus, string> = {
  draft: 'Borrador',
  validated: 'Validado',
  archived: 'Archivado',
}

const PROMPT_STATUS_VARIANTS: Record<AIPromptStatus, 'warning' | 'success' | 'secondary'> = {
  draft: 'warning',
  validated: 'success',
  archived: 'secondary',
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function IAView({
  stages, categories, prompts, profiles, profilePrompts,
  schemaNotApplied, supabaseError,
}: IAViewProps) {
  const [tab, setTab] = useState<MainTab>('dashboard')

  const blocked = schemaNotApplied || !!supabaseError

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Motor IA</h1>
          <p className="text-sm text-gray-500">Configuración del motor de análisis inteligente PLIFE</p>
        </div>
      </div>

      {/* Schema not applied — 42P01 */}
      {schemaNotApplied && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Schema del Motor IA no aplicado</p>
            <p className="text-sm text-orange-700 mt-0.5">
              Las tablas del motor IA no existen en la base de datos.
              Ejecutar FASE 12O-D antes de usar esta pantalla.
            </p>
          </div>
        </div>
      )}

      {/* Other Supabase error */}
      {supabaseError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error al conectar con la base de datos</p>
            <p className="mt-1 text-xs text-red-600 font-mono break-all">{supabaseError}</p>
          </div>
        </div>
      )}

      {/* Tabs — only when schema is present and no errors */}
      {!blocked && (
        <>
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden w-fit">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'categorias', label: 'Categorías', icon: Tag },
              { id: 'perfiles', label: 'Perfiles', icon: Layers },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'dashboard' && (
            <DashboardTab
              stages={stages}
              categories={categories}
              prompts={prompts}
              profiles={profiles}
              profilePrompts={profilePrompts}
            />
          )}
          {tab === 'categorias' && (
            <CategoriasTab categories={categories} />
          )}
          {tab === 'perfiles' && (
            <PerfilesTab
              stages={stages}
              categories={categories}
              prompts={prompts}
              profiles={profiles}
              profilePrompts={profilePrompts}
            />
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 1 — Dashboard
// ---------------------------------------------------------------------------

function DashboardTab({ stages, categories, prompts, profiles, profilePrompts }: IAViewProps) {
  const activeProfiles = profiles.filter(p => p.is_active)
  const hasActiveConfig = activeProfiles.length > 0 && profilePrompts.length > 0

  const allDates = [
    ...categories.map(c => c.updated_at),
    ...prompts.map(p => p.updated_at),
    ...profiles.map(p => p.updated_at),
  ].filter(Boolean).sort().reverse()
  const lastUpdated = allDates[0] ?? null

  return (
    <div className="space-y-6">
      <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
        hasActiveConfig ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
      }`}>
        {hasActiveConfig
          ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
          : <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        }
        <div>
          <p className={`text-sm font-medium ${hasActiveConfig ? 'text-green-800' : 'text-yellow-800'}`}>
            {hasActiveConfig ? 'Configuración lista' : 'Configuración incompleta'}
          </p>
          <p className={`text-xs mt-0.5 ${hasActiveConfig ? 'text-green-600' : 'text-yellow-600'}`}>
            {hasActiveConfig
              ? `${activeProfiles.length} perfil${activeProfiles.length > 1 ? 'es activos' : ' activo'} con prompts vinculados.`
              : 'Se necesita al menos un perfil activo con prompts vinculados para ejecutar el motor.'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={GitBranch} title="Etapas IA"   value={stages.length}        color="blue"   />
        <StatCard icon={Tag}       title="Categorías"  value={categories.length}    color="purple" />
        <StatCard icon={FileText}  title="Prompts"     value={prompts.length}       color="yellow" />
        <StatCard icon={User}      title="Perfiles"    value={profiles.length}      color="green"  />
        <StatCard icon={Link2}     title="Vínculos"    value={profilePrompts.length} color="blue"  />
      </div>

      {lastUpdated ? (
        <p className="text-xs text-gray-400">
          Última modificación: {formatRelativeDate(lastUpdated)}
        </p>
      ) : (
        <p className="text-xs text-gray-400">Sin configuración guardada todavía.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 2 — Categorías
// ---------------------------------------------------------------------------

function CategoriasTab({ categories }: { categories: AICategory[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AICategory | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {categories.length} {categories.length === 1 ? 'categoría configurada' : 'categorías configuradas'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin categorías"
          description="Las categorías clasifican los prompts por tipo de análisis."
          example="Estratégico, Operativo, Riesgo, Oportunidad..."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear primera categoría
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                      {cat.key}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5 max-w-md">{cat.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">tono: {cat.tone}</span>
                    <span className="text-xs text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{formatRelativeDate(cat.updated_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={cat.is_active ? 'success' : 'secondary'}>
                    {cat.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                  <Button size="icon" variant="ghost" onClick={() => setEditTarget(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="Nueva categoría"
          description="Define un nuevo tipo de análisis para los prompts del motor"
        >
          <CategoryForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent title="Editar categoría" description={editTarget?.label}>
          {editTarget && (
            <CategoryForm initial={editTarget} onSuccess={() => setEditTarget(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryForm({ initial, onSuccess }: { initial?: AICategory; onSuccess: () => void }) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [key, setKey] = useState(initial?.key ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tone, setTone] = useState(initial?.tone ?? 'neutral')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const data: CategoryFormData = { label, key, description: description || undefined, tone, is_active: isActive }
    const result = initial ? await updateCategory(initial.id, data) : await createCategory(data)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={label}
        onChange={e => setLabel(e.target.value)}
        required
        placeholder="Ej: Estratégico"
      />
      <Input
        label="Slug"
        value={key}
        onChange={e => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
        required
        hint="Solo minúsculas, números y guión bajo"
        disabled={!!initial}
        placeholder="Ej: estrategico"
      />
      <Input
        label="Descripción"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Descripción breve de esta categoría"
      />
      <Input
        label="Tono"
        value={tone}
        onChange={e => setTone(e.target.value)}
        placeholder="neutral"
        hint="Ej: formal, consultivo, directo, neutral"
      />
      <div className="flex items-center gap-2">
        <input
          id="cat-active"
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#1B3A6B] accent-[#1B3A6B]"
        />
        <label htmlFor="cat-active" className="text-sm text-gray-700">Categoría activa</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild>
          <Button type="button" variant="outline" size="sm">Cancelar</Button>
        </DialogClose>
        <Button type="submit" size="sm" loading={loading}>
          {initial ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Tab 3 — Perfiles
// ---------------------------------------------------------------------------

function PerfilesTab({ stages, categories, prompts, profiles, profilePrompts }: IAViewProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AIAnalysisProfile | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addPromptForProfile, setAddPromptForProfile] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {profiles.length} {profiles.length === 1 ? 'perfil de análisis' : 'perfiles de análisis'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo perfil
        </Button>
      </div>

      {profiles.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Sin perfiles"
          description="Los perfiles agrupan prompts para ejecutar análisis completos sobre contactos, empresas u oportunidades."
          example="Análisis inicial de empresa, Due diligence B2B, Diagnóstico de oportunidad..."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear primer perfil
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {profiles.map(profile => {
            const linked = profilePrompts.filter(pp => pp.profile_id === profile.id)
            const isExpanded = expandedId === profile.id

            return (
              <Card key={profile.id}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                      <Badge variant={profile.is_active ? 'success' : 'secondary'}>
                        {profile.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {profile.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{profile.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {profile.target_client_type && (
                        <span className="text-xs text-gray-400">Cliente: {profile.target_client_type}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {linked.length} prompt{linked.length !== 1 ? 's' : ''} vinculado{linked.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatRelativeDate(profile.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setEditTarget(profile)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Prompts vinculados
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddPromptForProfile(profile.id)}
                        disabled={prompts.length === 0}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar prompt
                      </Button>
                    </div>

                    {linked.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">
                        Sin prompts vinculados. Usá &ldquo;Agregar prompt&rdquo; para comenzar.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {[...linked].sort((a, b) => a.execution_order - b.execution_order).map(pp => {
                          const prompt = prompts.find(p => p.id === pp.prompt_id)
                          const stage = prompt ? stages.find(s => s.id === prompt.stage_id) : null
                          const category = prompt ? categories.find(c => c.id === prompt.category_id) : null

                          return (
                            <div key={pp.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                              <span className="text-xs font-mono text-gray-400 w-8 text-right shrink-0">
                                #{pp.execution_order}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {prompt?.name ?? (
                                    <span className="text-gray-400 italic">Prompt no disponible</span>
                                  )}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {stage && <span className="text-xs text-gray-400">{stage.label}</span>}
                                  {category && (
                                    <>
                                      {stage && <span className="text-xs text-gray-300">·</span>}
                                      <span className="text-xs text-gray-400">{category.label}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {prompt && (
                                  <Badge variant={PROMPT_STATUS_VARIANTS[prompt.status]}>
                                    {PROMPT_STATUS_LABELS[prompt.status]}
                                  </Badge>
                                )}
                                <EnabledToggle id={pp.id} initial={pp.enabled_by_default} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="Nuevo perfil de análisis"
          description="Agrupa prompts para un objetivo de análisis específico"
        >
          <ProfileForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent title="Editar perfil" description={editTarget?.name}>
          {editTarget && (
            <ProfileForm initial={editTarget} onSuccess={() => setEditTarget(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!addPromptForProfile} onOpenChange={open => { if (!open) setAddPromptForProfile(null) }}>
        <DialogContent
          title="Agregar prompt al perfil"
          description="Seleccioná un prompt activo para vincularlo a este perfil"
        >
          {addPromptForProfile && (
            <AddPromptForm
              profileId={addPromptForProfile}
              prompts={prompts}
              alreadyLinked={profilePrompts.filter(pp => pp.profile_id === addPromptForProfile).map(pp => pp.prompt_id)}
              nextOrder={
                Math.max(0, ...profilePrompts.filter(pp => pp.profile_id === addPromptForProfile).map(pp => pp.execution_order)) + 10
              }
              onSuccess={() => setAddPromptForProfile(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProfileForm({ initial, onSuccess }: { initial?: AIAnalysisProfile; onSuccess: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetClientType, setTargetClientType] = useState(initial?.target_client_type ?? '')
  const [targetIndustries, setTargetIndustries] = useState(initial?.target_industries ?? '')
  const [baseInstructions, setBaseInstructions] = useState(initial?.base_instructions ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const data: ProfileFormData = {
      name,
      description: description || undefined,
      target_client_type: targetClientType || undefined,
      target_industries: targetIndustries || undefined,
      base_instructions: baseInstructions,
      is_active: isActive,
    }
    const result = initial ? await updateProfile(initial.id, data) : await createProfile(data)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        placeholder="Ej: Análisis inicial empresa B2B"
      />
      <Input
        label="Descripción"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Propósito y alcance de este perfil"
      />
      <Input
        label="Tipo de cliente objetivo"
        value={targetClientType}
        onChange={e => setTargetClientType(e.target.value)}
        placeholder="Ej: empresarial, individual, pyme..."
      />
      <Input
        label="Industrias objetivo"
        value={targetIndustries}
        onChange={e => setTargetIndustries(e.target.value)}
        placeholder="Ej: salud, tecnología, finanzas..."
      />
      <Textarea
        label="Instrucciones base"
        value={baseInstructions}
        onChange={e => setBaseInstructions(e.target.value)}
        rows={3}
        placeholder="Directivas generales que aplican a todos los prompts de este perfil..."
      />
      <div className="flex items-center gap-2">
        <input
          id="prof-active"
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]"
        />
        <label htmlFor="prof-active" className="text-sm text-gray-700">Perfil activo</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild>
          <Button type="button" variant="outline" size="sm">Cancelar</Button>
        </DialogClose>
        <Button type="submit" size="sm" loading={loading}>
          {initial ? 'Guardar cambios' : 'Crear perfil'}
        </Button>
      </div>
    </form>
  )
}

function AddPromptForm({
  profileId,
  prompts,
  alreadyLinked,
  nextOrder,
  onSuccess,
}: {
  profileId: string
  prompts: AIPrompt[]
  alreadyLinked: string[]
  nextOrder: number
  onSuccess: () => void
}) {
  const available = prompts.filter(p => p.is_active && !alreadyLinked.includes(p.id))
  const [promptId, setPromptId] = useState(available[0]?.id ?? '')
  const [order, setOrder] = useState(String(nextOrder))
  const [enabledByDefault, setEnabledByDefault] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (available.length === 0) {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-sm text-gray-500">No hay prompts activos disponibles para vincular.</p>
        <p className="text-xs text-gray-400">Activá prompts en la sección de administración del motor.</p>
        <DialogClose asChild>
          <Button variant="outline" size="sm" className="mt-4">Cerrar</Button>
        </DialogClose>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptId) return
    setLoading(true)
    setError(null)
    const data: AddPromptFormData = {
      profile_id: profileId,
      prompt_id: promptId,
      execution_order: parseInt(order, 10) || nextOrder,
      enabled_by_default: enabledByDefault,
    }
    const result = await addPromptToProfile(data)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Prompt</label>
        <select
          value={promptId}
          onChange={e => setPromptId(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        >
          {available.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — {PROMPT_STATUS_LABELS[p.status]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Orden de ejecución"
        type="number"
        value={order}
        onChange={e => setOrder(e.target.value)}
        min={1}
        max={9999}
        hint="Los prompts se ejecutan de menor a mayor orden"
      />
      <div className="flex items-center gap-2">
        <input
          id="enabled-default"
          type="checkbox"
          checked={enabledByDefault}
          onChange={e => setEnabledByDefault(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]"
        />
        <label htmlFor="enabled-default" className="text-sm text-gray-700">Activo por defecto</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild>
          <Button type="button" variant="outline" size="sm">Cancelar</Button>
        </DialogClose>
        <Button type="submit" size="sm" loading={loading} disabled={!promptId}>
          Vincular prompt
        </Button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Inline toggle for enabled_by_default on profile_prompts
// ---------------------------------------------------------------------------

function EnabledToggle({ id, initial }: { id: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const result = await updateProfilePrompt(id, { enabled_by_default: !enabled })
    setLoading(false)
    if (!result.error) setEnabled(!enabled)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
        enabled
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {loading ? (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : enabled ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-current" />
      )}
      {enabled ? 'Activo' : 'Inactivo'}
    </button>
  )
}
