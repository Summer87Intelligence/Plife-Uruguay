'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { PolicyFormData } from '@/domains/policies/types'
import { isDemoMode } from '@/lib/demo'

interface PolicyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PolicyFormData) => void
}

const EMPTY: PolicyFormData = {
  companyName: '', contactName: '', insurerName: '', branchName: '',
  product: '', startDate: '', endDate: '', premium: '', nextAction: '',
}

/**
 * Bloque UI-0 (prototipo visual): al confirmar, agrega la póliza solo al
 * estado local de la vista (no persiste, no llama a Supabase). Sirve para
 * validar el flujo de alta, no para dar de alta datos reales todavía.
 */
export function PolicyFormDialog({ open, onOpenChange, onSubmit }: PolicyFormDialogProps) {
  const [form, setForm] = useState<PolicyFormData>(EMPTY)
  const [error, setError] = useState('')

  function set(field: keyof PolicyFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim()) { setError('Ingresá la empresa cliente.'); return }
    if (!form.insurerName.trim()) { setError('Ingresá la aseguradora.'); return }
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
          <Input label="Empresa cliente *" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Ej: Estudio García y Asociados" />
          <Input label="Contacto responsable" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Ej: Marcela García" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Aseguradora *" value={form.insurerName} onChange={e => set('insurerName', e.target.value)} placeholder="Ej: BSE" />
            <Input label="Ramo" value={form.branchName} onChange={e => set('branchName', e.target.value)} placeholder="Ej: Vehículos" />
          </div>
          <Input label="Producto" value={form.product} onChange={e => set('product', e.target.value)} placeholder="Descripción del producto contratado" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Inicio de vigencia" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            <Input label="Vencimiento" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <Input label="Prima" type="number" value={form.premium} onChange={e => set('premium', e.target.value)} placeholder="Monto" />
          <Input label="Próxima acción" value={form.nextAction} onChange={e => set('nextAction', e.target.value)} placeholder="Ej: Enviar cotización al cliente" />
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
