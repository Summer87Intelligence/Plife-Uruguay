'use client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { AIResultPanel } from '@/components/commercial/ai-result'
import type { AIResult } from '@/domains/ai/types'

export interface AIAction {
  id: string
  label: string
  run: () => Promise<{ data?: AIResult; error?: string }>
}

interface AIAssistantDialogProps {
  triggerLabel: string
  title: string
  description?: string
  actions: AIAction[]
  onSaveActivity?: (content: string) => Promise<void>
  triggerVariant?: 'default' | 'secondary' | 'ghost' | 'outline'
  triggerSize?: 'sm' | 'md'
  fullWidthTrigger?: boolean
}

export function AIAssistantDialog({ triggerLabel, title, description, actions, onSaveActivity, triggerVariant = 'secondary', triggerSize = 'sm', fullWidthTrigger }: AIAssistantDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AIResult | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  async function handleRun(action: AIAction) {
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveId(action.id)
    const res = await action.run()
    if (res.error) setError(res.error)
    else if (res.data) setResult(res.data)
    setLoading(false)
  }

  function reset() {
    setResult(null)
    setError(null)
    setActiveId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={fullWidthTrigger ? 'w-full' : undefined}>
          <Sparkles className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent title={title} description={description} className="max-w-2xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {actions.map(a => (
              <Button
                key={a.id}
                variant={activeId === a.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRun(a)}
                disabled={loading}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <AIResultPanel
            result={result}
            loading={loading}
            error={error}
            onSaveActivity={onSaveActivity}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
