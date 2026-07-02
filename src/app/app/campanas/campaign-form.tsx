'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CreateSuccessPanel } from '@/components/ui/create-success-panel'
import { createCampaign, updateCampaign, type CampaignFormData } from '@/domains/campaigns/actions'
import { CAMPAIGN_STATUS_LABELS } from '@/lib/constants'
import type { CampaignType } from '@/types/database'

const typeOptions = [
  { value: 'duenos_pymes', label: 'Dueños de Pymes' },
  { value: 'empresas_familiares', label: 'Empresas familiares' },
  { value: 'estudios_contables', label: 'Estudios contables' },
  { value: 'estudios_juridicos', label: 'Estudios jurídicos' },
  { value: 'clinicas', label: 'Clínicas / Salud' },
  { value: 'empresas_tech', label: 'Empresas tech' },
  { value: 'constructoras', label: 'Constructoras' },
  { value: 'clubes_asociaciones', label: 'Clubes y asociaciones' },
  { value: 'profesionales_independientes', label: 'Profesionales independientes' },
  { value: 'ejecutivos', label: 'Ejecutivos' },
  { value: 'reclutamiento_asesores', label: 'Reclutamiento asesores' },
  { value: 'general', label: 'General' },
]
const statusOptions = Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({ value, label }))

interface CampaignFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  campaignId?: string
  initial?: Partial<CampaignFormData>
}

export function CampaignForm({ onSuccess, onCancel, mode = 'create', campaignId, initial }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [created, setCreated] = useState<{ id: string } | null>(null)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? 'general',
    status: initial?.status ?? 'borrador',
    objective: initial?.objective ?? '',
    target_segment: initial?.target_segment ?? '',
    icp_description: initial?.icp_description ?? '',
    initial_message: initial?.initial_message ?? '',
    call_script: initial?.call_script ?? '',
    objections_text: (initial?.expected_objections ?? []).join('\n'),
    start_date: initial?.start_date ?? '',
    end_date: initial?.end_date ?? '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Ingresá el nombre de la campaña.'
    if (!form.objective.trim()) errs.objective = 'Escribí un objetivo comercial claro.'
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      errs.end_date = 'La fecha de fin debe ser posterior a la de inicio.'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    setErrors({})
    setLoading(true)
    setError('')
    const payload: CampaignFormData = {
      name: form.name.trim(),
      type: form.type as CampaignType,
      status: form.status as CampaignFormData['status'],
      objective: form.objective,
      target_segment: form.target_segment,
      icp_description: form.icp_description,
      initial_message: form.initial_message,
      call_script: form.call_script,
      expected_objections: form.objections_text.split('\n').map(s => s.trim()).filter(Boolean),
      start_date: form.start_date,
      end_date: form.end_date,
    }
    const result = mode === 'edit' && campaignId
      ? await updateCampaign(campaignId, payload)
      : await createCampaign(payload)
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
        message="Campaña creada. Siguiente paso recomendado: revisar el detalle y activarla cuando esté lista."
        primaryAction={{ label: 'Ver campaña', href: `/app/campanas/${created.id}` }}
        secondaryAction={{ label: 'Ver todas las campañas', href: '/app/campanas' }}
        onClose={onSuccess}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-gray-500">Los campos con * son obligatorios.</p>
      <Input label="Nombre de campaña *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Dueños de pymes — Q3" error={errors.name} />
      <Input label="Segmento" value={form.target_segment} onChange={e => set('target_segment', e.target.value)} placeholder="Ej: Pymes de servicios con 10–50 empleados" />
      <Input label="Objetivo comercial *" value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="Ej: Generar 15 reuniones con dueños de empresa" error={errors.objective} />
      <Textarea label="Mensaje inicial" value={form.initial_message} onChange={e => set('initial_message', e.target.value)} rows={3} placeholder="Mensaje de apertura para el primer contacto..." />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Tipo de campaña" value={form.type} onValueChange={v => set('type', v)} options={typeOptions} />
        <Select label="Estado" value={form.status} onValueChange={v => set('status', v)} options={statusOptions} />
      </div>
      <details className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-gray-600 py-1">Más datos (guion, objeciones, fechas)</summary>
        <div className="space-y-4 pt-3">
          <Textarea label="Descripción del cliente ideal" value={form.icp_description} onChange={e => set('icp_description', e.target.value)} rows={2} placeholder="Quién es el cliente ideal, características, señales de compra..." />
          <Textarea label="Guion de llamada" value={form.call_script} onChange={e => set('call_script', e.target.value)} rows={3} placeholder="Estructura sugerida para la llamada..." />
          <Textarea label="Objeciones esperadas (una por línea)" value={form.objections_text} onChange={e => set('objections_text', e.target.value)} rows={3} placeholder={'Ya tengo seguro\nEs caro\nLo voy a pensar'} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            <Input label="Fecha fin" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} error={errors.end_date} />
          </div>
        </div>
      </details>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear campaña'}</Button>
      </div>
    </form>
  )
}
