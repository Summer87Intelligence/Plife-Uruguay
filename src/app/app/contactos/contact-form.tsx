'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createContact } from '@/domains/contacts/actions'
import { CONTACT_STATUS_LABELS } from '@/lib/constants'
import type { ContactStatus } from '@/types/database'

const statusOptions = Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
const interestOptions = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'muy_alto', label: 'Muy alto' },
]

interface ContactFormProps {
  onSuccess?: () => void
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    source: '',
    status: 'nuevo' as ContactStatus,
    interest_level: 'medio' as const,
    detected_need: '',
    next_action: '',
    notes: '',
    data_consent: false,
    data_origin: 'manual',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createContact(form)
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
      <div className="grid grid-cols-2 gap-4">
        <Select label="Estado" value={form.status} onValueChange={v => set('status', v)} options={statusOptions} />
        <Select label="Nivel de interés" value={form.interest_level} onValueChange={v => set('interest_level', v)} options={interestOptions} />
      </div>
      <Input label="Necesidad detectada" value={form.detected_need} onChange={e => set('detected_need', e.target.value)} placeholder="Qué problema o necesidad tiene..." />
      <Input label="Próxima acción" value={form.next_action} onChange={e => set('next_action', e.target.value)} />
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="consent" checked={form.data_consent} onChange={e => set('data_consent', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1B3A6B]" />
        <label htmlFor="consent" className="text-sm text-gray-700">Tengo consentimiento para usar este dato</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>Crear contacto</Button>
      </div>
    </form>
  )
}
