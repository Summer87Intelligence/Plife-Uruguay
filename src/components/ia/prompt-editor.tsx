'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { AICategory, AIPrompt, AIStage, AIPromptStatus } from '@/types/database'
import { updatePrompt, type PromptFormData } from '@/app/app/ia/actions'
import { buildPromptPreview, PROMPT_STATUS_LABELS } from './helpers'

interface PromptEditorProps {
  prompt: AIPrompt
  categories: AICategory[]
  stages: AIStage[]
  onClose: () => void
  onSaved?: () => void
}

export function PromptEditor({ prompt, categories, stages, onClose, onSaved }: PromptEditorProps) {
  const [name, setName] = useState(prompt.name)
  const [description, setDescription] = useState(prompt.description ?? '')
  const [categoryId, setCategoryId] = useState(prompt.category_id ?? '')
  const [stageId, setStageId] = useState(prompt.stage_id ?? '')
  const [rolePersona, setRolePersona] = useState(prompt.role_persona)
  const [contextEnvironment, setContextEnvironment] = useState(prompt.context_environment)
  const [objective, setObjective] = useState(prompt.objective)
  const [specificTask, setSpecificTask] = useState(prompt.specific_task)
  const [constraints, setConstraints] = useState(prompt.constraints)
  const [outputFormat, setOutputFormat] = useState(prompt.output_format)
  const [targetAudience, setTargetAudience] = useState(prompt.target_audience)
  const [status, setStatus] = useState<AIPromptStatus>(prompt.status)
  const [isActive, setIsActive] = useState(prompt.is_active)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = buildPromptPreview({
    role_persona: rolePersona,
    context_environment: contextEnvironment,
    objective,
    specific_task: specificTask,
    constraints,
    output_format: outputFormat,
    target_audience: targetAudience,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const data: Partial<PromptFormData> = {
      name,
      description: description || undefined,
      category_id: categoryId || null,
      stage_id: stageId || null,
      role_persona: rolePersona,
      context_environment: contextEnvironment,
      objective,
      specific_task: specificTask,
      constraints,
      output_format: outputFormat,
      target_audience: targetAudience,
      status,
      is_active: isActive,
    }
    const result = await updatePrompt(prompt.id, data)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSaved?.()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#1B3A6B]/20 bg-slate-50/50 p-5 space-y-4 mt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">Editor de prompt comercial</p>
        <Badge variant={status === 'validated' ? 'success' : status === 'draft' ? 'warning' : 'secondary'}>
          {PROMPT_STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Categoría</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <Input label="Descripción" value={description} onChange={e => setDescription(e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Etapa de ejecución</label>
          <select value={stageId} onChange={e => setStageId(e.target.value)} className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="">Sin etapa</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select value={status} onChange={e => setStatus(e.target.value as AIPromptStatus)} className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="draft">Borrador</option>
            <option value="validated">Validado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      <Textarea label="Rol / Persona" value={rolePersona} onChange={e => setRolePersona(e.target.value)} rows={2} />
      <Textarea label="Contexto / Entorno" value={contextEnvironment} onChange={e => setContextEnvironment(e.target.value)} rows={2} />
      <Textarea label="Objetivo" value={objective} onChange={e => setObjective(e.target.value)} rows={2} />
      <Textarea label="Tarea específica" value={specificTask} onChange={e => setSpecificTask(e.target.value)} rows={2} />
      <Textarea label="Restricciones / Limitaciones" value={constraints} onChange={e => setConstraints(e.target.value)} rows={2} />
      <Textarea label="Formato de salida" value={outputFormat} onChange={e => setOutputFormat(e.target.value)} rows={2} />
      <Textarea label="Público objetivo" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} rows={2} />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vista previa del prompt final</p>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">{preview}</pre>
      </div>

      <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sugerencias de mejora</p>
        <p className="text-sm text-gray-400">Las sugerencias automáticas estarán disponibles en una próxima fase.</p>
      </div>

      <div className="flex items-center gap-2">
        <input id={`active-${prompt.id}`} type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]" />
        <label htmlFor={`active-${prompt.id}`} className="text-sm text-gray-700">Prompt activo en catálogo</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button type="submit" size="sm" loading={loading}>Guardar prompt</Button>
      </div>
    </form>
  )
}
