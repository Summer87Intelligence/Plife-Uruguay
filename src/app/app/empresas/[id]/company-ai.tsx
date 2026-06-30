'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { AIResultPanel } from '@/components/commercial/ai-result'
import { analyzeCompanyB2B } from '@/domains/ai/actions'
import { saveCompanyB2BSuggestions } from '@/domains/companies/actions'
import type { AIResult } from '@/domains/ai/types'
import type { Company } from '@/types/database'

interface CompanyAIDialogProps {
  company: Pick<Company, 'id' | 'b2b_score' | 'commercial_angle' | 'ideal_contact' | 'risk_notes' | 'opportunity_detected'>
}

export function CompanyAIDialog({ company }: CompanyAIDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AIResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [fields, setFields] = useState({
    b2b_score: company.b2b_score?.toString() ?? '',
    commercial_angle: company.commercial_angle ?? '',
    ideal_contact: company.ideal_contact ?? '',
    risk_notes: company.risk_notes ?? '',
    opportunity_detected: company.opportunity_detected ?? '',
  })

  async function analyze() {
    setLoading(true)
    setError(null)
    setResult(null)
    const res = await analyzeCompanyB2B(company.id)
    if (res.error) setError(res.error)
    else if (res.data) setResult(res.data)
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    await saveCompanyB2BSuggestions(company.id, {
      b2b_score: fields.b2b_score ? Number(fields.b2b_score) : null,
      commercial_angle: fields.commercial_angle,
      ideal_contact: fields.ideal_contact,
      risk_notes: fields.risk_notes,
      opportunity_detected: fields.opportunity_detected,
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm"><Sparkles className="h-4 w-4" />Analizar oportunidad B2B</Button>
      </DialogTrigger>
      <DialogContent title="Análisis B2B con IA" description="Usa solo los datos cargados de la empresa" className="max-w-2xl">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto">
          <Button onClick={analyze} loading={loading} disabled={loading}>
            <Sparkles className="h-4 w-4" /> Analizar empresa
          </Button>

          <AIResultPanel result={result} loading={loading} error={error} />

          {result && (
            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Guardar sugerencias (revisalas antes)</p>
              <Input label="Score B2B (0-100)" type="number" value={fields.b2b_score} onChange={e => setFields(p => ({ ...p, b2b_score: e.target.value }))} />
              <Textarea label="Ángulo comercial" rows={2} value={fields.commercial_angle} onChange={e => setFields(p => ({ ...p, commercial_angle: e.target.value }))} />
              <Input label="Contacto ideal" value={fields.ideal_contact} onChange={e => setFields(p => ({ ...p, ideal_contact: e.target.value }))} />
              <Textarea label="Oportunidad detectada" rows={2} value={fields.opportunity_detected} onChange={e => setFields(p => ({ ...p, opportunity_detected: e.target.value }))} />
              <Textarea label="Notas de riesgo" rows={2} value={fields.risk_notes} onChange={e => setFields(p => ({ ...p, risk_notes: e.target.value }))} />
              <div className="flex justify-end">
                <Button onClick={save} loading={saving}>
                  <Save className="h-4 w-4" /> {saved ? 'Guardado' : 'Guardar en la empresa'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
