'use client'
import { useState } from 'react'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Bot, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { checkCompliance } from '@/domains/ai/actions'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'
import {
  RISK_LEVEL_LABELS, RISK_LEVEL_COLORS,
  COMPLIANCE_ACTION_LABELS, COMPLIANCE_ACTION_COLORS,
} from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import type { Profile, ComplianceRule, ComplianceReview, ComplianceAction } from '@/types/database'
import type { ComplianceResult } from '@/lib/ai/compliance'

interface AIInteractionRow {
  id: string
  agent_name: string
  response: string
  risk_level: string | null
  risk_flags: string[] | null
  documents_used: string[] | null
  created_at: string
  contact_id: string | null
  company_id: string | null
  opportunity_id: string | null
  campaign_id: string | null
  user?: { full_name: string } | null
}

interface ComplianceViewProps {
  profile: Profile
  rules: ComplianceRule[]
  recentReviews: ComplianceReview[]
  interactions: AIInteractionRow[]
}

const actionIcons: Record<ComplianceAction, typeof CheckCircle> = {
  aprobado: CheckCircle,
  bloqueado: XCircle,
  revision_requerida: Clock,
  modificado: AlertTriangle,
}

const AGENT_LABELS: Record<string, string> = {
  advisor_copilot: 'Copiloto asesor',
  b2b_research: 'Análisis B2B',
  compliance_agent: 'Compliance',
  campaign_agent: 'Campañas',
}

function entityLabel(i: AIInteractionRow) {
  if (i.contact_id) return 'Contacto'
  if (i.company_id) return 'Empresa'
  if (i.opportunity_id) return 'Oportunidad'
  if (i.campaign_id) return 'Campaña'
  return 'General'
}

type Tab = 'revisor' | 'trazabilidad'

