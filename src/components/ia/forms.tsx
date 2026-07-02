'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { DialogClose } from '@/components/ui/dialog'
import type { AICategory, AIPrompt, AIAnalysisProfile } from '@/types/database'
import {
  createCategory, updateCategory,
  createProfile, updateProfile,
  addPromptToProfile, updateProfilePrompt,
  type CategoryFormData, type ProfileFormData, type AddPromptFormData,
} from '@/app/app/ia/actions'
import { PROMPT_STATUS_LABELS } from './helpers'

export function CategoryForm({ initial, onSuccess }: { initial?: AICategory; onSuccess: () => void }) {
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
      <Input label="Nombre" value={label} onChange={e => setLabel(e.target.value)} required placeholder="Ej: Investigación comercial" />
      <Input
        label="Slug"
        value={key}
        onChange={e => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
        required
        hint="Solo minúsculas, números y guión bajo"
        disabled={!!initial}
        placeholder="Ej: investigacion"
      />
      <Input label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción breve de esta categoría" />
      <Input label="Tono" value={tone} onChange={e => setTone(e.target.value)} placeholder="neutral" hint="Ej: formal, consultivo, directo" />
      <div className="flex items-center gap-2">
        <input id="cat-active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]" />
        <label htmlFor="cat-active" className="text-sm text-gray-700">Categoría activa</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild><Button type="button" variant="outline" size="sm">Cancelar</Button></DialogClose>
        <Button type="submit" size="sm" loading={loading}>{initial ? 'Guardar cambios' : 'Crear categoría'}</Button>
      </div>
    </form>
  )
}

export function ProfileForm({ initial, onSuccess }: { initial?: AIAnalysisProfile; onSuccess: () => void }) {
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
      <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Comercial PLIFE" />
      <Input label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Propósito y alcance de este perfil" />
      <Input label="Tipo de cliente objetivo" value={targetClientType} onChange={e => setTargetClientType(e.target.value)} placeholder="Ej: empresarial, pyme..." />
      <Input label="Industrias objetivo" value={targetIndustries} onChange={e => setTargetIndustries(e.target.value)} placeholder="Ej: salud, tecnología, finanzas..." />
      <Textarea label="Instrucciones base" value={baseInstructions} onChange={e => setBaseInstructions(e.target.value)} rows={3} placeholder="Directivas generales para todos los prompts del perfil..." />
      <div className="flex items-center gap-2">
        <input id="prof-active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]" />
        <label htmlFor="prof-active" className="text-sm text-gray-700">Perfil activo</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild><Button type="button" variant="outline" size="sm">Cancelar</Button></DialogClose>
        <Button type="submit" size="sm" loading={loading}>{initial ? 'Guardar cambios' : 'Crear perfil'}</Button>
      </div>
    </form>
  )
}

export function AddPromptForm({
  profileId, prompts, alreadyLinked, nextOrder, onSuccess,
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
        <DialogClose asChild><Button variant="outline" size="sm" className="mt-4">Cerrar</Button></DialogClose>
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
        <select value={promptId} onChange={e => setPromptId(e.target.value)} className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
          {available.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {PROMPT_STATUS_LABELS[p.status]}</option>
          ))}
        </select>
      </div>
      <Input label="Orden de ejecución" type="number" value={order} onChange={e => setOrder(e.target.value)} min={1} max={9999} hint="Los prompts se ejecutan de menor a mayor orden" />
      <div className="flex items-center gap-2">
        <input id="enabled-default" type="checkbox" checked={enabledByDefault} onChange={e => setEnabledByDefault(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]" />
        <label htmlFor="enabled-default" className="text-sm text-gray-700">Activo por defecto</label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <DialogClose asChild><Button type="button" variant="outline" size="sm">Cancelar</Button></DialogClose>
        <Button type="submit" size="sm" loading={loading} disabled={!promptId}>Vincular prompt</Button>
      </div>
    </form>
  )
}

export function EnabledToggle({ id, initial }: { id: string; initial: boolean }) {
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
        enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {loading ? (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : enabled ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-current" />}
      {enabled ? 'Activo' : 'Inactivo'}
    </button>
  )
}
