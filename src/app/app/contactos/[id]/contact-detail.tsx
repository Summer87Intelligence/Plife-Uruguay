'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Link2 as Linkedin, Building2, Plus, Bot, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS,
  OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS,
  ACTIVITY_TYPE_LABELS,
} from '@/lib/constants'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { updateContact, addActivity } from '@/domains/contacts/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Contact, Activity, Note, Opportunity, ContactStatus } from '@/types/database'

interface ContactDetailProps {
  contact: Contact & { company?: { id: string; name: string; industry?: string | null } | null }
  activities: Activity[]
  notes: Note[]
  opportunities: Pick<Opportunity, 'id' | 'title' | 'stage' | 'type'>[]
  profile: Profile
}

const statusOptions = Object.entries(CONTACT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const activityTypeOptions = Object.entries(ACTIVITY_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function ContactDetail({ contact, activities, notes, opportunities, profile }: ContactDetailProps) {
  const router = useRouter()
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityForm, setActivityForm] = useState({ type: 'llamada', title: '', description: '', outcome: '' })
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(newStatus: string) {
    await updateContact(contact.id, { status: newStatus as ContactStatus })
    router.refresh()
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await addActivity({ contact_id: contact.id, ...activityForm })
    setActivityOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/app/contactos">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar name={`${contact.first_name} ${contact.last_name}`} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contact.first_name} {contact.last_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {contact.position && <span className="text-sm text-gray-500">{contact.position}</span>}
                {contact.company && (
                  <Link href={`/app/empresas/${contact.company.id}`} className="flex items-center gap-1 text-sm text-[#1B3A6B] hover:underline">
                    <Building2 className="h-3 w-3" />{contact.company.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/app/copiloto?contact_id=${contact.id}&contact_name=${encodeURIComponent(contact.first_name + ' ' + contact.last_name)}`}>
            <Button variant="outline" size="sm"><Bot className="h-4 w-4" />Preparar con IA</Button>
          </Link>
          <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Registrar actividad</Button>
            </DialogTrigger>
            <DialogContent title="Registrar actividad" description="Documentá qué pasó con este contacto">
              <form onSubmit={handleAddActivity} className="space-y-4">
                <Select label="Tipo" value={activityForm.type} onValueChange={v => setActivityForm(p => ({ ...p, type: v }))} options={activityTypeOptions} />
                <Input label="Título *" value={activityForm.title} onChange={e => setActivityForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ej: Llamada de seguimiento" />
                <Textarea label="Descripción" value={activityForm.description} onChange={e => setActivityForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                <Textarea label="Resultado / Outcome" value={activityForm.outcome} onChange={e => setActivityForm(p => ({ ...p, outcome: e.target.value }))} rows={2} placeholder="Qué pasó, cómo reaccionó..." />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>Guardar actividad</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Estado comercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Estado"
                value={contact.status}
                onValueChange={handleStatusChange}
                options={statusOptions}
              />
              {contact.interest_level && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nivel de interés</p>
                  <span className="capitalize text-sm font-medium text-gray-700">{contact.interest_level.replace('_', ' ')}</span>
                </div>
              )}
              {contact.detected_need && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Necesidad detectada</p>
                  <p className="text-sm text-gray-700">{contact.detected_need}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Datos de contacto</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Phone className="h-4 w-4 text-gray-400" />{contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Mail className="h-4 w-4 text-gray-400" />{contact.email}
                </a>
              )}
              {contact.linkedin_url && (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Linkedin className="h-4 w-4 text-gray-400" />LinkedIn
                </a>
              )}
            </CardContent>
          </Card>

          {contact.next_action && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#1B3A6B]" />Próxima acción</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{contact.next_action}</p>
                {contact.next_action_date && (
                  <p className="text-xs text-gray-400 mt-1">{formatDate(contact.next_action_date)}</p>
                )}
              </CardContent>
            </Card>
          )}

          {opportunities.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Oportunidades</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {opportunities.map(opp => (
                    <li key={opp.id}>
                      <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
                        <p className="text-sm text-gray-700 truncate">{opp.title}</p>
                        <span className={`ml-2 shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                          {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline de actividades */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Historial de actividades</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Sin actividades registradas</p>
                  <p className="text-xs mt-1">Registrá llamadas, reuniones y mensajes</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activities.map(act => (
                    <li key={act.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-[#1B3A6B]">{act.type.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 w-px bg-gray-100 mt-2" />
                      </div>
                      <div className="pb-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{act.title}</p>
                          <span className="text-xs text-gray-400 shrink-0 ml-2">{formatRelativeDate(act.created_at)}</span>
                        </div>
                        {act.description && <p className="text-xs text-gray-500 mt-1">{act.description}</p>}
                        {act.outcome && (
                          <div className="mt-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                            <p className="text-xs text-green-800">{act.outcome}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
