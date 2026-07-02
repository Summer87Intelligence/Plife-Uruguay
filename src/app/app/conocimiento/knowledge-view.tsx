'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Plus, FileText, Tag, Eye, Power, AlertTriangle, Cpu, RotateCcw, Search, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import {
  createKnowledgeDocument,
  setKnowledgeStatus,
  indexKnowledgeDocument,
  reindexKnowledgeDocument,
  searchKnowledgeDocuments,
} from '@/domains/knowledge/actions'
import type { Profile, KnowledgeDocument, DocumentStatus } from '@/types/database'
import type { SemanticChunk } from '@/lib/ai/embeddings'

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
  contentMap: Record<string, string>
  chunkCount: Record<string, number>
  embeddedCount: Record<string, number>
  embeddingsReady: boolean
  profile: Profile
}

type IndexFeedback = { docId: string; message: string; ok: boolean }

export function KnowledgeView({ documents, contentMap, chunkCount, embeddedCount, embeddingsReady, profile }: KnowledgeViewProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [indexFeedback, setIndexFeedback] = useState<IndexFeedback | null>(null)

  // Semantic search
  const [semanticQuery, setSemanticQuery] = useState('')
  const [semanticLoading, setSemanticLoading] = useState(false)
  const [semanticResults, setSemanticResults] = useState<SemanticChunk[] | null>(null)
  const [semanticMode, setSemanticMode] = useState<boolean | null>(null)

  const router = useRouter()
  const canManage = ['admin', 'direccion', 'compliance', 'capacitacion'].includes(profile.role)

  const [form, setForm] = useState({ name: '', description: '', category: 'producto', content: '', tags: '' })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = documents.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return d.name.toLowerCase().includes(q)
      || d.category?.toLowerCase().includes(q)
      || (contentMap[d.id] ?? '').toLowerCase().includes(q)
      || (d.tags ?? []).some(t => t.toLowerCase().includes(q))
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    const res = await createKnowledgeDocument(form)
    if (res.error) {
      setFormError(res.error)
      setLoading(false)
    } else {
      router.refresh()
      setOpen(false)
      setForm({ name: '', description: '', category: 'producto', content: '', tags: '' })
      setLoading(false)
    }
  }

  async function toggleStatus(doc: KnowledgeDocument) {
    setBusyId(doc.id)
    const next: DocumentStatus = doc.status === 'activo' ? 'inactivo' : 'activo'
    await setKnowledgeStatus(doc.id, next)
    router.refresh()
    setBusyId(null)
  }

  async function handleIndex(docId: string) {
    setBusyId(docId)
    setIndexFeedback(null)
    const res = await indexKnowledgeDocument(docId)
    if (res.error) {
      setIndexFeedback({ docId, message: res.error, ok: false })
    } else if (res.fallback) {
      setIndexFeedback({ docId, message: 'Búsqueda inteligente no disponible. Contactá al administrador para activarla.', ok: false })
    } else {
      setIndexFeedback({ docId, message: `${res.chunksIndexed} chunk${res.chunksIndexed !== 1 ? 's' : ''} indexado${res.chunksIndexed !== 1 ? 's' : ''}${res.chunksSkipped ? `, ${res.chunksSkipped} ya tenían embedding` : ''}.`, ok: true })
    }
    router.refresh()
    setBusyId(null)
  }

  async function handleReindex(docId: string) {
    setBusyId(docId)
    setIndexFeedback(null)
    const res = await reindexKnowledgeDocument(docId)
    if (res.error) {
      setIndexFeedback({ docId, message: res.error, ok: false })
    } else if (res.fallback) {
      setIndexFeedback({ docId, message: 'Búsqueda inteligente no disponible. Contactá al administrador.', ok: false })
    } else {
      setIndexFeedback({ docId, message: `Reindexado: ${res.chunksIndexed} chunk${res.chunksIndexed !== 1 ? 's' : ''} con nuevo embedding.`, ok: true })
    }
    router.refresh()
    setBusyId(null)
  }

  async function handleSemanticSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!semanticQuery.trim()) return
    setSemanticLoading(true)
    setSemanticResults(null)
    const res = await searchKnowledgeDocuments(semanticQuery)
    if (res.data) {
      setSemanticResults(res.data.chunks)
      setSemanticMode(res.data.usedSemantic)
    }
    setSemanticLoading(false)
  }

  const activeCount = documents.filter(d => d.status === 'activo').length
  const byStatus = {
    activo: activeCount,
    en_revision: documents.filter(d => d.status === 'en_revision').length,
    inactivo: documents.filter(d => d.status === 'inactivo').length,
  }

  const totalChunks = Object.values(chunkCount).reduce((a, b) => a + b, 0)
  const totalEmbedded = Object.values(embeddedCount).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#1B3A6B]" /> Base de Conocimiento
          </h1>
          <p className="text-sm text-gray-500">Documentos validados que el equipo y la IA usan para responder con precisión.</p>
          <p className="text-xs text-gray-400 mt-0.5">Solo los documentos activos e indexados alimentan las búsquedas inteligentes.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Agregar documento</Button>
            </DialogTrigger>
            <DialogContent title="Nuevo documento" description="Quedará en revisión hasta que lo actives.">
              <form onSubmit={handleCreate} className="space-y-4">
                <Input label="Nombre del documento *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                <Select label="Categoría" value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))} options={categoryOptions} />
                <Textarea label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Resumen breve del documento" />
                <Textarea label="Contenido" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} placeholder="Pegá aquí el texto validado que la IA podrá usar como referencia..." />
                <Input label="Tags (separados por coma)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="seguro, vida, colectivo..." />
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs text-blue-800">Solo los documentos <strong>activos</strong> son usados por la IA. Indexalos para activar búsqueda semántica.</p>
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

      {activeCount === 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Todavía no hay base de conocimiento validada. La IA puede ayudar a estructurar conversaciones, pero <strong>no debe afirmar condiciones de producto</strong>.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-100 bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">Activos en IA</p>
          <p className="text-2xl font-bold text-green-800 mt-0.5">{byStatus.activo}</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3">
          <p className="text-xs font-medium text-yellow-700">En revisión</p>
          <p className="text-2xl font-bold text-yellow-800 mt-0.5">{byStatus.en_revision}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-600">Fragmentos de texto</p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalChunks}</p>
        </div>
        <div className={`rounded-xl border p-3 ${embeddingsReady ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
          <p className={`text-xs font-medium ${embeddingsReady ? 'text-blue-700' : 'text-gray-500'}`}>
            {embeddingsReady ? 'Listos para búsqueda' : 'Búsqueda inteligente'}
          </p>
          <p className={`text-2xl font-bold mt-0.5 ${embeddingsReady ? 'text-blue-800' : 'text-gray-400'}`}>
            {embeddingsReady ? `${totalEmbedded}/${totalChunks}` : '—'}
          </p>
          {!embeddingsReady && (
            <p className="text-[10px] text-gray-400 mt-0.5">Configuración pendiente — contactá al administrador</p>
          )}
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre, contenido o tag..."
        className="w-full h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
      />

      {/* Semantic / text search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5" />
          Buscar en contenido
          <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${embeddingsReady ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {embeddingsReady ? 'inteligente' : 'por texto'}
          </span>
        </p>
        <form onSubmit={handleSemanticSearch} className="flex gap-2">
          <input
            value={semanticQuery}
            onChange={e => setSemanticQuery(e.target.value)}
            placeholder="Ej: cobertura de vida, objeción por precio, beneficios colectivos..."
            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
          <Button type="submit" loading={semanticLoading} disabled={!semanticQuery.trim()}>
            <Search className="h-4 w-4" />Buscar
          </Button>
        </form>
        {semanticResults !== null && (
          <div className="space-y-2">
            {semanticResults.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Sin resultados — probá con otros términos o indexá más documentos.</p>
            ) : (
              <>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  {semanticMode ? <><Cpu className="h-3 w-3 text-blue-500" />Búsqueda semántica</> : <><Search className="h-3 w-3" />Búsqueda por texto</>}
                  {' '}· {semanticResults.length} resultado{semanticResults.length !== 1 ? 's' : ''}
                </p>
                <ul className="space-y-2">
                  {semanticResults.map(r => (
                    <li key={r.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#1B3A6B]">{r.document_name}</span>
                        {r.similarity > 0 && (
                          <span className="text-[10px] text-blue-500 bg-blue-50 rounded-full px-1.5 py-0.5">
                            {Math.round(r.similarity * 100)}% similar
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-3">{r.content}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin documentos"
          description={canManage ? 'Agregá documentos validados que la IA usará como referencia.' : 'Los documentos los cargan administración y capacitación. Consultá con tu equipo si necesitás material.'}
          example="Condiciones de un seguro de vida, guion aprobado de apertura, FAQ de objeciones frecuentes."
          action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Agregar documento</Button> : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(doc => {
              const content = contentMap[doc.id] ?? ''
              const chunks = chunkCount[doc.id] ?? 0
              const embedded = embeddedCount[doc.id] ?? 0
              const allIndexed = embeddingsReady && chunks > 0 && embedded >= chunks
              const someIndexed = embeddingsReady && embedded > 0 && embedded < chunks
              const needsIndex = embeddingsReady && chunks > 0 && embedded === 0
              const feedback = indexFeedback?.docId === doc.id ? indexFeedback : null

              return (
                <li key={doc.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/5 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-[#1B3A6B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                        <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[doc.status]}`}>
                          {statusLabels[doc.status]}
                        </span>
                        {chunks > 0 && (
                          <span className="shrink-0 text-[10px] text-gray-400">
                            {chunks} fragmento{chunks !== 1 ? 's' : ''}
                          </span>
                        )}
                        {embeddingsReady && chunks > 0 && (
                          <span className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-medium ${allIndexed ? 'text-blue-600' : someIndexed ? 'text-yellow-600' : 'text-gray-400'}`}>
                            <Cpu className="h-3 w-3" />
                            {allIndexed ? 'Indexado' : someIndexed ? `${embedded}/${chunks} indexados` : 'Sin indexar'}
                          </span>
                        )}
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
                    <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Ver</Button>
                        </DialogTrigger>
                        <DialogContent title={doc.name} description={doc.description ?? undefined} className="max-w-2xl">
                          <div className="max-h-[60vh] overflow-y-auto">
                            {content ? (
                              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{content}</pre>
                            ) : (
                              <p className="text-sm text-gray-400">Este documento no tiene contenido de texto cargado.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {canManage && embeddingsReady && chunks > 0 && (
                        <>
                          {(needsIndex || someIndexed) && (
                            <Button
                              variant="ghost" size="sm"
                              loading={busyId === doc.id}
                              onClick={() => handleIndex(doc.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Cpu className="h-3.5 w-3.5" /> Indexar
                            </Button>
                          )}
                          {(allIndexed || someIndexed) && (
                            <Button
                              variant="ghost" size="sm"
                              loading={busyId === doc.id}
                              onClick={() => handleReindex(doc.id)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Reindexar
                            </Button>
                          )}
                        </>
                      )}

                      {canManage && chunks > 0 && !embeddingsReady && (
                        <Button
                          variant="ghost" size="sm"
                          loading={busyId === doc.id}
                          onClick={() => handleIndex(doc.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Cpu className="h-3.5 w-3.5" /> Indexar
                        </Button>
                      )}

                      {canManage && (
                        <Button variant="ghost" size="sm" loading={busyId === doc.id && !feedback} onClick={() => toggleStatus(doc)}>
                          <Power className={`h-3.5 w-3.5 ${doc.status === 'activo' ? 'text-green-600' : 'text-gray-400'}`} />
                          {doc.status === 'activo' ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                      <span className="text-xs text-gray-400 ml-2 hidden sm:block">{formatDate(doc.created_at)}</span>
                    </div>
                  </div>

                  {feedback && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-start gap-1.5 ${feedback.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                      {feedback.ok
                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        : <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                      {feedback.message}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
