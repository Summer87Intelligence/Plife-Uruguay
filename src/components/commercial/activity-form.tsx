'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { addActivity } from '@/domains/contacts/actions'
import { ACTIVITY_TYPE_LABELS } from '@/lib/constants'

const activityTypeOptions = Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => ({ value, label }))

interface ActivityFormProps {
  contactId?: string
  opportunityId?: string
  companyId?: string
  onSuccess?: () => void
}

type ActivityType = 'llamada' | 'reunion' | 'mensaje' | 'email' | 'nota' | 'tarea' | 'whatsapp' | 'linkedin'

export function ActivityForm({ contactId, opportunityId, companyId, onSuccess }: ActivityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'llamada' as ActivityType,
    title: '',
    description: '',
    outcome: '',
    scheduled_at: '',
    is_completed: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await addActivity({
      contact_id: contactId,
      opportunity_id: opportunityId,
      company_id: companyId,
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      outcome: form.outcome || undefined,
      scheduled_at: form.scheduled_at || undefined,
      is_completed: form.is_completed,
    })
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
      <Select label="Tipo" value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as ActivityType }))} options={activityTypeOptions} />
      <Input label="Título *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ej: Llamada de seguimiento" />
      <Textarea label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Qué se conversó..." />
      <Textarea label="Resultado" value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} rows={2} placeholder="Cómo reaccionó, próximos pasos..." />
      <div className="grid grid-cols-2 gap-4 items-end">
        <Input label="Fecha programada" type="date" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
        <label className="flex items-center gap-2 h-9">
          <input type="checkbox" checked={form.is_completed} onChange={e => setForm(p => ({ ...p, is_completed: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-[#1B3A6B]" />
          <span className="text-sm text-gray-700">Ya realizada</span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>Guardar actividad</Button>
      </div>
    </form>
  )
}
