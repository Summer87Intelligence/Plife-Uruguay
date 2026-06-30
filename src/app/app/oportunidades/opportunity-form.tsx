'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createOpportunity } from '@/domains/opportunities/actions'
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

interface OpportunityFormProps { onSuccess?: () => void }

export function OpportunityForm({ onSuccess }: OpportunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    type: 'b2c' as const,
    stage: 'nueva' as const,
    detected_need: '',
    suggested_product: '',
    commercial_risk: 'bajo' as const,
    next_action: '',
    next_action_date: '',
    notes: '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createOpportunity(form)
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
      <Input label="Producto sugerido (conceptual)" value={form.suggested_product} onChange={e => set('suggested_product', e.target.value)} placeholder="Seguro de vida, colectivo..." />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Riesgo comercial" value={form.commercial_risk} onValueChange={v => set('commercial_risk', v)} options={riskOptions} />
        <Input label="Fecha próxima acción" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
      </div>
      <Input label="Próxima acción" value={form.next_action} onChange={e => set('next_action', e.target.value)} />
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Crear oportunidad</Button>
      </div>
    </form>
  )
}
