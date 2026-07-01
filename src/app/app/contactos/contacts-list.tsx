'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/lib/constants'
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
  profile: Profile
}

export function ContactsList({ contacts, profile }: ContactsListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [interestFilter, setInterestFilter] = useState('')
  const [open, setOpen] = useState(false)

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
          <p className="text-sm text-gray-500">Usá contactos para registrar a las personas con las que habla el asesor.</p>
          <p className="text-xs text-gray-400 mt-0.5">{countLabel}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nuevo contacto</Button>
          </DialogTrigger>
          <DialogContent title="Nuevo contacto" description="Agregá los datos del contacto">
            <ContactForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o empresa..."
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
          icon={Search}
          title={hasFilters ? 'Sin resultados para estos filtros' : 'Todavía no cargaste contactos'}
          description={
            hasFilters
              ? 'Probá ajustando los filtros o la búsqueda'
              : 'Agregá personas asociadas a empresas para iniciar conversaciones comerciales.'
          }
          example={
            !hasFilters
              ? 'Cargá a "Juan Pérez", gerente de una pyme que pidió información sobre protección empresarial, y registrá su próximo seguimiento.'
              : undefined
          }
          action={
            !hasFilters ? (
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
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="h-3 w-3" />{contact.phone}
                      </span>
                    )}
                    {contact.next_action_date && (
                      <span className="text-xs text-gray-400">
                        Próx: {new Date(contact.next_action_date).toLocaleDateString('es-UY')}
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