export function ComplianceView({ rules, recentReviews, interactions }: ComplianceViewProps) {
  const [tab, setTab] = useState<Tab>('revisor')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState('')

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    const res = await checkCompliance(message)
    if (res.error) setError(res.error)
    else if (res.data) setResult(res.data)
    setLoading(false)
  }

  const criticalRules = rules.filter(r => r.risk_level === 'critico')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Compliance Comercial</h1>
          <p className="text-sm text-gray-500">Revisá mensajes antes de enviarlos para evitar promesas comerciales riesgosas.</p>
          <p className="text-xs text-gray-400 mt-0.5">Pegá un mensaje comercial antes de enviarlo para revisar si contiene promesas riesgosas.</p>
        </div>
      </div>

      <SectionGuideCard
        title="Cómo usar el revisor de mensajes"
        description="Sirve para revisar mensajes y detectar riesgos antes de usarlos comercialmente. No reemplaza revisión legal ni condiciones oficiales de MAPFRE."
        steps={[
          'Pegá el mensaje que querés revisar',
          'Detectá frases riesgosas en el resultado',
          'Ajustá el texto con la versión sugerida',
          'Usalo solo después de revisión humana',
        ]}
        nextStep="Siempre revisión humana primero"
        compact
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        <button onClick={() => setTab('revisor')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'revisor' ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Revisor de mensajes
        </button>
        <button onClick={() => setTab('trazabilidad')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'trazabilidad' ? 'border-[#1B3A6B] text-[#1B3A6B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Historial IA ({interactions.length})
        </button>
      </div>

      {tab === 'revisor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Revisar mensaje</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCheck} className="space-y-4">
                  <Textarea
                    label="Mensaje a revisar"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Pegá el mensaje que querés revisar antes de enviarlo al cliente..."
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" loading={loading} className="w-full">
                    <ShieldCheck className="h-4 w-4" /> Revisar mensaje
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => setMessage('Te aprueban seguro y no tiene riesgo, te cubre todo y es mejor que cualquier inversión.')}
                  className="mt-3 text-xs text-[#1B3A6B] hover:underline"
                >
                  Probar con un mensaje riesgoso de ejemplo
                </button>
                <p className="text-xs text-gray-400 mt-2">La revisión funciona aunque la IA no esté configurada.</p>
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Resultado</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLIANCE_ACTION_COLORS[result.action]}`}>
                        {COMPLIANCE_ACTION_LABELS[result.action]}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[result.riskLevel]}`}>
                        {RISK_LEVEL_LABELS[result.riskLevel]}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.riskReasons.length > 0 && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2">
                      <p className="text-xs font-medium text-orange-800 mb-1">Problemas detectados:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.riskReasons.map((r, i) => <li key={i} className="text-xs text-orange-700">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.suggestedVersion ? (
                    <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                      <p className="text-xs font-semibold text-green-800 mb-1">Versión sugerida:</p>
                      <p className="text-sm text-green-900 whitespace-pre-wrap">{result.suggestedVersion}</p>
                    </div>
                  ) : result.action === 'aprobado' ? (
                    <p className="text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Sin claims riesgosos detectados.</p>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" /> Frases críticas ({criticalRules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {criticalRules.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin reglas críticas activas. El sistema aplica criterios de revisión estándar.</p>
                ) : (
                  <ul className="space-y-2">
                    {criticalRules.map(rule => (
                      <li key={rule.id} className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                        <p className="text-xs font-semibold text-red-800">&ldquo;{rule.pattern}&rdquo;</p>
                        {rule.suggested_alternative && (
                          <p className="text-xs text-green-700 mt-1">✓ Mejor: &ldquo;{rule.suggested_alternative}&rdquo;</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Revisiones recientes</CardTitle></CardHeader>
              <CardContent>
                {recentReviews.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin revisiones aún</p>
                ) : (
                  <ul className="space-y-2">
                    {recentReviews.slice(0, 8).map(review => {
                      const Icon = actionIcons[review.action]
                      return (
                        <li key={review.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                          <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 truncate">{review.content_reviewed.slice(0, 60)}...</p>
                            <p className="text-[10px] text-gray-400">{formatRelativeDate(review.created_at)}</p>
                          </div>
                          <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[review.risk_level]}`}>
                            {RISK_LEVEL_LABELS[review.risk_level]}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#1B3A6B]" /> Interacciones IA recientes</CardTitle></CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-gray-400">Todavía no hay interacciones IA registradas.</p>
                <button type="button" onClick={() => setTab('revisor')} className="text-xs text-[#1B3A6B] hover:underline">
                  Ir al revisor de mensajes
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="py-2 pr-3 font-medium">Agente</th>
                      <th className="py-2 pr-3 font-medium">Usuario</th>
                      <th className="py-2 pr-3 font-medium">Fecha</th>
                      <th className="py-2 pr-3 font-medium">Entidad</th>
                      <th className="py-2 pr-3 font-medium">Riesgo</th>
                      <th className="py-2 pr-3 font-medium">Documentos</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {interactions.map(i => (
                      <tr key={i.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 pr-3 text-gray-700">{AGENT_LABELS[i.agent_name] ?? i.agent_name}</td>
                        <td className="py-2.5 pr-3 text-gray-600">{i.user?.full_name ?? '—'}</td>
                        <td className="py-2.5 pr-3 text-gray-400 text-xs whitespace-nowrap">{formatRelativeDate(i.created_at)}</td>
                        <td className="py-2.5 pr-3 text-gray-600 text-xs">{entityLabel(i)}</td>
                        <td className="py-2.5 pr-3">
                          {i.risk_level && (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[i.risk_level as keyof typeof RISK_LEVEL_COLORS]}`}>
                              {RISK_LEVEL_LABELS[i.risk_level as keyof typeof RISK_LEVEL_LABELS]}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-gray-500 text-xs">{i.documents_used?.length ? `${i.documents_used.length}` : '—'}</td>
                        <td className="py-2.5">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Ver detalle</Button>
                            </DialogTrigger>
                            <DialogContent title={`${AGENT_LABELS[i.agent_name] ?? i.agent_name}`} description={formatRelativeDate(i.created_at)} className="max-w-2xl">
                              <div className="max-h-[60vh] overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-lg p-4">{i.response}</pre>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
