'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Phone, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/lib/constants'
import { ContactForm } from './contact-form'
import type { Profile, Contact } from '@/types/database'

interface ContactsListProps {
  contacts: (Contact & { company?: { id: string; name: string } | null })[]
  profile: Profile
}

export function ContactsList({ contacts, profile }: ContactsListProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = contacts.filter(c => {
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contactos</h1>
          <p className="text-sm text-gray-500">{contacts.length} contactos</p>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, empresa..."
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={search ? 'Sin resultados' : 'Todavía no cargaste contactos'}
          description={search ? 'Probá con otro término de búsqueda' : 'Centralizá acá a las personas con las que trabaja tu equipo comercial: prospectos, referidos y clientes.'}
          example={!search ? 'Cargá a “Juan Pérez”, gerente de una pyme que pidió información sobre un seguro de vida, y registrá su próximo seguimiento.' : undefined}
          action={!search ? (
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nuevo contacto</Button>
          ) : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {filtered.map(contact => (
              <li key={contact.id}>
                <Link href={`/app/contactos/${contact.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <Avatar name={`${contact.first_name} ${contact.last_name}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_COLORS[contact.status]}`}>
                        {CONTACT_STATUS_LABELS[contact.status]}
                      </span>
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
