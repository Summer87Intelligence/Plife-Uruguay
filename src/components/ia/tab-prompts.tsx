'use client'

import { useState } from 'react'
import { Eye, Pencil, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils'
import type { AIPrompt, AIPromptStatus, AIPromptSuggestion } from '@/types/database'
import type { IAEngineProps } from './types'
import { getCategoryColor, getProfilePrompts, PROMPT_STATUS_LABELS, PROMPT_STATUS_VARIANTS, buildPromptPreview, getPromptQualityBadge } from './helpers'
import { ProfileSelector } from './profile-selector'
import { PromptEditor } from './prompt-editor'
import { PromptSuggestionsPanel } from './prompt-suggestions-panel'

interface PromptsTabProps extends IAEngineProps {
  activeProfileId: string
  onProfileChange: (id: string) => void
}

type ViewMode = 'category' | 'list'
type StatusFilter = 'all' | AIPromptStatus

export function PromptsTab({
  stages, categories, prompts, profiles, profilePrompts, promptSuggestions,
  activeProfileId, onProfileChange,
}: PromptsTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('category')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [suggestionsId, setSuggestionsId] = useState<string | null>(null)

  const profileLinks = getProfilePrompts(activeProfileId, profilePrompts, prompts)
  const profilePromptIds = new Set(profileLinks.map(pl => pl.prompt?.id).filter(Boolean))

  const filtered = prompts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return profilePromptIds.has(p.id) || p.is_active
  })

  const grouped = categories.map(cat => ({
    category: cat,
    colors: getCategoryColor(cat),
    prompts: filtered.filter(p => p.category_id === cat.id),
  })).filter(g => g.prompts.length > 0)

  const uncategorized = filtered.filter(p => !p.category_id)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <ProfileSelector profiles={profiles} value={activeProfileId} onChange={onProfileChange} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Vista</label>
          <select value={viewMode} onChange={e => setViewMode(e.target.value as ViewMode)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="category">Agrupar por categoría</option>
            <option value="list">Lista plana</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Estado</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="all">Todos</option>
            <option value="validated">Validado</option>
            <option value="draft">Borrador</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      {viewMode === 'category' ? (
        <div className="space-y-6">
          {grouped.map(({ category, colors, prompts: catPrompts }) => (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <p className={`text-sm font-semibold ${colors.text}`}>{category.label}</p>
                <span className="text-xs text-gray-400">({catPrompts.length})</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {catPrompts.map(p => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    categories={categories}
                    stages={stages}
                    promptSuggestions={promptSuggestions}
                    colors={colors}
                    isEditing={editingId === p.id}
                    isViewing={viewingId === p.id}
                    isSuggestionsOpen={suggestionsId === p.id}
                    onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
                    onView={() => setViewingId(viewingId === p.id ? null : p.id)}
                    onSuggestions={() => setSuggestionsId(suggestionsId === p.id ? null : p.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Sin categoría</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {uncategorized.map(p => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    categories={categories}
                    stages={stages}
                    promptSuggestions={promptSuggestions}
                    isEditing={editingId === p.id}
                    isViewing={viewingId === p.id}
                    isSuggestionsOpen={suggestionsId === p.id}
                    onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
                    onView={() => setViewingId(viewingId === p.id ? null : p.id)}
                    onSuggestions={() => setSuggestionsId(suggestionsId === p.id ? null : p.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(p => {
            const cat = categories.find(c => c.id === p.category_id)
            const colors = getCategoryColor(cat)
            return (
              <PromptCard
                key={p.id}
                prompt={p}
                categories={categories}
                stages={stages}
                promptSuggestions={promptSuggestions}
                colors={colors}
                isEditing={editingId === p.id}
                isViewing={viewingId === p.id}
                isSuggestionsOpen={suggestionsId === p.id}
                onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
                onView={() => setViewingId(viewingId === p.id ? null : p.id)}
                onSuggestions={() => setSuggestionsId(suggestionsId === p.id ? null : p.id)}
              />
            )
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No hay prompts que coincidan con los filtros seleccionados.</p>
      )}
    </div>
  )
}

function PromptCard({
  prompt, categories, stages, promptSuggestions, colors, isEditing, isViewing, isSuggestionsOpen,
  onEdit, onView, onSuggestions,
}: {
  prompt: AIPrompt
  categories: IAEngineProps['categories']
  stages: IAEngineProps['stages']
  promptSuggestions: AIPromptSuggestion[]
  colors?: ReturnType<typeof getCategoryColor>
  isEditing: boolean
  isViewing: boolean
  isSuggestionsOpen: boolean
  onEdit: () => void
  onView: () => void
  onSuggestions: () => void
}) {
  const category = categories.find(c => c.id === prompt.category_id)
  const stage = stages.find(s => s.id === prompt.stage_id)
  const c = colors ?? getCategoryColor(category)
  const qualityBadge = getPromptQualityBadge(prompt, promptSuggestions)

  return (
    <Card className={`overflow-hidden border ${c.border}`}>
      <div className={`px-4 py-3 ${c.bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{prompt.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{[category?.label, stage?.label].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={PROMPT_STATUS_VARIANTS[prompt.status]}>{PROMPT_STATUS_LABELS[prompt.status]}</Badge>
            <Badge variant={qualityBadge.variant}>{qualityBadge.label}</Badge>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Actualizado {formatRelativeDate(prompt.updated_at)}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3 w-3" />Editar</Button>
          <Button size="sm" variant="ghost" onClick={onView}><Eye className="h-3 w-3" />Ver</Button>
          <Button size="sm" variant="ghost" onClick={onSuggestions}><Lightbulb className="h-3 w-3" />Ver sugerencias</Button>
        </div>
      </div>
      {isViewing && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs font-medium text-gray-500 mb-2">Vista previa</p>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{buildPromptPreview(prompt)}</pre>
        </div>
      )}
      {isSuggestionsOpen && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <PromptSuggestionsPanel prompt={prompt} categories={categories} suggestions={promptSuggestions} />
        </div>
      )}
      {isEditing && (
        <div className="px-4 pb-4">
          <PromptEditor prompt={prompt} categories={categories} stages={stages} promptSuggestions={promptSuggestions} onClose={onEdit} />
        </div>
      )}
    </Card>
  )
}
