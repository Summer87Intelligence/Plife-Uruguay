import { Bot, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MockLead } from '@/domains/leads/mock-data'
import { LEAD_PIPELINE_STAGE_LABELS } from '@/domains/leads'
import { getLeadFollowUpBucket } from '@/domains/leads'

function buildSuggestions(lead: MockLead): string[] {
  const suggestions: string[] = []
  const stage = lead.pipeline_stage
  const bucket = getLeadFollowUpBucket(lead)

  if (stage === 'nuevo' || stage === 'contactado') {
    suggestions.push('Preparar un mensaje corto de seguimiento.')
  }

  if (stage === 'calificando' || lead.temperature === 'cold') {
    suggestions.push('Confirmar necesidad antes de proponer producto.')
  }

  if (bucket === 'missing_next_step' || !lead.next_action_date) {
    suggestions.push('Registrar próximo paso con fecha.')
  }

  if (lead.temperature === 'hot') {
    suggestions.push('Priorizar contacto: el lead muestra interés activo.')
  }

  if (lead.interest_area) {
    suggestions.push(`Explorar el interés en "${lead.interest_area}" sin prometer coberturas.`)
  }

  if (stage === 'interesado' || stage === 'propuesta_reunion') {
    suggestions.push('Coordinar reunión o envío de material institucional validado.')
  }

  if (stage === 'seguimiento') {
    suggestions.push('Retomar conversación con referencia al último contacto.')
  }

  if (suggestions.length === 0) {
    suggestions.push('Revisar el estado del lead y definir la siguiente acción comercial.')
  }

  return [...new Set(suggestions)].slice(0, 4)
}

export function LeadAIAssistantMock({ lead }: { lead: MockLead }) {
  const suggestions = buildSuggestions(lead)

  return (
    <Card className="border-[#1B3A6B]/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4 text-[#1B3A6B]" />
          Asistente comercial
          <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            Mock
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-500">
          Sugerencias según etapa ({LEAD_PIPELINE_STAGE_LABELS[lead.pipeline_stage]}), temperatura e
          interés. Sin llamadas a APIs externas.
        </p>
        <ul className="space-y-2">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="flex items-start gap-2 rounded-lg bg-[#1B3A6B]/5 px-3 py-2 text-sm text-gray-700"
            >
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3A6B]" />
              {suggestion}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
