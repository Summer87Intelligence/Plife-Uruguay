'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Phone, Building2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchNoResults } from '@/components/navigation/search-no-results'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/lib/constants'
import { getContactPriority } from '@/lib/commercial-priority'
import { PriorityBadge } from '@/components/commercial/priority-badge'
import { ContactForm } from './contact-form'
import type { Profile, Contact } from '@/types/database'

const INTEREST_LABELS: Record<string, string> = {
  bajo: 'Interés bajo',
  medio: 'Interés medio',
  alto: 'Interés alto',
  muy_alto: 'Interés muy alto',
}

const FILTER_SELECT = 'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] cursor-pointer'

interface ContactsListProps {
  contacts: (Contact & { company?: { id: string; name: string } | null })[]
  companies: { id: string; name: string }[]
  profile: Profile
  autoOpenNew?: boolean
  initialCompanyId?: string
}

export function ContactsList({ contacts, companies, profile, autoOpenNew, initialCompanyId }: ContactsListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [interestFilter, setInterestFilter] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoOpenNew) setOpen(true)
  }, [autoOpenNew])

  const filtered = contacts.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false
    if (interestFilter && c.interest_level !== interestFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.position?.toLowerCase().includes(q) ||
      c.company?.name.toLowerCase().includes(q)
    )
  })

  const hasFilters = !!(search || statusFilter || interestFilter)
  const countLabel = hasFilters
    ? `${filtered.length} de ${contacts.length} contactos`
    : `${contacts.length} contactos`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contactos</h1>
          <p className="text-sm text-gray-500">Acá guardás las personas con las que hablás dentro de cada empresa. Un contacto sirve para no perder seguimiento y convertir conversaciones en oportunidades.</p>
          <p className="text-xs text-gray-400 mt-0.5">Después de cargar un contacto, creá una oportunidad para seguir la conversación comercial.</p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nuevo contacto</Button>
          </DialogTrigger>
          <DialogContent title="Nuevo contacto" description="Completá los datos de la persona y asociala a una empresa si corresponde">
            <ContactForm
              companies={companies}
              initial={initialCompanyId ? { company_id: initialCompanyId } : undefined}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa, cargo o email"
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Todos los estados</option>
          {Object.entries(CONTACT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={interestFilter} onChange={e => setInterestFilter(e.target.value)} className={FILTER_SELECT}>
          <option value="">Todos los niveles de interés</option>
          {Object.entries(INTEREST_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="h-8 px-3 text-xs text-[#1B3A6B] hover:underline rounded-lg border border-gray-100 bg-white"
          >
            Limpiar búsqueda
          </button>
        )}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setInterestFilter('') }}
            className="h-8 px-3 text-xs text-gray-400 hover:text-gray-600 rounded-lg border border-gray-100 bg-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : Users}
          title={hasFilters ? 'No encontramos resultados para esta búsqueda.' : 'Todavía no hay contactos cargados.'}
          description={
            hasFilters
              ? 'Probá cambiar el texto o limpiar filtros.'
              : 'Creá un contacto y asocialo a una empresa para iniciar el seguimiento comercial.'
          }
          example={
            !hasFilters
              ? 'Cargá a "Juan Pérez", gerente de una pyme que pidió información sobre protección empresarial, y registrá su próximo seguimiento.'
              : undefined
          }
          action={
            hasFilters
              ? <SearchNoResults
                  onClearSearch={() => setSearch('')}
                  onClearFilters={() => { setSearch(''); setStatusFilter(''); setInterestFilter('') }}
                  hasFilters={!!(statusFilter || interestFilter)}
                />
              : !hasFilters ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />Nuevo contacto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(contact => (
              <li key={contact.id}>
                <Link
                  href={`/app/contactos/${contact.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <Avatar name={`${contact.first_name} ${contact.last_name}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_COLORS[contact.status]}`}>
                        {CONTACT_STATUS_LABELS[contact.status]}
                      </span>
                      {contact.interest_level && contact.interest_level !== 'bajo' && (
                        <span className="inline-flex items-center rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B] px-2 py-0.5 text-xs font-medium">
                          {INTEREST_LABELS[contact.interest_level]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      {contact.position && (
                        <span className="text-xs text-gray-500">{contact.position}</span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="h-3 w-3" />{contact.company.name}
                        </span>
                      )}
                    </div>
                    {contact.next_action && (
                      <p className="text-xs text-[#1B3A6B] truncate mt-0.5">{contact.next_action}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(() => { const p = getContactPriority(contact); return p.label !== 'Baja' ? <PriorityBadge label={p.label} tone={p.tone} reason={p.reason} size="sm" /> : null })()}
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="h-3 w-3" />{contact.phone}
                      </span>
                    )}
                    {contact.next_action_date && (
                      <span className="text-xs text-gray-400">
                        Seguimiento: {new Date(contact.next_action_date).toLocaleDateString('es-UY')}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
