'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createCompany } from '@/domains/companies/actions'
import { B2B_STATUS_LABELS } from '@/lib/constants'

const statusOptions = Object.entries(B2B_STATUS_LABELS).map(([value, label]) => ({ value, label }))

const industryOptions = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'salud', label: 'Salud / Clínicas' },
  { value: 'estudio_contable', label: 'Estudio Contable' },
  { value: 'estudio_juridico', label: 'Estudio Jurídico' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'industria', label: 'Industria' },
  { value: 'agropecuaria', label: 'Agropecuaria' },
  { value: 'educacion', label: 'Educación' },
  { value: 'servicios', label: 'Servicios profesionales' },
  { value: 'otro', label: 'Otro' },
]

interface CompanyFormProps { onSuccess?: () => void }

export function CompanyForm({ onSuccess }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: '',
    linkedin_url: '',
    location: '',
    estimated_size: '',
    estimated_employees: '',
    source: '',
    b2b_status: 'detectada' as const,
    commercial_angle: '',
    opportunity_detected: '',
    notes: '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createCompany({
      ...form,
      estimated_employees: form.estimated_employees ? Number(form.estimated_employees) : undefined,
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
      <Input label="Nombre de la empresa *" value={form.name} onChange={e => set('name', e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Rubro" value={form.industry} onValueChange={v => set('industry', v)} options={industryOptions} placeholder="Seleccioná..." />
        <Input label="Ubicación" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Montevideo..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Sitio web" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
        <Input label="LinkedIn" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Empleados estimados" type="number" value={form.estimated_employees} onChange={e => set('estimated_employees', e.target.value)} />
        <Select label="Estado B2B" value={form.b2b_status} onValueChange={v => set('b2b_status', v)} options={statusOptions} />
      </div>
      <Input label="Fuente" value={form.source} onChange={e => set('source', e.target.value)} placeholder="LinkedIn, referido, búsqueda..." />
      <Input label="Oportunidad detectada" value={form.opportunity_detected} onChange={e => set('opportunity_detected', e.target.value)} placeholder="Posible seguro colectivo, vida..." />
      <Input label="Ángulo comercial sugerido" value={form.commercial_angle} onChange={e => set('commercial_angle', e.target.value)} />
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Crear empresa</Button>
      </div>
    </form>
  )
}
