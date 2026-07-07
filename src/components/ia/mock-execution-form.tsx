'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AIAnalysisProfile } from '@/types/database'
import { runMockAnalysis } from '@/app/app/ia/actions'
import { ProfileSelector } from './profile-selector'
import { getActiveProfile } from './helpers'

const ENTITY_OPTIONS = [
  { value: 'company', label: 'Empresa' },
  { value: 'contact', label: 'Contacto' },
  { value: 'opportunity', label: 'Oportunidad' },
  { value: 'campaign', label: 'Campaña' },
] as const

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface MockExecutionFormProps {
  profiles: AIAnalysisProfile[]
  defaultProfileId?: string
}

export function MockExecutionForm({ profiles, defaultProfileId }: MockExecutionFormProps) {
  const router = useRouter()
  const defaultProfile = getActiveProfile(profiles)
  const [entityType, setEntityType] = useState<'company' | 'contact' | 'opportunity' | 'campaign'>('company')
  const [entityId, setEntityId] = useState('')
  const [profileId, setProfileId] = useState(defaultProfileId ?? defaultProfile?.id ?? profiles[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!entityId.trim()) {
      setError('El ID de entidad es requerido.')
      return
    }
    if (!UUID_RE.test(entityId.trim())) {
      setError('El ID de entidad debe ser un UUID válido.')
      return
    }
    if (!profileId) {
      setError('Seleccioná un perfil de análisis.')
      return
    }

    startTransition(async () => {
      const result = await runMockAnalysis({
        entityType,
        entityId: entityId.trim(),
        profileId,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(`Ejecución mock completada. Run ID: ${result.data?.runId}`)
      router.refresh()
    })
  }

  return (
    <Card className="border-gray-100">
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Ejecutar prueba del Motor IA</p>
          <p className="text-xs text-gray-500 mt-1">
            Esta ejecución usa modo simulado interno (sin proveedor externo) y no genera recomendaciones finales.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Tipo de entidad</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value as typeof entityType)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              {ENTITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="ID de entidad"
            value={entityId}
            onChange={e => setEntityId(e.target.value)}
            placeholder="00000000-0000-0000-0000-000000000001"
            hint="UUID de empresa, contacto, oportunidad o campaña"
          />

          <ProfileSelector
            profiles={profiles}
            value={profileId}
            onChange={setProfileId}
            label="Perfil"
          />

          <Button type="submit" loading={isPending} disabled={isPending}>
            <Play className="h-4 w-4" />
            Ejecutar prueba
          </Button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
      </CardContent>
    </Card>
  )
}
