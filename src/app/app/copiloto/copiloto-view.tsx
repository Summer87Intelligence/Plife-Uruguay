'use client'
import { useState } from 'react'
import { Bot, Send, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { runAdvisorCopilot, runB2BAnalysis } from '@/domains/ai/actions'
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@/lib/constants'
import type { Profile, RiskLevel } from '@/types/database'

type Mode = 'advisor' | 'b2b'

const modeOptions = [
  { value: 'advisor', label: 'Preparar contacto / reunión' },
  { value: 'b2b', label: 'Analizar empresa B2B' },
]

interface CopilotoViewProps {
  profile: Profile
}

export function CopilotoView({ profile }: CopilotoViewProps) {
  const [mode, setMode] = useState<Mode>('advisor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ response: string; riskLevel: RiskLevel; riskFlags: string[]; interactionId?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Advisor form
  const [advisorForm, setAdvisorForm] = useState({
    contact_name: '',
    position: '',
    company: '',
    need: '',
    history: '',
    stage: 'nueva',
  })

  // B2B form
  const [b2bForm, setB2bForm] = useState({
    company_name: '',
    industry: '',
    employees: '',
    data: '',
    campaign_objective: '',
  })

  function setA(field: string, value: string) {
    setAdvisorForm(prev => ({ ...prev, [field]: value }))
  }
  function setB(field: string, value: string) {
    setB2bForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    let res
    if (mode === 'advisor') {
      res = await runAdvisorCopilot(advisorForm)
    } else {
      res = await runB2BAnalysis(b2bForm)
    }

    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setResult({
        response: res.data.response,
        riskLevel: res.data.riskLevel,
        riskFlags: res.data.riskFlags,
        interactionId: res.data.interactionId,
      })
    }
    setLoading(false)
  }

  async function copyResponse() {
    if (result?.response) {
      await navigator.clipboard.writeText(result.response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const stageOptions = [
    { value: 'nueva', label: 'Primer contacto' },
    { value: 'contactada', label: 'Ya contactado' },
    { value: 'reunion_agendada', label: 'Reunión agendada' },
    { value: 'diagnostico_realizado', label: 'Diagnóstico hecho' },
    { value: 'propuesta_conceptual', label: 'En propuesta' },
    { value: 'seguimiento', label: 'En seguimiento' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Copiloto del Asesor</h1>
          <p className="text-sm text-gray-500">IA asistente — toda respuesta es sugerida y editable. No reemplaza tu juicio.</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          El Copiloto genera sugerencias basadas en tu input. <strong>Nunca cotiza primas ni promete coberturas.</strong> Siempre revisá antes de usar con un cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-4">
          <Select
            label="¿Qué necesitás?"
            value={mode}
            onValueChange={v => { setMode(v as Mode); setResult(null) }}
            options={modeOptions}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'advisor' ? (
              <>
                <Input label="Nombre del contacto" value={advisorForm.contact_name} onChange={e => setA('contact_name', e.target.value)} placeholder="Juan Pérez" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Cargo" value={advisorForm.position} onChange={e => setA('position', e.target.value)} placeholder="Gerente, dueño..." />
                  <Input label="Empresa" value={advisorForm.company} onChange={e => setA('company', e.target.value)} />
                </div>
                <Textarea
                  label="Necesidad detectada o contexto"
                  value={advisorForm.need}
                  onChange={e => setA('need', e.target.value)}
                  rows={3}
                  placeholder="Qué sabés de esta persona, qué necesita, qué mencionó..."
                />
                <Textarea
                  label="Historial de interacciones previas"
                  value={advisorForm.history}
                  onChange={e => setA('history', e.target.value)}
                  rows={2}
                  placeholder="Última llamada, qué dijo, objeciones que tuvo..."
                />
                <Select label="Etapa actual" value={advisorForm.stage} onValueChange={v => setA('stage', v)} options={stageOptions} />
              </>
            ) : (
              <>
                <Input label="Nombre de la empresa *" value={b2bForm.company_name} onChange={e => setB('company_name', e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Rubro" value={b2bForm.industry} onChange={e => setB('industry', e.target.value)} />
                  <Input label="Empleados estimados" value={b2bForm.employees} onChange={e => setB('employees', e.target.value)} />
                </div>
                <Textarea
                  label="Datos disponibles de la empresa"
                  value={b2bForm.data}
                  onChange={e => setB('data', e.target.value)}
                  rows={3}
                  placeholder="Lo que sabés: actividad, dónde están, si tienen empleados, qué hacen..."
                />
                <Input label="Objetivo de campaña" value={b2bForm.campaign_objective} onChange={e => setB('campaign_objective', e.target.value)} placeholder="Seguros colectivos, vida para socios..." />
              </>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('OPENAI') && (
                  <p className="text-xs text-red-500 mt-1">Configurá la variable OPENAI_API_KEY en .env.local</p>
                )}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <Send className="h-4 w-4" />
              {loading ? 'Analizando...' : 'Generar análisis'}
            </Button>
          </form>
        </div>

        {/* Resultado */}
        <div>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-100">
              <Bot className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">El análisis aparecerá aquí</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-gray-100 bg-gray-50">
              <div className="h-8 w-8 border-3 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">El Copiloto está analizando...</p>
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[#1B3A6B]" />
                    Análisis del Copiloto
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[result.riskLevel]}`}>
                      Riesgo: {RISK_LEVEL_LABELS[result.riskLevel]}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyResponse}>
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {result.riskFlags.length > 0 && (
                  <div className="mb-4 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2">
                    <p className="text-xs font-medium text-orange-800 mb-1">Alertas detectadas en la respuesta:</p>
                    {result.riskFlags.map(flag => (
                      <span key={flag} className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs mr-1 mb-1">{flag.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-lg p-4">
                    {result.response}
                  </pre>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Esta es una sugerencia. Revisá y editá antes de usar con el cliente.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                    <RefreshCw className="h-3 w-3" /> Nuevo análisis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
