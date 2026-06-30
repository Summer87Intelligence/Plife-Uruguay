'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { AIResultPanel } from '@/components/commercial/ai-result'
import { runCampaignAI } from '@/domains/ai/actions'
import type { AIResult, CampaignAITask } from '@/domains/ai/types'
import { saveCampaignAIField } from '@/domains/campaigns/actions'

const TASKS: { id: CampaignAITask; label: string }[] = [
  { id: 'mensaje_inicial', label: 'Mensaje inicial' },
  { id: 'guion_llamada', label: 'Guion de llamada' },
  { id: 'objeciones', label: 'Objeciones esperadas' },
  { id: 'secuencia_seguimiento', label: 'Secuencia de seguimiento' },
]

export function CampaignAIDialog({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AIResult | null>(null)
  const [activeTask, setActiveTask] = useState<CampaignAITask | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function run(task: CampaignAITask) {
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    setActiveTask(task)
    const res = await runCampaignAI(campaignId, task)
    if (res.error) setError(res.error)
    else if (res.data) setResult(res.data)
    setLoading(false)
  }

  async function save() {
    if (!result || !activeTask) return
    setSaving(true)
    await saveCampaignAIField(campaignId, activeTask, result.response)
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  const blocked = result?.compliance.action === 'bloqueado'

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResult(null); setError(null); setActiveTask(null) } }}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm"><Sparkles className="h-4 w-4" />Generar con IA</Button>
      </DialogTrigger>
      <DialogContent title="Material de campaña con IA" description="Generá y revisá antes de guardar. No se envía nada automáticamente." className="max-w-2xl">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {TASKS.map(t => (
              <Button key={t.id} variant={activeTask === t.id ? 'default' : 'outline'} size="sm" disabled={loading} onClick={() => run(t.id)}>
                {t.label}
              </Button>
            ))}
          </div>

          <AIResultPanel result={result} loading={loading} error={error} />

          {result && activeTask && (
            <div className="flex justify-end border-t border-gray-100 pt-3">
              <Button onClick={save} loading={saving} disabled={blocked}>
                <Save className="h-4 w-4" /> {saved ? 'Guardado en la campaña' : 'Guardar en la campaña'}
              </Button>
            </div>
          )}
          {blocked && <p className="text-xs text-red-600 text-right">Bloqueado por compliance. Ajustá el contenido antes de guardar.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
