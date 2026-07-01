'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CreateSuccessPanel } from '@/components/ui/create-success-panel'
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
  onCancel?: () => void
  contactId?: string
  companyId?: string
  campaignId?: string
  defaultType?: 'b2c' | 'b2b' | 'reclutamiento'
  mode?: 'create' | 'edit'
  opportunityId?: string
  initial?: Partial<OpportunityFormData>
}

export function OpportunityForm({ onSuccess, onCancel, contactId, companyId, campaignId, defaultType = 'b2c', mode = 'create', opportunityId, initial }: OpportunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ id: string } | null>(null)
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
    } else if (mode === 'create' && result.data) {
      router.refresh()
      setCreated({ id: result.data.id })
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  if (created) {
    return (
      <CreateSuccessPanel
        message="Oportunidad creada. Siguiente paso recomendado: definir seguimiento."
        primaryAction={{ label: 'Ver oportunidad', href: `/app/oportunidades/${created.id}` }}
        secondaryAction={{ label: 'Ir al pipeline', href: '/app/oportunidades' }}
        onClose={onSuccess}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">Los campos con * son obligatorios.</p>
      <Input label="Nombre de la oportunidad *" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Ej: Seguro de vida — Familia González" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Tipo" value={form.type} onValueChange={v => set('type', v)} options={typeOptions} />
        <Select label="Etapa" value={form.stage} onValueChange={v => set('stage', v)} options={stageOptions} />
      </div>
      <Input label="Potencial estimado (USD)" type="number" min={0} value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} placeholder="Valor aproximado de la venta" />
      <Input label="Próximo paso" value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="Ej: Enviar propuesta conceptual, agendar segunda reunión..." />
      <Input label="Fecha de seguimiento" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
      <details className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-gray-600 py-1">Más datos (necesidad, producto, riesgo)</summary>
        <div className="space-y-4 pt-3">
          <Input label="Necesidad detectada" value={form.detected_need} onChange={e => set('detected_need', e.target.value)} placeholder="Qué necesidad expresó el cliente..." />
          <Input label="Producto sugerido (conceptual)" value={form.suggested_product} onChange={e => set('suggested_product', e.target.value)} placeholder="Seguro de vida, colectivo, protección empresarial..." />
          <Select label="Nivel de riesgo comercial" value={form.commercial_risk} onValueChange={v => set('commercial_risk', v)} options={riskOptions} />
          <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Contexto adicional..." />
        </div>
      </details>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear oportunidad'}</Button>
      </div>
    </form>
  )
}
