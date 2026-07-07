'use client'
import { useState } from 'react'
import { Bot, Copy, CheckCircle, AlertTriangle, BookOpen, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AIResult } from '@/domains/ai/types'

interface AIResultPanelProps {
  result: AIResult | null
  loading: boolean
  error: string | null
  loadingLabel?: string
  onSaveActivity?: (content: string) => Promise<void>
  saveLabel?: string
}

export function AIResultPanel({ result, loading, error, loadingLabel = 'El copiloto está trabajando...', onSaveActivity, saveLabel = 'Guardar como actividad' }: AIResultPanelProps) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-gray-100 bg-gray-50">
        <div className="h-8 w-8 border-3 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500">{loadingLabel}</p>
      </div>
    )
  }

  if (error) {
    const notConfigured = error.includes('IA no configurada')
    return (
      <div className={`rounded-xl border px-4 py-4 ${notConfigured ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${notConfigured ? 'text-amber-500' : 'text-red-500'}`} />
          <div>
            <p className={`text-sm font-medium ${notConfigured ? 'text-amber-800' : 'text-red-700'}`}>
              {notConfigured ? 'IA no configurada' : 'No se pudo generar'}
            </p>
            <p className={`text-xs mt-0.5 ${notConfigured ? 'text-amber-600' : 'text-red-500'}`}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  async function copy() {
    if (!result) return
    await navigator.clipboard.writeText(result.response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function save() {
    if (!onSaveActivity || !result) return
    setSaving(true)
    await onSaveActivity(result.response)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${result.knowledgeUsed ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
          <BookOpen className="h-3 w-3" />
          {result.knowledgeUsed ? 'Con base validada' : 'Sin base validada'}
        </span>
      </div>

      {result.knowledgeUsed && result.documentNames && result.documentNames.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
          <p className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Fuentes utilizadas
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {result.documentNames.map((name, i) => (
              <li key={i} className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">{name}</li>
            ))}
          </ul>
        </div>
      )}

      {!result.knowledgeUsed && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <p className="text-xs text-amber-800">
            Todavía no hay base de conocimiento validada. La IA puede ayudar a estructurar conversaciones, pero no afirma condiciones de producto.
          </p>
        </div>
      )}

      {/* Response */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-50 px-4 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Bot className="h-3.5 w-3.5 text-[#1B3A6B]" /> Sugerencia del copiloto
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            {onSaveActivity && (
              <Button variant="ghost" size="sm" onClick={save} loading={saving}>
                {saved ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? 'Guardado' : saveLabel}
              </Button>
            )}
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed p-4">{result.response}</pre>
      </div>

      <p className="text-[11px] text-gray-400">
        Sugerencia generada por IA. Revisala y editala antes de usarla con un cliente. No reemplaza tu juicio profesional.
      </p>
    </div>
  )
}
