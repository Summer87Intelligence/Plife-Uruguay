'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, RotateCcw, Link as LinkIcon, Save, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  generateMockProposal,
  TARGET_TYPE_OPTIONS,
  SOURCE_OPTIONS,
  SOURCE_LABELS,
  type CreateProposalInput,
  type ProposalDraft,
  type ProposalInput,
  type ProposalSource,
  type ProposalTargetType,
} from '@/domains/proposals'
import { createProposalAction } from '@/app/app/propuestas/actions'
import { ProposalDraftView } from './proposal-draft-view'

const EMPTY: ProposalInput = {
  title: '',
  context: '',
  target_type: 'unknown',
  target_description: '',
  source: 'manual',
  objective: '',
  known_problem: '',
  desired_outcome: '',
  notes: '',
}

interface ProposalCreateFormProps {
  initial?: Partial<ProposalInput>
}

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'error'; message: string }
  | { status: 'success'; id: string; leadSnapshot: boolean }

export function ProposalCreateForm({ initial }: ProposalCreateFormProps) {
  const [input, setInput] = useState<ProposalInput>({ ...EMPTY, ...initial })
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProposalDraft | null>(null)
  const [save, setSave] = useState<SaveState>({ status: 'idle' })

  const set = <K extends keyof ProposalInput>(key: K, value: ProposalInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!input.title.trim()) {
      setError('El título es requerido.')
      return
    }
    if (!input.context.trim()) {
      setError('El contexto es requerido.')
      return
    }

    // Generación 100% local determinística: sin Supabase, sin server action, sin red.
    // Guardar es un segundo paso explícito (no se persiste al generar).
    const result = generateMockProposal(input)
    setDraft(result)
    setSave({ status: 'idle' })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReset = () => {
    setDraft(null)
    setError(null)
    setSave({ status: 'idle' })
  }

  const handleSave = async () => {
    if (!draft) return
    setSave({ status: 'saving' })
    // El servidor deriva lead_id/campaign_id, snapshots y denormalizaciones.
    const payload: CreateProposalInput = { ...input, draft }
    const result = await createProposalAction(payload)
    if (result.success) {
      setSave({ status: 'success', id: result.id, leadSnapshot: result.leadSnapshot })
    } else {
      setSave({ status: 'error', message: result.error })
    }
  }

  if (draft) {
    const isSaved = save.status === 'success'
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {isSaved ? 'Propuesta guardada' : 'Borrador generado'}
            </p>
            <p className="text-xs text-gray-500">
              {isSaved
                ? 'Quedó persistida en tus propuestas.'
                : 'Modo determinístico interno. Todavía no está guardado.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isSaved && (
              <Button
                onClick={handleSave}
                disabled={save.status === 'saving'}
                size="sm"
              >
                {save.status === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {save.status === 'saving' ? 'Guardando…' : 'Guardar propuesta'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              {isSaved ? 'Crear otra' : 'Editar / generar otro'}
            </Button>
          </div>
        </div>

        {save.status === 'error' && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            No se pudo guardar: {save.message}
          </p>
        )}

        {isSaved && (
          <div className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                Propuesta guardada
                {save.leadSnapshot ? ' (con snapshot de score y calificación del lead)' : ''}.
              </p>
            </div>
            <div>
              <Button asChild variant="outline" size="sm">
                <Link href="/app/propuestas">
                  Ver mis propuestas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        <ProposalDraftView draft={draft} />
      </div>
    )
  }

  const hasOrigin = input.source !== 'manual' || Boolean(input.source_id)

  return (
    <Card className="border-gray-100">
      <CardContent className="p-5">
        {hasOrigin && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-800">
              Origen: <span className="font-medium">{SOURCE_LABELS[input.source]}</span>
              {input.source_title ? ` — “${input.source_title}”` : ''}. Podés ajustar los campos antes de generar.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título de la propuesta *"
            value={input.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ej: Protección colectiva para estudios contables"
          />

          <Textarea
            label="Contexto *"
            value={input.context}
            onChange={(e) => set('context', e.target.value)}
            rows={3}
            placeholder="¿De dónde surge la idea? ¿Qué observaste?"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de público"
              value={input.target_type}
              onValueChange={(v) => set('target_type', v as ProposalTargetType)}
              options={TARGET_TYPE_OPTIONS}
            />
            <Select
              label="Origen"
              value={input.source}
              onValueChange={(v) => set('source', v as ProposalSource)}
              options={SOURCE_OPTIONS}
            />
          </div>

          <Input
            label="Descripción del público objetivo"
            value={input.target_description}
            onChange={(e) => set('target_description', e.target.value)}
            placeholder="Ej: estudios contables pequeños sin beneficios formales"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Objetivo"
              value={input.objective}
              onChange={(e) => set('objective', e.target.value)}
              placeholder="¿Qué querés lograr con esta propuesta?"
            />
            <Input
              label="Resultado deseado"
              value={input.desired_outcome}
              onChange={(e) => set('desired_outcome', e.target.value)}
              placeholder="¿Cuál sería un buen resultado?"
            />
          </div>

          <Textarea
            label="Problema conocido"
            value={input.known_problem}
            onChange={(e) => set('known_problem', e.target.value)}
            rows={2}
            placeholder="¿Qué problema del cliente resolvería?"
          />

          <Textarea
            label="Notas"
            value={input.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Cualquier detalle adicional"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit">
              <Sparkles className="h-4 w-4" />
              Generar borrador
            </Button>
            <p className="text-xs text-gray-400">
              Primero se genera; guardar es un paso aparte. Sin proveedores externos.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
