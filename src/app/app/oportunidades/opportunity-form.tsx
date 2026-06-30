'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createOpportunity, updateOpportunity, type OpportunityFormData } from '@/domains/opportunities/actions'
import { OPPORTUNITY_STAGE_LABELS } from '@/lib/constants'

const typeOptions = [
  { value: 'b2c', label: 'B2C — Persona' },
  { value: 'b2b', label: 'B2B — Empresa' },
  { value: 'reclutamiento', label: 'Reclutamiento' },
]
const stageOptions = Object.entries(OPPORTUNITY_STAGE_LABELS).map(([value, label]) => ({ value, label }))
const riskOptions = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
]

interface OpportunityFormProps {
  onSuccess?: () => void
  contactId?: string
  companyId?: string
  campaignId?: string
  defaultType?: 'b2c' | 'b2b' | 'reclutamiento'
  mode?: 'create' | 'edit'
  opportunityId?: string
  initial?: Partial<OpportunityFormData>
}

export function OpportunityForm({ onSuccess, contactId, companyId, campaignId, defaultType = 'b2c', mode = 'create', opportunityId, initial }: OpportunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    type: initial?.type ?? defaultType,
    stage: initial?.stage ?? 'nueva',
    estimated_value: initial?.estimated_value != null ? String(initial.estimated_value) : '',
    detected_need: initial?.detected_need ?? '',
    suggested_product: initial?.suggested_product ?? '',
    commercial_risk: initial?.commercial_risk ?? 'bajo',
    next_action: initial?.next_action ?? '',
    next_action_date: initial?.next_action_date ?? '',
    notes: initial?.notes ?? '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const payload = {
      ...form,
      estimated_value: form.estimated_value !== '' ? Number(form.estimated_value) : undefined,
    }
    const result = mode === 'edit' && opportunityId
      ? await updateOpportunity(opportunityId, payload as Partial<OpportunityFormData>)
      : await createOpportunity({
          ...payload,
          contact_id: contactId,
          company_id: companyId,
          campaign_id: campaignId,
        } as OpportunityFormData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Título *" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Ej: Seguro vida - Juan Pérez" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Tipo" value={form.type} onValueChange={v => set('type', v)} options={typeOptions} />
        <Select label="Etapa inicial" value={form.stage} onValueChange={v => set('stage', v)} options={stageOptions} />
      </div>
      <Input label="Necesidad detectada" value={form.detected_need} onChange={e => set('detected_need', e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Producto sugerido (conceptual)" value={form.suggested_product} onChange={e => set('suggested_product', e.target.value)} placeholder="Seguro de vida, colectivo..." />
        <Input label="Valor estimado (USD)" type="number" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Riesgo comercial" value={form.commercial_risk} onValueChange={v => set('commercial_risk', v)} options={riskOptions} />
        <Input label="Fecha próxima acción" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
      </div>
      <Input label="Próxima acción" value={form.next_action} onChange={e => set('next_action', e.target.value)} />
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear oportunidad'}</Button>
      </div>
    </form>
  )
}
