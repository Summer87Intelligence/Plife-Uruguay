'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CreateSuccessPanel } from '@/components/ui/create-success-panel'
import { DuplicateWarningPanel } from '@/components/ui/duplicate-warning'
import { createContact, updateContact, type ContactFormData } from '@/domains/contacts/actions'
import type { ContactDuplicateMatch } from '@/domains/duplicates/types'
import { CONTACT_STATUS_LABELS } from '@/lib/constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const statusOptions = Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
const interestOptions = [
  { value: 'bajo', label: 'Bajo — poco interés por ahora' },
  { value: 'medio', label: 'Medio — abierto a conversar' },
  { value: 'alto', label: 'Alto — interés activo' },
  { value: 'muy_alto', label: 'Muy alto — listo para avanzar' },
]

interface ContactFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  contactId?: string
  initial?: Partial<ContactFormData>
  companies?: { id: string; name: string }[]
}

export function ContactForm({ onSuccess, onCancel, mode = 'create', contactId, initial, companies = [] }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [created, setCreated] = useState<{ id: string } | null>(null)
  const [duplicates, setDuplicates] = useState<ContactDuplicateMatch[] | null>(null)
  const [pendingPayload, setPendingPayload] = useState<ContactFormData | null>(null)
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
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.first_name.trim()) errs.first_name = 'Ingresá el nombre del contacto.'
    if (!form.last_name.trim()) errs.last_name = 'Ingresá el apellido del contacto.'
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
      errs.email = 'Ingresá un email válido o dejá el campo vacío.'
    }
    return errs
  }

  async function submitContact(payload: ContactFormData, confirmDuplicates = false) {
    setLoading(true)
    setError('')
    const result = mode === 'edit' && contactId
      ? await updateContact(contactId, payload)
      : await createContact(payload, confirmDuplicates ? { confirmDuplicates: true } : undefined)
    if ('duplicates' in result && result.duplicates.length > 0) {
      setDuplicates(result.duplicates)
      setPendingPayload(payload)
      setLoading(false)
    } else if ('error' in result && result.error) {
      setError(result.error)
      setLoading(false)
    } else if (mode === 'create' && 'data' in result && result.data) {
      router.refresh()
      setCreated({ id: result.data.id })
      setDuplicates(null)
      setPendingPayload(null)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    setErrors({})
    const payload = {
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
    } as ContactFormData
    await submitContact(payload)
  }

  async function handleConfirmDuplicate() {
    if (!pendingPayload) return
    await submitContact(pendingPayload, true)
  }

  if (duplicates && duplicates.length > 0) {
    return (
      <DuplicateWarningPanel
        title="Posible contacto duplicado"
        description="Encontramos un contacto parecido o con el mismo email/teléfono. Revisalo antes de crear otro."
        contactMatches={duplicates}
        onConfirm={handleConfirmDuplicate}
        onCancel={() => { setDuplicates(null); setPendingPayload(null) }}
        loading={loading}
      />
    )
  }

  if (created) {
    return (
      <CreateSuccessPanel
        message="Contacto creado. Siguiente paso recomendado: crear una oportunidad."
        primaryAction={{ label: 'Crear oportunidad', href: `/app/oportunidades?nuevo=1&contacto=${created.id}` }}
        secondaryAction={{ label: 'Ver contacto', href: `/app/contactos/${created.id}` }}
        onClose={onSuccess}
      />
    )
  }

  const companyOptions = [{ value: '', label: 'Sin empresa asociada' }, ...companies.map(c => ({ value: c.id, label: c.name }))]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">Los campos con * son obligatorios.</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre *" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ej: Juan" error={errors.first_name} />
        <Input label="Apellido *" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Ej: Pérez" error={errors.last_name} />
      </div>
      <Input label="Cargo" value={form.position} onChange={e => set('position', e.target.value)} placeholder="Ej: Gerente general, Socio fundador..." />
      {companies.length > 0 && (
        <Select label="Empresa asociada" value={form.company_id} onValueChange={v => set('company_id', v)} options={companyOptions} placeholder="Seleccioná una empresa..." />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@empresa.com" error={errors.email} />
        <Input label="Teléfono" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="099 123 456" />
      </div>
      <Select label="Nivel de interés" value={form.interest_level} onValueChange={v => set('interest_level', v)} options={interestOptions} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Próxima acción" value={form.next_action} onChange={e => set('next_action', e.target.value)} placeholder="Ej: Llamar para agendar reunión" />
        <Input label="Fecha de seguimiento" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
      </div>
      <details className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-gray-600 py-1">Más datos (estado, necesidad, notas)</summary>
        <div className="space-y-4 pt-3">
          <Select label="Estado del contacto" value={form.status} onValueChange={v => set('status', v)} options={statusOptions} />
          <Input label="Necesidad detectada" value={form.detected_need} onChange={e => set('detected_need', e.target.value)} placeholder="Qué problema o necesidad expresó..." />
          <Input label="Fuente" value={form.source} onChange={e => set('source', e.target.value)} placeholder="Referido, LinkedIn, evento..." />
          <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Contexto de la conversación..." />
        </div>
      </details>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="consent" checked={form.data_consent} onChange={e => set('data_consent', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#1B3A6B]" />
        <label htmlFor="consent" className="text-sm text-gray-700">Tengo consentimiento para usar estos datos</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear contacto'}</Button>
      </div>
    </form>
  )
}
