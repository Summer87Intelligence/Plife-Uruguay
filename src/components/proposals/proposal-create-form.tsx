'use client'

import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  generateMockProposal,
  TARGET_TYPE_OPTIONS,
  SOURCE_OPTIONS,
  type ProposalDraft,
  type ProposalInput,
  type ProposalSource,
  type ProposalTargetType,
} from '@/domains/proposals'
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

export function ProposalCreateForm() {
  const [input, setInput] = useState<ProposalInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProposalDraft | null>(null)

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
    const result = generateMockProposal(input)
    setDraft(result)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReset = () => {
    setDraft(null)
    setError(null)
  }

  if (draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">Borrador generado en modo determinístico interno.</p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Editar / generar otro
          </Button>
        </div>
        <ProposalDraftView draft={draft} />
      </div>
    )
  }

  return (
    <Card className="border-gray-100">
      <CardContent className="p-5">
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
              No se guarda ni se envía a ningún proveedor externo.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
