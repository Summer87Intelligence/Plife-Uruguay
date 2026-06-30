'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createContact, updateContact, type ContactFormData } from '@/domains/contacts/actions'
import { CONTACT_STATUS_LABELS } from '@/lib/constants'

const statusOptions = Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
const interestOptions = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'muy_alto', label: 'Muy alto' },
]

interface ContactFormProps {
  onSuccess?: () => void
  mode?: 'create' | 'edit'
  contactId?: string
  initial?: Partial<ContactFormData>
  companies?: { id: string; name: string }[]
}

export function ContactForm({ onSuccess, mode = 'create', contactId, initial, companies = [] }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: initial?.first_name ?? '',
    last_name: initial?.last_name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    position: initial?.position ?? '',
    source: initial?.source ?? '',
    status: initial?.status ?? 'nuevo',
    interest_level: initial?.interest_level ?? 'medio',
    detected_need: initial?.detected_need ?? '',
    next_action: initial?.next_action ?? '',
    next_action_date: initial?.next_action_date ?? '',
    notes: initial?.notes ?? '',
    data_consent: initial?.data_consent ?? false,
    data_origin: initial?.data_origin ?? 'manual',
    company_id: initial?.company_id ?? '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = mode === 'edit' && contactId
      ? await updateContact(contactId, form as Partial<ContactFormData>)
      : await createContact(form as ContactFormData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  const companyOptions = [{ value: '', label: 'Sin empresa' }, ...companies.map(c => ({ value: c.id, label: c.name }))]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre *" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
        <Input label="Apellido *" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        <Input label="Teléfono" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Cargo" value={form.position} onChange={e => set('position', e.target.value)} />
        <Input label="Fuente" value={form.source} onChange={e => set('source', e.target.value)} placeholder="Referido, LinkedIn..." />
      </div>
      {companies.length > 0 && (
        <Select label="Empresa vinculada" value={form.company_id} onValueChange={v => set('company_id', v)} options={companyOptions} placeholder="Sin empresa" />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Select label="Estado" value={form.status} onValueChange={v => set('status', v)} options={statusOptions} />
        <Select label="Nivel de interés" value={form.interest_level} onValueChange={v => set('interest_level', v)} options={interestOptions} />
      </div>
      <Input label="Necesidad detectada" value={form.detected_need} onChange={e => set('detected_need', e.target.value)} placeholder="Qué problema o necesidad tiene..." />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Próxima acción" value={form.next_action} onChange={e => set('next_action', e.target.value)} />
        <Input label="Fecha próxima acción" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
      </div>
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="consent" checked={form.data_consent} onChange={e => set('data_consent', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1B3A6B]" />
        <label htmlFor="consent" className="text-sm text-gray-700">Tengo consentimiento para usar este dato</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear contacto'}</Button>
      </div>
    </form>
  )
}
