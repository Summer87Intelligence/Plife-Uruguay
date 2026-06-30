'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createCompany, updateCompany, type CompanyFormData } from '@/domains/companies/actions'
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

interface CompanyFormProps {
  onSuccess?: () => void
  mode?: 'create' | 'edit'
  companyId?: string
  initial?: Partial<CompanyFormData>
  campaigns?: { id: string; name: string }[]
}

export function CompanyForm({ onSuccess, mode = 'create', companyId, initial, campaigns = [] }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    industry: initial?.industry ?? '',
    website: initial?.website ?? '',
    linkedin_url: initial?.linkedin_url ?? '',
    instagram_url: initial?.instagram_url ?? '',
    location: initial?.location ?? '',
    estimated_size: initial?.estimated_size ?? '',
    estimated_employees: initial?.estimated_employees != null ? String(initial.estimated_employees) : '',
    source: initial?.source ?? '',
    b2b_score: initial?.b2b_score != null ? String(initial.b2b_score) : '',
    b2b_status: initial?.b2b_status ?? 'detectada',
    commercial_angle: initial?.commercial_angle ?? '',
    ideal_contact: initial?.ideal_contact ?? '',
    risk_notes: initial?.risk_notes ?? '',
    opportunity_detected: initial?.opportunity_detected ?? '',
    notes: initial?.notes ?? '',
    campaign_id: initial?.campaign_id ?? '',
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
      estimated_employees: form.estimated_employees ? Number(form.estimated_employees) : undefined,
      b2b_score: form.b2b_score !== '' ? Number(form.b2b_score) : undefined,
    } as CompanyFormData
    const result = mode === 'edit' && companyId
      ? await updateCompany(companyId, payload)
      : await createCompany(payload)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  const campaignOptions = [{ value: '', label: 'Sin campaña' }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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
        <Input label="Instagram" value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
        <Input label="Tamaño estimado" value={form.estimated_size} onChange={e => set('estimated_size', e.target.value)} placeholder="Pequeña, mediana, grande..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Empleados estimados" type="number" value={form.estimated_employees} onChange={e => set('estimated_employees', e.target.value)} />
        <Input label="Score B2B (0-100)" type="number" min={0} max={100} value={form.b2b_score} onChange={e => set('b2b_score', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Estado B2B" value={form.b2b_status} onValueChange={v => set('b2b_status', v)} options={statusOptions} />
        {campaigns.length > 0 && (
          <Select label="Campaña" value={form.campaign_id} onValueChange={v => set('campaign_id', v)} options={campaignOptions} placeholder="Sin campaña" />
        )}
      </div>
      <Input label="Oportunidad detectada" value={form.opportunity_detected} onChange={e => set('opportunity_detected', e.target.value)} placeholder="Posible seguro colectivo, vida..." />
      <Input label="Ángulo comercial sugerido" value={form.commercial_angle} onChange={e => set('commercial_angle', e.target.value)} placeholder="Por qué les conviene, cómo entrar..." />
      <Input label="Contacto ideal" value={form.ideal_contact} onChange={e => set('ideal_contact', e.target.value)} placeholder="Dueño, gerente de RRHH, CFO..." />
      <Input label="Fuente" value={form.source} onChange={e => set('source', e.target.value)} placeholder="LinkedIn, referido, búsqueda..." />
      <Textarea label="Riesgo / observaciones" value={form.risk_notes} onChange={e => set('risk_notes', e.target.value)} rows={2} placeholder="Riesgos comerciales o de compliance a tener en cuenta..." />
      <Textarea label="Notas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear empresa'}</Button>
      </div>
    </form>
  )
}
