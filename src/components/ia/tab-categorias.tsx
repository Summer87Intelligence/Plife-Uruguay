'use client'

import { useState } from 'react'
import { Plus, Pencil, Tag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { AICategory, AIPrompt } from '@/types/database'
import type { IAEngineProps } from './types'
import { getCategoryColor } from './helpers'
import { CategoryForm } from './forms'

interface CategoriasTabProps {
  categories: AICategory[]
  prompts: AIPrompt[]
}

export function CategoriasTab({ categories, prompts }: CategoriasTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AICategory | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {categories.length} {categories.length === 1 ? 'categoría comercial' : 'categorías comerciales'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin categorías"
          description="Las categorías clasifican los prompts comerciales del motor de prompts PLIFE."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Crear primera categoría</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(cat => {
            const count = prompts.filter(p => p.category_id === cat.id).length
            const colors = getCategoryColor(cat)
            return (
              <Card key={cat.id} className={`border ${colors.border} overflow-hidden`}>
                <div className={`px-5 py-4 ${colors.bg}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                        <p className={`text-sm font-semibold ${colors.text}`}>{cat.label}</p>
                        <Badge variant={cat.is_active ? 'success' : 'secondary'}>{cat.is_active ? 'Activa' : 'Inactiva'}</Badge>
                      </div>
                      {cat.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{cat.description}</p>}
                      <p className="text-xs text-gray-500 mt-2">{count} prompt{count !== 1 ? 's' : ''} comercial{count !== 1 ? 'es' : ''}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditTarget(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent title="Nueva categoría" description="Define un nuevo tipo de análisis comercial">
          <CategoryForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent title="Editar categoría" description={editTarget?.label}>
          {editTarget && <CategoryForm initial={editTarget} onSuccess={() => setEditTarget(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
