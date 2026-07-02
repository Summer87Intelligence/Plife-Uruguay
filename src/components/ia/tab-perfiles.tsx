'use client'

import { useState, useEffect } from 'react'
import { Plus, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Textarea } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { IAEngineProps } from './types'
import { getCategoryColor, getProfilePrompts, PROMPT_STATUS_LABELS, PROMPT_STATUS_VARIANTS } from './helpers'
import { ProfileForm, AddPromptForm, EnabledToggle } from './forms'
import { updateProfile, type ProfileFormData } from '@/app/app/ia/actions'

export function PerfilesTab({ stages, categories, prompts, profiles, profilePrompts }: IAEngineProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [addPromptOpen, setAddPromptOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetClientType, setTargetClientType] = useState('')
  const [targetIndustries, setTargetIndustries] = useState('')
  const [baseInstructions, setBaseInstructions] = useState('')
  const [isActive, setIsActive] = useState(false)

  const selected = profiles.find(p => p.id === selectedId)

  useEffect(() => {
    if (!selected) return
    setName(selected.name)
    setDescription(selected.description ?? '')
    setTargetClientType(selected.target_client_type ?? '')
    setTargetIndustries(selected.target_industries ?? '')
    setBaseInstructions(selected.base_instructions)
    setIsActive(selected.is_active)
    setSaveError(null)
  }, [selectedId, selected])

  const selectProfile = (id: string) => {
    const p = profiles.find(pr => pr.id === id)
    setSelectedId(id)
    if (p) {
      setName(p.name)
      setDescription(p.description ?? '')
      setTargetClientType(p.target_client_type ?? '')
      setTargetIndustries(p.target_industries ?? '')
      setBaseInstructions(p.base_instructions)
      setIsActive(p.is_active)
    }
    setSaveError(null)
  }

  const profileLinks = selectedId ? getProfilePrompts(selectedId, profilePrompts, prompts) : []

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaveError(null)
    const data: ProfileFormData = {
      name,
      description: description || undefined,
      target_client_type: targetClientType || undefined,
      target_industries: targetIndustries || undefined,
      base_instructions: baseInstructions,
      is_active: isActive,
    }
    const result = await updateProfile(selected.id, data)
    setSaving(false)
    if (result.error) setSaveError(result.error)
  }

  if (profiles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Nuevo perfil</Button>
        </div>
        <EmptyState
          icon={Layers}
          title="Sin perfiles de análisis"
          description="Los perfiles agrupan prompts comerciales para ejecutar análisis sobre empresas, contactos u oportunidades."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Crear primer perfil</Button>}
        />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent title="Nuevo perfil de análisis" description="Perfil de análisis comercial PLIFE">
            <ProfileForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{profiles.length} perfiles de análisis comercial</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Nuevo perfil</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {profiles.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectProfile(p.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
              selectedId === p.id ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p.name}
            {p.is_active && <Badge variant={selectedId === p.id ? 'outline' : 'success'} className={selectedId === p.id ? 'border-white/40 text-white' : ''}>Activo</Badge>}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-900">Configuración del perfil</p>
              <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="Tipo de cliente objetivo" value={targetClientType} onChange={e => setTargetClientType(e.target.value)} placeholder="Ej: empresarial, pyme..." />
              <Input label="Industrias objetivo" value={targetIndustries} onChange={e => setTargetIndustries(e.target.value)} placeholder="Ej: salud, tecnología..." />
              <Textarea label="Descripción" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <Textarea label="Instrucciones base" value={baseInstructions} onChange={e => setBaseInstructions(e.target.value)} rows={4} />
              <div className="flex items-center gap-2">
                <input id="sel-prof-active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#1B3A6B]" />
                <label htmlFor="sel-prof-active" className="text-sm text-gray-700">Perfil activo</label>
              </div>
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <Button size="sm" loading={saving} onClick={handleSave}>Guardar configuración del perfil</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Prompts asociados</p>
                <Button size="sm" variant="outline" onClick={() => setAddPromptOpen(true)} disabled={prompts.length === 0}>
                  <Plus className="h-3.5 w-3.5" />Agregar
                </Button>
              </div>
              {profileLinks.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Sin prompts asociados a este perfil.</p>
              ) : (
                <div className="space-y-2">
                  {profileLinks.map(({ link, prompt }) => {
                    if (!prompt) return null
                    const category = categories.find(c => c.id === prompt.category_id)
                    const colors = getCategoryColor(category)
                    return (
                      <div key={link.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${colors.bg} ${colors.border}`}>
                        <input type="checkbox" checked={link.enabled_by_default} readOnly className="h-4 w-4 rounded accent-[#1B3A6B]" title="enabled_by_default" />
                        <span className="text-xs font-mono text-gray-400 w-8">#{link.execution_order}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{prompt.name}</p>
                          <p className="text-xs text-gray-500">{category?.label}</p>
                        </div>
                        <Badge variant={PROMPT_STATUS_VARIANTS[prompt.status]}>{PROMPT_STATUS_LABELS[prompt.status]}</Badge>
                        <EnabledToggle id={link.id} initial={link.enabled_by_default} />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent title="Nuevo perfil de análisis" description="Perfil de análisis comercial PLIFE">
          <ProfileForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={addPromptOpen} onOpenChange={setAddPromptOpen}>
        <DialogContent title="Agregar prompt al perfil" description="Vincular un prompt comercial a este perfil">
          {selectedId && (
            <AddPromptForm
              profileId={selectedId}
              prompts={prompts}
              alreadyLinked={profilePrompts.filter(pp => pp.profile_id === selectedId).map(pp => pp.prompt_id)}
              nextOrder={Math.max(0, ...profilePrompts.filter(pp => pp.profile_id === selectedId).map(pp => pp.execution_order)) + 10}
              onSuccess={() => setAddPromptOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
