'use client'
import { useState } from 'react'
import { Bot, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AIResultPanel } from '@/components/commercial/ai-result'
import { runCopilot, saveAIAsActivity } from '@/domains/ai/actions'
import { HELP_TYPES, type AIResult, type HelpType } from '@/domains/ai/types'
import type { Profile } from '@/types/database'

interface Option { id: string; label: string }

interface CopilotoViewProps {
  profile: Profile
  aiConfigured: boolean
  contacts: Option[]
  companies: Option[]
  opportunities: Option[]
  campaigns: Option[]
}

const helpOptions = (Object.keys(HELP_TYPES) as HelpType[]).map(k => ({ value: k, label: HELP_TYPES[k] }))

const PROMPT_EXAMPLES = [
  'Preparame una reunión con este dueño de empresa.',
  'Generá un mensaje consultivo para pedir una reunión.',
  'Respondé esta objeción: ya tengo seguro.',
  'Sugerí el próximo paso para esta oportunidad.',
]

export function CopilotoView({ aiConfigured, contacts, companies, opportunities, campaigns }: CopilotoViewProps) {
  const [helpType, setHelpType] = useState<HelpType>('preparar_contacto')
  const [freeText, setFreeText] = useState('')
  const [contactId, setContactId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [campaignId, setCampaignId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AIResult | null>(null)

  const blank = { value: '', label: '— Ninguno —' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    const res = await runCopilot({
      helpType,
      freeText,
      contactId: contactId || undefined,
      companyId: companyId || undefined,
      opportunityId: opportunityId || undefined,
      campaignId: campaignId || undefined,
    })
    if (res.error) setError(res.error)
    else if (res.data) setResult(res.data)
    setLoading(false)
  }

  async function handleSave(content: string) {
    if (!contactId && !companyId && !opportunityId) return
    await saveAIAsActivity({
      title: `Copiloto: ${HELP_TYPES[helpType]}`,
      content,
      contactId: contactId || undefined,
      companyId: companyId || undefined,
      opportunityId: opportunityId || undefined,
    })
  }

  const canSave = Boolean(contactId || companyId || opportunityId)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Copiloto del Asesor</h1>
          <p className="text-sm text-gray-500">Prepará mensajes, objeciones y próximos pasos con asistencia comercial.</p>
          <p className="text-xs text-gray-400 mt-0.5">Seleccioná un contacto u oportunidad y describí qué necesitás.</p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {!aiConfigured ? (
            <>
              <strong>IA avanzada no configurada.</strong> El copiloto estará disponible cuando el administrador active la integración. Mientras tanto, podés usar la base de conocimiento.
            </>
          ) : (
            <>
              El copiloto <strong>nunca cotiza primas ni promete coberturas.</strong> Revisá cada sugerencia antes de usarla con un cliente.
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="¿Con qué te ayudo?" value={helpType} onValueChange={v => setHelpType(v as HelpType)} options={helpOptions} />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Contacto" value={contactId} onValueChange={setContactId} options={[blank, ...contacts.map(c => ({ value: c.id, label: c.label }))]} />
            <Select label="Empresa" value={companyId} onValueChange={setCompanyId} options={[blank, ...companies.map(c => ({ value: c.id, label: c.label }))]} />
            <Select label="Oportunidad" value={opportunityId} onValueChange={setOpportunityId} options={[blank, ...opportunities.map(o => ({ value: o.id, label: o.label }))]} />
            <Select label="Campaña" value={campaignId} onValueChange={setCampaignId} options={[blank, ...campaigns.map(c => ({ value: c.id, label: c.label }))]} />
          </div>

          <Textarea
            label="Indicaciones (qué sabés, qué necesitás)"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            rows={4}
            placeholder="Ej: el cliente mostró interés pero dudó por el precio. Quiero un seguimiento que retome la conversación..."
          />

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Ejemplos para empezar</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_EXAMPLES.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setFreeText(ex)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} disabled={!aiConfigured} className="w-full" title={!aiConfigured ? 'Requiere configuración de IA por el administrador' : undefined}>
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generando...' : aiConfigured ? 'Generar sugerencia' : 'IA no configurada'}
          </Button>
        </form>

        <div>
          {!result && !loading && !error ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-100">
              <Bot className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">La sugerencia aparecerá aquí</p>
            </div>
          ) : (
            <AIResultPanel
              result={result}
              loading={loading}
              error={error}
              onSaveActivity={canSave ? handleSave : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
