'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Globe, Link2 as Linkedin, AtSign as Instagram, MapPin, Users, Plus, TrendingUp, Pencil, Target, UserCheck, AlertTriangle, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Timeline } from '@/components/commercial/timeline'
import type { TimelineActivity } from '@/components/commercial/timeline'
import { ActivityForm } from '@/components/commercial/activity-form'
import { CompanyAIDialog } from './company-ai'
import { CompanyForm } from '../company-form'
import { OpportunityForm } from '../../oportunidades/opportunity-form'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS, OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/constants'
import { updateCompanyStatus, associateCompanyToCampaign } from '@/domains/companies/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Company, Contact, Activity, Opportunity } from '@/types/database'

interface CompanyDetailProps {
  company: Company
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'position' | 'status'>[]
  activities: (TimelineActivity & Partial<Activity>)[]
  opportunities: Pick<Opportunity, 'id' | 'title' | 'stage' | 'type' | 'next_action' | 'next_action_date'>[]
  campaigns: { id: string; name: string }[]
  profile: Profile
}

const statusOptions = Object.entries(B2B_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function CompanyDetail({ company, contacts, activities, opportunities, campaigns }: CompanyDetailProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)

  async function handleStatusChange(newStatus: string) {
    await updateCompanyStatus(company.id, newStatus)
    router.refresh()
  }

  async function handleCampaignChange(campaignId: string) {
    await associateCompanyToCampaign(company.id, campaignId || null)
    router.refresh()
  }

  const campaignOptions = [{ value: '', label: 'Sin campaña' }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]
  const currentCampaign = campaigns.find(c => c.id === company.campaign_id)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/app/empresas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-[#1B3A6B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {company.industry && <span className="text-sm text-gray-500">{company.industry}</span>}
                {company.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-400"><MapPin className="h-3 w-3" />{company.location}</span>
                )}
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[company.b2b_status]}`}>
                  {B2B_STATUS_LABELS[company.b2b_status]}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <CompanyAIDialog company={company} />
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Pencil className="h-4 w-4" />Editar</Button>
            </DialogTrigger>
            <DialogContent title="Editar empresa" description="Actualizá los datos y la inteligencia comercial">
              <CompanyForm
                mode="edit"
                companyId={company.id}
                campaigns={campaigns}
                initial={{
                  name: company.name,
                  industry: company.industry ?? '',
                  website: company.website ?? '',
                  linkedin_url: company.linkedin_url ?? '',
                  instagram_url: company.instagram_url ?? '',
                  location: company.location ?? '',
                  estimated_size: company.estimated_size ?? '',
                  estimated_employees: company.estimated_employees ?? undefined,
                  source: company.source ?? '',
                  b2b_score: company.b2b_score ?? undefined,
                  b2b_status: company.b2b_status,
                  commercial_angle: company.commercial_angle ?? '',
                  ideal_contact: company.ideal_contact ?? '',
                  risk_notes: company.risk_notes ?? '',
                  opportunity_detected: company.opportunity_detected ?? '',
                  notes: company.notes ?? '',
                  campaign_id: company.campaign_id ?? '',
                }}
                onSuccess={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={oppOpen} onOpenChange={setOppOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><TrendingUp className="h-4 w-4" />Crear oportunidad</Button>
            </DialogTrigger>
            <DialogContent title="Nueva oportunidad B2B" description="Generá una oportunidad desde esta empresa">
              <OpportunityForm companyId={company.id} campaignId={company.campaign_id ?? undefined} defaultType="b2b" onSuccess={() => setOppOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Registrar actividad</Button>
            </DialogTrigger>
            <DialogContent title="Registrar actividad" description="Documentá interacciones con la empresa">
              <ActivityForm companyId={company.id} onSuccess={() => setActivityOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Por qué importa — strip de inteligencia */}
      {(company.opportunity_detected || company.commercial_angle || company.ideal_contact) && (
        <div className="rounded-xl border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {company.opportunity_detected && (
            <div>
              <p className="text-[10px] font-semibold text-[#1B3A6B] uppercase tracking-wider mb-1">Oportunidad detectada</p>
              <p className="text-sm text-gray-800">{company.opportunity_detected}</p>
            </div>
          )}
          {company.commercial_angle && (
            <div>
              <p className="text-[10px] font-semibold text-[#1B3A6B] uppercase tracking-wider mb-1">Ángulo comercial</p>
              <p className="text-sm text-gray-800">{company.commercial_angle}</p>
            </div>
          )}
          {company.ideal_contact && (
            <div>
              <p className="text-[10px] font-semibold text-[#1B3A6B] uppercase tracking-wider mb-1">Contacto ideal</p>
              <p className="text-sm text-gray-800">{company.ideal_contact}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Estado y prioridad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select label="Estado B2B" value={company.b2b_status} onValueChange={handleStatusChange} options={statusOptions} />
              {company.b2b_score != null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Score B2B</p>
                    <span className="text-sm font-bold text-[#1B3A6B]">{company.b2b_score}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#1B3A6B] h-2 rounded-full" style={{ width: `${company.b2b_score}%` }} />
                  </div>
                </div>
              )}
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Megaphone className="h-3 w-3" />Campaña</p>
                <Select value={company.campaign_id ?? ''} onValueChange={handleCampaignChange} options={campaignOptions} placeholder="Sin campaña" />
                {currentCampaign && (
                  <Link href={`/app/campanas/${currentCampaign.id}`} className="text-xs text-[#1B3A6B] hover:underline mt-1 inline-block">Ver campaña</Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Información</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {company.estimated_size && (
                <div className="flex items-center gap-2 text-sm text-gray-700"><Users className="h-4 w-4 text-gray-400" />{company.estimated_size}</div>
              )}
              {company.estimated_employees && (
                <div className="flex items-center gap-2 text-sm text-gray-700"><Users className="h-4 w-4 text-gray-400" />{company.estimated_employees} empleados estimados</div>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline"><Globe className="h-4 w-4" />Sitio web</a>
              )}
              {company.linkedin_url && (
                <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline"><Linkedin className="h-4 w-4" />LinkedIn</a>
              )}
              {company.instagram_url && (
                <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline"><Instagram className="h-4 w-4" />Instagram</a>
              )}
              {!company.estimated_size && !company.estimated_employees && !company.website && !company.linkedin_url && !company.instagram_url && (
                <p className="text-sm text-gray-400">Sin información adicional cargada</p>
              )}
            </CardContent>
          </Card>

          {company.risk_notes && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" />Riesgo / observaciones</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-700">{company.risk_notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Inteligencia comercial: por qué importa */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-[#1B3A6B]" />Inteligencia comercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Oportunidad detectada</p>
                {company.opportunity_detected
                  ? <p className="text-sm text-gray-700">{company.opportunity_detected}</p>
                  : <p className="text-sm text-gray-400 italic">Sin oportunidad detectada. Ej: posible seguro colectivo para sus empleados.</p>}
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Ángulo comercial</p>
                {company.commercial_angle
                  ? <p className="text-sm text-gray-700">{company.commercial_angle}</p>
                  : <p className="text-sm text-gray-400 italic">Sin ángulo definido. ¿Por qué les conviene y cómo abrir la conversación?</p>}
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><UserCheck className="h-3 w-3" />Contacto ideal</p>
                {company.ideal_contact
                  ? <p className="text-sm text-gray-700">{company.ideal_contact}</p>
                  : <p className="text-sm text-gray-400 italic">Sin definir. ¿Quién es la persona clave a contactar? (dueño, RRHH, CFO...)</p>}
              </div>
            </CardContent>
          </Card>

          {contacts.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Contactos ({contacts.length})</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contacts.map(c => (
                    <li key={c.id}>
                      <Link href={`/app/contactos/${c.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                          {c.position && <p className="text-xs text-gray-400">{c.position}</p>}
                        </div>
                        <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_COLORS[c.status]}`}>
                          {CONTACT_STATUS_LABELS[c.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {opportunities.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Oportunidades ({opportunities.length})</CardTitle></CardHeader>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actividades</CardTitle>
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
