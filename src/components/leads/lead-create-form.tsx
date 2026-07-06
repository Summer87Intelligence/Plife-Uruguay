'use client'

// FASE 14E — Formulario conceptual de creación de lead.
// NO persiste: sin Supabase, sin server actions. El submit arma un preview local.

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, FlaskConical, RotateCcw } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { LeadPriority, LeadSource, LeadTemperature, LeadType } from '@/domains/leads'
import {
  LEAD_TYPE_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_TEMPERATURE_LABELS,
} from '@/domains/leads'
import type { MockLead } from '@/domains/leads/mock-data'
import { LeadCard } from './lead-card'

interface FormState {
  title: string
  lead_type: LeadType
  source: LeadSource
  interest_area: string
  phone: string
  email: string
  priority: LeadPriority
  temperature: LeadTemperature
  next_action: string
  next_action_date: string
  notes: string
}

const INITIAL_STATE: FormState = {
  title: '',
  lead_type: 'unknown',
  source: 'manual',
  interest_area: '',
  phone: '',
  email: '',
  priority: 'medium',
  temperature: 'warm',
  next_action: '',
  next_action_date: '',
  notes: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

export function LeadCreateForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<{ title?: string; email?: string }>({})
  const [preview, setPreview] = useState<MockLead | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const nextErrors: typeof errors = {}
    if (!form.title.trim()) nextErrors.title = 'El título es obligatorio.'
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'El email no tiene un formato válido.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const now = new Date().toISOString()
    setPreview({
      id: 'demo-preview',
      title: form.title.trim(),
      display_name: null,
      lead_type: form.lead_type,
      source: form.source,
      status: 'open',
      pipeline_stage: 'nuevo',
      priority: form.priority,
      temperature: form.temperature,
      interest_area: form.interest_area.trim() || null,
      next_action: form.next_action.trim() || null,
      next_action_date: form.next_action_date || null,
      assigned_to: 'demo-advisor',
      created_at: now,
      updated_at: now,
      converted_at: null,
      discarded_at: null,
    })
  }

  function reset() {
    setForm(INITIAL_STATE)
    setErrors({})
    setPreview(null)
  }

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <p className="text-sm text-green-800">
            <span className="font-semibold">Lead demo preparado.</span> La persistencia real se
            implementará en una fase posterior.
          </p>
        </div>

        <div className="max-w-sm">
          <LeadCard lead={preview} />
        </div>

        {(form.phone || form.email || form.notes) && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
            {form.phone && <p><span className="font-medium text-gray-700">Teléfono:</span> {form.phone}</p>}
            {form.email && <p><span className="font-medium text-gray-700">Email:</span> {form.email}</p>}
            {form.notes && <p className="mt-1"><span className="font-medium text-gray-700">Notas:</span> {form.notes}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Crear otro lead demo
          </Button>
          <Link
            href="/app/leads"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200"
          >
            Volver a Leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Formulario conceptual.</span> Todavía no guarda datos
          reales.
        </p>
      </div>

      <Input
        label="Título *"
        placeholder='Ej.: "Consulta seguro de vida — Juan"'
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        error={errors.title}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Tipo de lead"
          value={form.lead_type}
          onValueChange={(v) => update('lead_type', v as LeadType)}
          options={toOptions(LEAD_TYPE_LABELS)}
        />
        <Select
          label="Origen"
          value={form.source}
          onValueChange={(v) => update('source', v as LeadSource)}
          options={toOptions(LEAD_SOURCE_LABELS)}
        />
      </div>

      <Input
        label="Interés"
        placeholder="Producto o necesidad de interés"
        value={form.interest_area}
        onChange={(e) => update('interest_area', e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Teléfono"
          placeholder="099 000 000"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="nombre@ejemplo.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Prioridad"
          value={form.priority}
          onValueChange={(v) => update('priority', v as LeadPriority)}
          options={toOptions(LEAD_PRIORITY_LABELS)}
        />
        <Select
          label="Temperatura"
          value={form.temperature}
          onValueChange={(v) => update('temperature', v as LeadTemperature)}
          options={toOptions(LEAD_TEMPERATURE_LABELS)}
        />
      </div>

      <Input
        label="Próximo paso"
        placeholder="Ej.: llamar para calificar interés"
        value={form.next_action}
        onChange={(e) => update('next_action', e.target.value)}
      />

      <Input
        label="Fecha de seguimiento"
        type="date"
        value={form.next_action_date}
        onChange={(e) => update('next_action_date', e.target.value)}
        hint={
          form.next_action.trim() && !form.next_action_date
            ? 'Más adelante PLIFE Hoy podrá usar la fecha para recordatorios.'
            : undefined
        }
      />

      <Textarea
        label="Notas"
        rows={3}
        placeholder="Contexto adicional del lead"
        value={form.notes}
        onChange={(e) => update('notes', e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Preparar lead demo</Button>
        <Link
          href="/app/leads"
          className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
