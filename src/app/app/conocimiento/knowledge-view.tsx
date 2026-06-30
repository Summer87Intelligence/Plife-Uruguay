'use client'
import { useState } from 'react'
import { BookOpen, Plus, FileText, Tag, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, KnowledgeDocument } from '@/types/database'

const statusColors: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  inactivo: 'bg-gray-100 text-gray-600',
  en_revision: 'bg-yellow-100 text-yellow-800',
  archivado: 'bg-gray-100 text-gray-400',
}

const statusLabels: Record<string, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  en_revision: 'En revisión',
  archivado: 'Archivado',
}

const categoryOptions = [
  { value: 'producto', label: 'Producto PLIFE/MAPFRE' },
  { value: 'comercial', label: 'Material comercial' },
  { value: 'faq', label: 'Preguntas frecuentes' },
  { value: 'guion', label: 'Guiones aprobados' },
  { value: 'compliance', label: 'Compliance / reglas' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'politica', label: 'Políticas internas' },
  { value: 'objeciones', label: 'Manejo de objeciones' },
  { value: 'otro', label: 'Otro' },
]

interface KnowledgeViewProps {
  documents: KnowledgeDocument[]
  profile: Profile
}

export function KnowledgeView({ documents, profile }: KnowledgeViewProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const canManage = ['admin', 'direccion', 'compliance', 'capacitacion'].includes(profile.role)

  const [form, setForm] = useState({ name: '', description: '', category: 'producto', tags: '' })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = documents.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q)
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    const supabase = createClient()
    const { error } = await supabase.from('knowledge_documents').insert({
      name: form.name,
      description: form.description,
      category: form.category,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      status: 'en_revision',
    })
    if (error) {
      setFormError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      setOpen(false)
    }
  }

  const byStatus = {
    activo: documents.filter(d => d.status === 'activo').length,
    en_revision: documents.filter(d => d.status === 'en_revision').length,
    inactivo: documents.filter(d => d.status === 'inactivo').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#1B3A6B]" />
            Base de Conocimiento
          </h1>
          <p className="text-sm text-gray-500">Documentos validados usados por los agentes IA</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Agregar documento</Button>
            </DialogTrigger>
            <DialogContent title="Nuevo documento" description="Los documentos en revisión no serán usados por IA hasta ser activados">
              <form onSubmit={handleCreate} className="space-y-4">
                <Input label="Nombre del documento *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <Select label="Categoría" value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))} options={categoryOptions} />
                <Textarea label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                <Input label="Tags (separados por coma)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="seguro, vida, colectivo..." />
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs text-blue-800">El documento quedará en estado "En revisión". Para que sea usado por IA debe ser activado por un administrador y procesado con embeddings.</p>
                </div>
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={loading}>Crear documento</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">Activos en IA</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{byStatus.activo}</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
          <p className="text-xs font-medium text-yellow-700">En revisión</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{byStatus.en_revision}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">Inactivos</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{byStatus.inactivo}</p>
        </div>
      </div>

      <div className="relative">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar documento..."
          className="w-full h-9 pl-4 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin documentos"
          description="Agregá documentos validados que los agentes IA usarán como fuente de verdad"
          action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Agregar documento</Button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <li key={doc.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/5 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-[#1B3A6B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[doc.status]}`}>
                      {statusLabels[doc.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {doc.category && <span className="text-xs text-gray-500">{doc.category}</span>}
                    {doc.tags && doc.tags.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Tag className="h-3 w-3" />{doc.tags.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                  <p className="text-xs text-gray-400">v{doc.version}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
