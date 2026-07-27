'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { PolicyFormData } from '@/domains/policies/types'
import { PAYMENT_FREQUENCY_LABELS } from '@/domains/policies/types'
import { isDemoMode } from '@/lib/demo'
import { PLIFE_BUSINESS_CONFIG } from '@/lib/business-config'

interface PolicyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PolicyFormData) => void
}

const EMPTY: PolicyFormData = {
  holderName: '', insurerName: PLIFE_BUSINESS_CONFIG.insurer, branchName: PLIFE_BUSINESS_CONFIG.insuranceBranch,
  product: '', startDate: '', endDate: '', premium: '', paymentFrequency: '', nextAction: '',
}

const PAYMENT_FREQUENCY_OPTIONS = [
  { value: '', label: 'Sin definir' },
  ...Object.entries(PAYMENT_FREQUENCY_LABELS).map(([value, label]) => ({ value, label })),
]

/**
 * Bloque UI-0 (prototipo visual): al confirmar, agrega la póliza solo al
 * estado local de la vista (no persiste, no llama a Supabase). Sirve para
 * validar el flujo de alta, no para dar de alta datos reales todavía.
 * Aseguradora y ramo son fijos (Plife es agente exclusivo de MAPFRE Vida —
 * ver src/lib/business-config.ts): no se ofrecen como campos editables para
 * no sugerir que existe otra opción.
 */
export function PolicyFormDialog({ open, onOpenChange, onSubmit }: PolicyFormDialogProps) {
  const [form, setForm] = useState<PolicyFormData>(EMPTY)
  const [error, setError] = useState('')

  function set(field: keyof PolicyFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.holderName.trim()) { setError('Ingresá el nombre del titular.'); return }
    setError('')
    onSubmit(form)
    setForm(EMPTY)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Nueva póliza"
        description={isDemoMode() ? undefined : 'Prototipo visual — este alta todavía no se guarda en la base de datos.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-gray-500">Los campos con * son obligatorios.</p>
          <Input label="Titular (persona física) *" value={form.holderName} onChange={e => set('holderName', e.target.value)} placeholder="Ej: Marcela García" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Aseguradora</p>
              <p className="text-sm text-gray-900 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">{PLIFE_BUSINESS_CONFIG.insurer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ramo</p>
              <p className="text-sm text-gray-900 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">{PLIFE_BUSINESS_CONFIG.insuranceBranch}</p>
            </div>
          </div>
          <Input label="Producto" value={form.product} onChange={e => set('product', e.target.value)} placeholder="Categoría provisional — catálogo maestro pendiente de validar con Plife" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Inicio de vigencia" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            <Input label="Vencimiento" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prima" type="number" value={form.premium} onChange={e => set('premium', e.target.value)} placeholder="Monto" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Frecuencia de pago</p>
              <Select value={form.paymentFrequency} onValueChange={v => set('paymentFrequency', v)} options={PAYMENT_FREQUENCY_OPTIONS} />
            </div>
          </div>
          <Input label="Próxima acción" value={form.nextAction} onChange={e => set('nextAction', e.target.value)} placeholder="Ej: Enviar cotización al titular" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="success">Crear póliza</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
