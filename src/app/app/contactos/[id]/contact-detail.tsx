'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Link2 as Linkedin, Building2, Plus, Calendar, Pencil, TrendingUp, ShieldCheck, ShieldAlert, CircleUser as UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Timeline } from '@/components/commercial/timeline'
import type { TimelineActivity } from '@/components/commercial/timeline'
import { ActivityForm } from '@/components/commercial/activity-form'
import { AIAssistantDialog } from '@/components/commercial/ai-assistant-dialog'
import { runCopilot, saveAIAsActivity } from '@/domains/ai/actions'
import { ContactForm } from '../contact-form'
import { OpportunityForm } from '../../oportunidades/opportunity-form'
import {
  CONTACT_STATUS_LABELS,
  OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS,
} from '@/lib/constants'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { updateContact } from '@/domains/contacts/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Contact, Note, Opportunity, ContactStatus } from '@/types/database'

interface ContactDetailProps {
  contact: Contact & {
    company?: { id: string; name: string; industry?: string | null } | null
    assigned_profile?: { id: string; full_name: string } | null
  }
  activities: TimelineActivity[]
  notes: Note[]
  opportunities: Pick<Opportunity, 'id' | 'title' | 'stage' | 'type'>[]
  companies: { id: string; name: string }[]
  profile: Profile
}

const statusOptions = Object.entries(CONTACT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const INTEREST_LABELS: Record<string, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', muy_alto: 'Muy alto' }

export function ContactDetail({ contact, activities, opportunities, companies }: ContactDetailProps) {
  const router = useRouter()
  const [activityOpen, setActivityOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)
  const [nextAction, setNextAction] = useState(contact.next_action ?? '')
  const [nextActionDate, setNextActionDate] = useState(contact.next_action_date ?? '')
  const [savingAction, setSavingAction] = useState(false)

  async function handleStatusChange(newStatus: string) {
    await updateContact(contact.id, { status: newStatus as ContactStatus })
    router.refresh()
  }

  async function handleSaveNextAction() {
    setSavingAction(true)
    await updateContact(contact.id, { next_action: nextAction, next_action_date: nextActionDate })
    setSavingAction(false)
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
          <AIAssistantDialog
            triggerLabel="Preparar con IA"
            title="Copiloto — contacto"
            description={`${contact.first_name} ${contact.last_name}`}
            actions={[
              { id: 'preparar', label: 'Preparar contacto', run: () => runCopilot({ helpType: 'preparar_contacto', contactId: contact.id }) },
              { id: 'seguimiento', label: 'Mensaje de seguimiento', run: () => runCopilot({ helpType: 'seguimiento', contactId: contact.id }) },
              { id: 'resumir', label: 'Resumir notas', run: () => runCopilot({ helpType: 'resumir_notas', contactId: contact.id }) },
              { id: 'proximo', label: 'Próximo paso', run: () => runCopilot({ helpType: 'proximo_paso', contactId: contact.id }) },
            ]}
            onSaveActivity={async (content) => { await saveAIAsActivity({ title: 'Copiloto IA', content, contactId: contact.id }); router.refresh() }}
          />
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Pencil className="h-4 w-4" />Editar</Button>
            </DialogTrigger>
            <DialogContent title="Editar contacto" description="Actualizá los datos comerciales del contacto">
              <ContactForm
                mode="edit"
                contactId={contact.id}
                companies={companies}
                initial={{
                  first_name: contact.first_name,
                  last_name: contact.last_name,
                  email: contact.email ?? '',
                  phone: contact.phone ?? '',
                  position: contact.position ?? '',
                  source: contact.source ?? '',
                  status: contact.status,
                  interest_level: contact.interest_level ?? 'medio',
                  detected_need: contact.detected_need ?? '',
                  next_action: contact.next_action ?? '',
                  next_action_date: contact.next_action_date ?? '',
                  notes: contact.notes ?? '',
                  data_consent: contact.data_consent,
                  data_origin: contact.data_origin ?? 'manual',
                  company_id: contact.company_id ?? '',
                }}
                onSuccess={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={oppOpen} onOpenChange={setOppOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><TrendingUp className="h-4 w-4" />Nueva oportunidad</Button>
            </DialogTrigger>
            <DialogContent title="Nueva oportunidad" description="Generá una oportunidad a partir de este contacto">
              <OpportunityForm
                contactId={contact.id}
                companyId={contact.company_id ?? undefined}
                onSuccess={() => setOppOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Registrar actividad</Button>
            </DialogTrigger>
            <DialogContent title="Registrar actividad" description="Documentá qué pasó con este contacto">
              <ActivityForm contactId={contact.id} onSuccess={() => setActivityOpen(false)} />
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
              <Select label="Estado" value={contact.status} onValueChange={handleStatusChange} options={statusOptions} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Nivel de interés</p>
                  <p className="text-sm font-medium text-gray-700">{contact.interest_level ? INTEREST_LABELS[contact.interest_level] : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Última interacción</p>
                  <p className="text-sm font-medium text-gray-700">{contact.last_interaction_at ? formatRelativeDate(contact.last_interaction_at) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <UserCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{contact.assigned_profile?.full_name ?? 'Sin asesor asignado'}</span>
              </div>
              {contact.detected_need && (
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-500 mb-1">Necesidad detectada</p>
                  <p className="text-sm text-gray-700">{contact.detected_need}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Datos de contacto</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Phone className="h-4 w-4 text-gray-400" />{contact.phone}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Mail className="h-4 w-4 text-gray-400" />{contact.email}
                </a>
              ) : null}
              {contact.linkedin_url ? (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1B3A6B]">
                  <Linkedin className="h-4 w-4 text-gray-400" />LinkedIn
                </a>
              ) : null}
              {!contact.phone && !contact.email && !contact.linkedin_url && (
                <p className="text-sm text-gray-400">Sin datos de contacto cargados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2">
              {contact.data_consent ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <ShieldAlert className="h-4 w-4 text-yellow-500" />}
              Origen y consentimiento
            </CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Origen del dato</span>
                <span className="text-sm text-gray-700 capitalize">{contact.data_origin ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Consentimiento</span>
                <span className={`text-sm font-medium ${contact.data_consent ? 'text-green-600' : 'text-yellow-600'}`}>
                  {contact.data_consent ? 'Otorgado' : 'Pendiente'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#1B3A6B]" />Próxima acción</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input label="Próximo paso" value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="Qué hay que hacer a continuación..." />
              <Input label="Fecha" type="date" value={nextActionDate} onChange={e => setNextActionDate(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" loading={savingAction} onClick={handleSaveNextAction}>Guardar próxima acción</Button>
              {contact.next_action_date && (
                <p className="text-xs text-gray-400">Agendado: {formatDate(contact.next_action_date)}</p>
              )}
            </CardContent>
          </Card>

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
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de actividades</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActivityOpen(true)}><Plus className="h-4 w-4" />Nueva</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Timeline activities={activities} emptyText="Sin actividades registradas" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
