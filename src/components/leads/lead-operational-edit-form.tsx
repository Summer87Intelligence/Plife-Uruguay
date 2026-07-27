'use client'

// FASE 14J — Edición de campos operativos del lead contra Supabase dev.
// Solo etapas activas: convertido/descartado se manejarán por sus flujos propios.
// No toca status, soft-delete ni conversión.

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Info, Lock, PencilLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import type { LeadPriority, LeadTemperature } from '@/domains/leads'
import {
  ACTIVE_LEAD_STAGES,
  LEAD_PIPELINE_STAGE_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_TEMPERATURE_LABELS,
  isTerminalLeadStage,
} from '@/domains/leads'
import { updateLeadOperationalAction } from '@/domains/leads/actions'
import type { UpdatableLeadStage } from '@/domains/leads/validation'

interface FormState {
  pipeline_stage: UpdatableLeadStage
  priority: LeadPriority
  temperature: LeadTemperature
  next_action: string
  next_action_date: string
  notes: string
}

const STAGE_OPTIONS = ACTIVE_LEAD_STAGES.map((stage) => ({
  value: stage,
  label: LEAD_PIPELINE_STAGE_LABELS[stage],
}))

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

export function LeadOperationalEditForm({ lead }: { lead: MockLead }) {
  const isTerminal = lead.status !== 'open' || isTerminalLeadStage(lead.pipeline_stage)

  const [form, setForm] = useState<FormState>({
    // El form no se renderiza para leads terminales; el fallback solo satisface el tipo.
    pipeline_stage: isTerminal ? 'nuevo' : (lead.pipeline_stage as UpdatableLeadStage),
    priority: lead.priority,
    temperature: lead.temperature,
    next_action: lead.next_action ?? '',
    next_action_date: lead.next_action_date?.slice(0, 10) ?? '',
    notes: lead.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      const result = await updateLeadOperationalAction({
        lead_id: lead.id,
        pipeline_stage: form.pipeline_stage,
        priority: form.priority,
        temperature: form.temperature,
        next_action: form.next_action || undefined,
        next_action_date: form.next_action_date || undefined,
        notes: form.notes || undefined,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess(true)
    } catch {
      setError('No se pudo actualizar el lead. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <PencilLine className="h-4 w-4 text-[#1B3A6B]" />
          Editar campos operativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTerminal ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
            <p className="text-sm text-gray-600">
              Este lead está en un estado terminal (convertido o descartado) y no admite edición
              operativa desde acá.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-sm text-blue-800">
                Esta acción actualiza campos operativos del lead en Supabase dev. Convertir o
                descartar el lead sigue deshabilitado.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <p className="text-sm text-green-800">Lead actualizado en Supabase dev.</p>
              </div>
            )}

            <Select
              label="Etapa del pipeline"
              value={form.pipeline_stage}
              onValueChange={(v) => update('pipeline_stage', v as UpdatableLeadStage)}
              options={STAGE_OPTIONS}
            />
            <p className="-mt-2 text-xs text-gray-500">
              Convertido y Descartado no están disponibles desde el update básico.
            </p>

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
              label="Fecha de próximo paso"
              type="date"
              value={form.next_action_date}
              onChange={(e) => update('next_action_date', e.target.value)}
            />

            <Textarea
              label="Notas"
              rows={3}
              placeholder="Contexto adicional del lead"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />

            <Button type="submit" loading={loading} disabled={loading}>
              Guardar cambios
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
