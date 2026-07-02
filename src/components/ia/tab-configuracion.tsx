'use client'

import { useState } from 'react'
import { GripVertical, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { IAEngineProps } from './types'
import { getCategoryColor, getProfilePrompts, PROMPT_STATUS_LABELS, PROMPT_STATUS_VARIANTS } from './helpers'
import { ProfileSelector } from './profile-selector'
import { PromptEditor } from './prompt-editor'

interface ConfiguracionTabProps extends IAEngineProps {
  activeProfileId: string
  onProfileChange: (id: string) => void
}

export function ConfiguracionTab({
  stages, categories, prompts, profiles, profilePrompts,
  activeProfileId, onProfileChange,
}: ConfiguracionTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const activeProfile = profiles.find(p => p.id === activeProfileId)
  const profileLinks = getProfilePrompts(activeProfileId, profilePrompts, prompts)
  const linkedPromptIds = new Set(profileLinks.map(pl => pl.prompt?.id).filter(Boolean))
  const catalogRest = prompts.filter(p => !linkedPromptIds.has(p.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {activeProfile && <Badge variant="success">Perfil activo: {activeProfile.name}</Badge>}
        <ProfileSelector profiles={profiles} value={activeProfileId} onChange={onProfileChange} />
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">Orden en perfil activo</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <GripVertical className="h-3.5 w-3.5" />
          Arrastrá con el ícono para cambiar el orden de ejecución. (Edición por campo de orden disponible en Perfiles de análisis.)
        </p>
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {profileLinks.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">No hay prompts vinculados a este perfil.</p>
          ) : profileLinks.map(({ link, prompt }) => {
            if (!prompt) return null
            const category = categories.find(c => c.id === prompt.category_id)
            const stage = stages.find(s => s.id === prompt.stage_id)
            const colors = getCategoryColor(category)
            const isEditing = editingId === prompt.id

            return (
              <div key={link.id}>
                <div className={`flex items-center gap-3 px-5 py-3.5 ${colors.bg} border-l-4 ${colors.border}`}>
                  <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                  <span className="text-xs font-mono text-gray-400 w-8 text-right shrink-0">#{link.execution_order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prompt.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[category?.label, stage?.label].filter(Boolean).join(' · ') || 'Sin categoría'}
                    </p>
                  </div>
                  <Badge variant={PROMPT_STATUS_VARIANTS[prompt.status]}>{PROMPT_STATUS_LABELS[prompt.status]}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(isEditing ? null : prompt.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                </div>
                {isEditing && (
                  <div className="px-5 pb-4">
                    <PromptEditor
                      prompt={prompt}
                      categories={categories}
                      stages={stages}
                      onClose={() => setEditingId(null)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Resto del catálogo</p>
        <Card>
          <div className="divide-y divide-gray-50">
            {catalogRest.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">Todos los prompts están incluidos en el perfil activo.</p>
            ) : catalogRest.map(prompt => {
              const category = categories.find(c => c.id === prompt.category_id)
              const colors = getCategoryColor(category)
              const isEditing = editingId === prompt.id
              return (
                <div key={prompt.id}>
                  <div className={`flex items-center gap-3 px-5 py-3 ${colors.bg}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{prompt.name}</p>
                      <p className="text-xs text-gray-500">{category?.label ?? 'Sin categoría'}</p>
                    </div>
                    <Badge variant={PROMPT_STATUS_VARIANTS[prompt.status]}>{PROMPT_STATUS_LABELS[prompt.status]}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(isEditing ? null : prompt.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </div>
                  {isEditing && (
                    <div className="px-5 pb-4">
                      <PromptEditor prompt={prompt} categories={categories} stages={stages} onClose={() => setEditingId(null)} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
