'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CreateSuccessPanel } from '@/components/ui/create-success-panel'
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
  onCancel?: () => void
  mode?: 'create' | 'edit'
  companyId?: string
  initial?: Partial<CompanyFormData>
  campaigns?: { id: string; name: string }[]
}

export function CompanyForm({ onSuccess, onCancel, mode = 'create', companyId, initial, campaigns = [] }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ id: string } | null>(null)
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
        message="Empresa creada. Siguiente paso recomendado: agregar un contacto."
        primaryAction={{ label: 'Agregar contacto', href: `/app/contactos?nuevo=1&empresa=${created.id}` }}
        secondaryAction={{ label: 'Ver empresa', href: `/app/empresas/${created.id}` }}
        onClose={onSuccess}
      />
    )
  }

  const campaignOptions = [{ value: '', label: 'Sin campaña' }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-gray-500">Los campos con * son obligatorios.</p>
      <Input label="Nombre de la empresa *" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Estudio Contable García" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Rubro" value={form.industry} onValueChange={v => set('industry', v)} options={industryOptions} placeholder="Seleccioná el rubro..." />
        <Input label="Ciudad" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ej: Montevideo, Canelones..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Tamaño aproximado" value={form.estimated_size} onChange={e => set('estimated_size', e.target.value)} placeholder="Pequeña, mediana o grande" />
        <Input label="Cantidad de empleados (aprox.)" type="number" min={1} value={form.estimated_employees} onChange={e => set('estimated_employees', e.target.value)} placeholder="Ej: 25" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Potencial comercial (0–100)" type="number" min={0} max={100} value={form.b2b_score} onChange={e => set('b2b_score', e.target.value)} placeholder="Opcional — se puede calcular después" />
        <Select label="Estado comercial" value={form.b2b_status} onValueChange={v => set('b2b_status', v)} options={statusOptions} />
      </div>
      <Input label="Próximo paso sugerido" value={form.commercial_angle} onChange={e => set('commercial_angle', e.target.value)} placeholder="Ej: Pedir reunión con el dueño para presentar seguro colectivo" />
      <Input label="Oportunidad detectada" value={form.opportunity_detected} onChange={e => set('opportunity_detected', e.target.value)} placeholder="Ej: Seguro colectivo, protección de socios..." />
      <Input label="Contacto ideal" value={form.ideal_contact} onChange={e => set('ideal_contact', e.target.value)} placeholder="Dueño, gerente de RRHH, CFO..." />
      {campaigns.length > 0 && (
        <Select label="Campaña asociada" value={form.campaign_id} onValueChange={v => set('campaign_id', v)} options={campaignOptions} placeholder="Sin campaña" />
      )}
      <details className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-gray-600 py-1">Más datos (web, fuente, notas)</summary>
        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sitio web" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            <Input label="LinkedIn" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." />
          </div>
          <Input label="Instagram" value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
          <Input label="Fuente del dato" value={form.source} onChange={e => set('source', e.target.value)} placeholder="Referido, LinkedIn, evento..." />
          <Textarea label="Riesgos u observaciones" value={form.risk_notes} onChange={e => set('risk_notes', e.target.value)} rows={2} placeholder="Aspectos comerciales o de compliance a tener en cuenta..." />
          <Textarea label="Notas internas" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Contexto adicional para el equipo..." />
        </div>
      </details>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear empresa'}</Button>
      </div>
    </form>
  )
}
