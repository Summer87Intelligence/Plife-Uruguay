'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { CampaignType } from '@/types/database'

const typeOptions = [
  { value: 'duenos_pymes', label: 'Dueños de Pymes' },
  { value: 'empresas_familiares', label: 'Empresas familiares' },
  { value: 'estudios_contables', label: 'Estudios contables' },
  { value: 'estudios_juridicos', label: 'Estudios jurídicos' },
  { value: 'clinicas', label: 'Clínicas / Salud' },
  { value: 'empresas_tech', label: 'Empresas tech' },
  { value: 'constructoras', label: 'Constructoras' },
  { value: 'profesionales_independientes', label: 'Profesionales independientes' },
  { value: 'ejecutivos', label: 'Ejecutivos' },
  { value: 'reclutamiento_asesores', label: 'Reclutamiento asesores' },
  { value: 'general', label: 'General' },
]

interface CampaignFormProps { onSuccess?: () => void }

export function CampaignForm({ onSuccess }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: 'general',
    objective: '',
    target_segment: '',
    icp_description: '',
    start_date: '',
    end_date: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('campaigns').insert({
      ...form,
      type: form.type as CampaignType,
      status: 'borrador',
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nombre de la campaña *" value={form.name} onChange={e => set('name', e.target.value)} required />
      <Select label="Tipo de campaña" value={form.type} onValueChange={v => set('type', v)} options={typeOptions} />
      <Input label="Objetivo" value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="Generar reuniones con dueños de pymes..." />
      <Input label="Segmento objetivo" value={form.target_segment} onChange={e => set('target_segment', e.target.value)} />
      <Textarea label="Descripción del ICP (Cliente Ideal)" value={form.icp_description} onChange={e => set('icp_description', e.target.value)} rows={3} placeholder="Quién es el cliente ideal, características, señales de compra..." />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fecha inicio" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        <Input label="Fecha fin" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Crear campaña</Button>
      </div>
    </form>
  )
}
