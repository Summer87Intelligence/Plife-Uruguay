'use client'

// FASE 14I — Creación real de lead vía server action.

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Info, RotateCcw } from 'lucide-react'
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
import { createLeadAction } from '@/domains/leads/actions'

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
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors: typeof errors = {}
    if (!form.title.trim()) nextErrors.title = 'El título es obligatorio.'
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'El email no tiene un formato válido.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const result = await createLeadAction({
        title: form.title,
        lead_type: form.lead_type,
        source: form.source,
        interest_area: form.interest_area || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        priority: form.priority,
        temperature: form.temperature,
        next_action: form.next_action || undefined,
        next_action_date: form.next_action_date || undefined,
        notes: form.notes || undefined,
      })

      if (!result.success) {
        setSubmitError(result.error)
        return
      }

      setCreatedLeadId(result.id)
    } catch {
      setSubmitError('No se pudo crear el lead. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setForm(INITIAL_STATE)
    setErrors({})
    setSubmitError(null)
    setCreatedLeadId(null)
  }

  if (createdLeadId) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div className="text-sm text-green-800">
            <p className="font-semibold">Lead registrado correctamente.</p>
            <p className="mt-1">
              ID: <span className="font-mono text-xs">{createdLeadId}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/app/leads/${createdLeadId}`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1B3A6B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2A5298]"
          >
            Ver detalle del lead
          </Link>
          <Link
            href="/app/leads"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200"
          >
            Volver a Leads
          </Link>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Crear otro lead
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          Al guardar, el lead queda disponible en Leads, Pipeline y PLIFE Hoy para priorizar y
          hacer seguimiento.
        </p>
      </div>

      {submitError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

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
        <Button type="submit" loading={loading} disabled={loading}>
          Crear lead
        </Button>
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
