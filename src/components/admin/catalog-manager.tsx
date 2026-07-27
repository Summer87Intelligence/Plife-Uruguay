'use client'
import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface CatalogItem {
  id: string
  name: string
  is_active: boolean
}

interface ActionResult {
  data?: unknown
  error?: string
}

interface CatalogManagerProps {
  entityLabel: string
  entityLabelPlural: string
  /** Ej: "Nueva aseguradora" / "Nuevo ramo" — el género varía por entidad, no se puede derivar de entityLabel. */
  newItemLabel: string
  items: CatalogItem[]
  onCreate: (name: string) => Promise<ActionResult>
  onUpdate: (id: string, name: string) => Promise<ActionResult>
  onSetActive: (id: string, isActive: boolean) => Promise<ActionResult>
}

/**
 * Gestión mínima de un catálogo administrable (Aseguradoras, Ramos).
 * Un único CTA dominante por bloque; editar/activar/desactivar son acciones
 * secundarias. Baja lógica únicamente — nunca se elimina un registro.
 */
export function CatalogManager({ entityLabel, entityLabelPlural, newItemLabel, items, onCreate, onUpdate, onSetActive }: CatalogManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)

  const active = items.filter(i => i.is_active)
  const inactive = items.filter(i => !i.is_active)

  function openCreate() {
    setEditing(null)
    setName('')
    setError('')
    setDialogOpen(true)
  }

  function openEdit(item: CatalogItem) {
    setEditing(item)
    setName(item.name)
    setError('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Ingresá un nombre.'); return }
    setLoading(true)
    setError('')
    const result = editing ? await onUpdate(editing.id, name.trim()) : await onCreate(name.trim())
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setDialogOpen(false)
  }

  async function handleToggle(item: CatalogItem) {
    if (item.is_active) {
      const confirmed = window.confirm(`¿Desactivar "${item.name}"? Dejará de estar disponible para nuevas selecciones, pero no se elimina.`)
      if (!confirmed) return
    }
    setPendingToggleId(item.id)
    await onSetActive(item.id, !item.is_active)
    setPendingToggleId(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {active.length} activa(s){inactive.length > 0 ? `, ${inactive.length} inactiva(s)` : ''}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {newItemLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Sin {entityLabelPlural} configuradas</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {[...active, ...inactive].map(item => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  loading={pendingToggleId === item.id}
                  onClick={() => handleToggle(item)}
                >
                  {item.is_active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent title={editing ? `Editar ${entityLabel}` : newItemLabel}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre *"
              value={name}
              onChange={e => setName(e.target.value)}
              error={error}
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={loading}>{editing ? 'Guardar cambios' : `Crear ${entityLabel}`}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
