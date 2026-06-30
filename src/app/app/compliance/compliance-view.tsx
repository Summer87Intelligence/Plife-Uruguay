'use client'
import { useState } from 'react'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { runComplianceCheck } from '@/domains/ai/actions'
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import type { Profile, ComplianceRule, ComplianceReview, RiskLevel } from '@/types/database'

interface ComplianceViewProps {
  profile: Profile
  rules: ComplianceRule[]
  recentReviews: ComplianceReview[]
}

const actionIcons = {
  aprobado: CheckCircle,
  bloqueado: XCircle,
  revision_requerida: Clock,
  modificado: AlertTriangle,
}

const actionColors = {
  aprobado: 'text-green-600',
  bloqueado: 'text-red-600',
  revision_requerida: 'text-yellow-600',
  modificado: 'text-orange-600',
}

export function ComplianceView({ profile, rules, recentReviews }: ComplianceViewProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ response: string; riskLevel: RiskLevel; riskFlags: string[] } | null>(null)
  const [error, setError] = useState('')

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const res = await runComplianceCheck(message)
    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setResult({ response: res.data.response, riskLevel: res.data.riskLevel, riskFlags: res.data.riskFlags })
    }
    setLoading(false)
  }

  const criticalRules = rules.filter(r => r.risk_level === 'critico')
  const highRules = rules.filter(r => r.risk_level === 'alto')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Compliance Comercial</h1>
          <p className="text-sm text-gray-500">Revisión de mensajes y detección de claims riesgosos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revisor de mensajes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revisar mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheck} className="space-y-4">
                <Textarea
                  label="Mensaje a revisar"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Pegá aquí el mensaje que querés revisar antes de enviarlo al cliente..."
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" loading={loading} className="w-full">
                  <ShieldCheck className="h-4 w-4" />
                  Revisar mensaje
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resultado del análisis</CardTitle>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[result.riskLevel]}`}>
                    {RISK_LEVEL_LABELS[result.riskLevel]}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {result.riskFlags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {result.riskFlags.map(flag => (
                      <span key={flag} className="inline-flex rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">{flag.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-lg p-4">
                  {result.response}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reglas y historial */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Frases críticas ({criticalRules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {criticalRules.map(rule => (
                  <li key={rule.id} className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs font-semibold text-red-800">"{rule.pattern}"</p>
                    {rule.suggested_alternative && (
                      <p className="text-xs text-green-700 mt-1">✓ Mejor: "{rule.suggested_alternative}"</p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revisiones recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin revisiones aún</p>
              ) : (
                <ul className="space-y-2">
                  {recentReviews.slice(0, 8).map(review => {
                    const Icon = actionIcons[review.action]
                    return (
                      <li key={review.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <Icon className={`h-4 w-4 shrink-0 ${actionColors[review.action]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 truncate">{review.content_reviewed.slice(0, 60)}...</p>
                          <p className="text-[10px] text-gray-400">{formatRelativeDate(review.created_at)}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[review.risk_level]}`}>
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
    </div>
  )
}
