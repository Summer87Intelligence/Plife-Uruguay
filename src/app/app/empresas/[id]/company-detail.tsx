'use client'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ArrowLeft, Globe, Link2 as Linkedin, AtSign as Instagram, MapPin, Users, Plus, TrendingUp, Pencil, Target, UserCheck, AlertTriangle, Megaphone, CheckCircle2, ArrowRight, UserPlus, ShieldCheck, List, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Timeline } from '@/components/commercial/timeline'
import type { TimelineActivity } from '@/components/commercial/timeline'
import { ActivityForm } from '@/components/commercial/activity-form'
import { CompanyAIDialog } from './company-ai'
import { CompanyForm } from '../company-form'
import { ContactForm } from '../../contactos/contact-form'
import { OpportunityForm } from '../../oportunidades/opportunity-form'
import { SimpleBreadcrumb } from '@/components/navigation/simple-breadcrumb'
import { QuickActions } from '@/components/navigation/quick-actions'
import { EntitySummary } from '@/components/navigation/entity-summary'
import { DetailBackLink } from '@/components/navigation/detail-back-link'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS, OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/constants'
import { industryLabel } from '@/lib/industry-labels'
import { updateCompanyStatus, associateCompanyToCampaign, saveCompanyB2BSuggestions } from '@/domains/companies/actions'
import { formatDate } from '@/lib/utils'
import { CLOSED_STAGES } from '@/lib/constants'
import { calcularScoreB2B, nivelColor, nivelLabel } from '@/lib/b2b/scoring'
import { ICP_NOMBRES } from '@/lib/b2b/icp'
import { useRouter } from 'next/navigation'
import type { Profile, Company, Contact, Activity, Opportunity, AIExecutionRun } from '@/types/database'
import { EntityAIAnalysisCard } from '@/components/ia/entity-ai-analysis-card'

interface CompanyDetailProps {
  company: Company
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'position' | 'status'>[]
  activities: (TimelineActivity & Partial<Activity>)[]
  opportunities: Pick<Opportunity, 'id' | 'title' | 'stage' | 'type' | 'next_action' | 'next_action_date'>[]
  campaigns: { id: string; name: string }[]
  profile: Profile
  aiProfile?: { id: string; name: string } | null
  latestAiRun?: AIExecutionRun | null
}

const statusOptions = Object.entries(B2B_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function CompanyDetail({ company, contacts, activities, opportunities, campaigns, aiProfile, latestAiRun }: CompanyDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [savingScore, setSavingScore] = useState(false)

  const b2bScore = calcularScoreB2B(company)
  const proximoPaso = company.commercial_angle || b2bScore.proximoPaso
  const rubroLabel = industryLabel(company.industry)

  async function handleStatusChange(newStatus: string) {
    await updateCompanyStatus(company.id, newStatus)
    router.refresh()
  }

  async function handleCampaignChange(campaignId: string) {
    await associateCompanyToCampaign(company.id, campaignId || null)
    router.refresh()
  }

  async function handleApplyScore() {
    setSavingScore(true)
    await saveCompanyB2BSuggestions(company.id, { b2b_score: b2bScore.score })
    setSavingScore(false)
    startTransition(() => router.refresh())
  }

  const campaignOptions = [{ value: '', label: 'Sin campaña' }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]
  const currentCampaign = campaigns.find(c => c.id === company.campaign_id)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <DetailBackLink href="/app/empresas" label="Volver a empresas" />
        <SimpleBreadcrumb items={[
          { label: 'Empresas', href: '/app/empresas' },
          { label: company.name },
        ]} />
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-[#1B3A6B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {rubroLabel && <span className="text-sm text-gray-500">{rubroLabel}</span>}
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
              <Button variant="outline" size="sm"><TrendingUp className="h-4 w-4" />Nueva oportunidad</Button>
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

      <EntitySummary
        items={[
          { label: 'Rubro', value: rubroLabel },
          { label: 'Ciudad', value: company.location },
          { label: 'Potencial comercial', value: company.b2b_score != null ? `${company.b2b_score}/100` : null, highlight: true },
          { label: 'Próximo paso sugerido', value: proximoPaso },
          { label: 'Contactos', value: contacts.length },
          { label: 'Oportunidades', value: opportunities.length },
        ]}
      />

      <QuickActions
        actions={[
          { label: 'Agregar contacto', onClick: () => setContactOpen(true), icon: UserPlus },
          { label: 'Crear oportunidad', onClick: () => setOppOpen(true), icon: TrendingUp },
          ...(opportunities.length > 0 || company.name
            ? [{ label: 'Ver oportunidades', href: `/app/oportunidades?q=${encodeURIComponent(company.name)}`, icon: List }]
            : []),
          { label: 'Revisar mensaje', href: '/app/compliance', icon: ShieldCheck },
        ]}
      />

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent title="Nuevo contacto" description={`Agregar contacto en ${company.name}`}>
          <ContactForm
            companies={[{ id: company.id, name: company.name }]}
            initial={{ company_id: company.id }}
            onSuccess={() => setContactOpen(false)}
            onCancel={() => setContactOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Actividad comercial */}
      {(() => {
        const openOpps = opportunities.filter(o => !(CLOSED_STAGES as string[]).includes(o.stage))
        const oppConPaso = openOpps.find(o => o.next_action)
        if (openOpps.length === 0) return null

        let statusLabel = 'Sin próximo paso'
        let statusClasses = 'bg-gray-100 text-gray-500'
        if (oppConPaso) {
          if (!oppConPaso.next_action_date) {
            statusLabel = 'Sin fecha'; statusClasses = 'bg-blue-100 text-blue-700'
          } else {
            const today = new Date(); today.setHours(0, 0, 0, 0)
            const due = new Date(oppConPaso.next_action_date + 'T00:00:00')
            if (due < today) { statusLabel = 'Vencido'; statusClasses = 'bg-red-100 text-red-700' }
            else { statusLabel = 'Pendiente'; statusClasses = 'bg-yellow-100 text-yellow-700' }
          }
        }

        return (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" />Actividad comercial
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">
                  {openOpps.length} opp. {openOpps.length === 1 ? 'activa' : 'activas'}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
            {oppConPaso ? (
              <>
                <p className="text-sm font-medium text-gray-800">{oppConPaso.next_action}</p>
                {oppConPaso.next_action_date && (
                  <p className="text-xs text-gray-500 mt-0.5">Fecha: {formatDate(oppConPaso.next_action_date)}</p>
                )}
                <Link href={`/app/oportunidades/${oppConPaso.id}`} className="text-xs text-[#1B3A6B] hover:underline mt-1.5 inline-flex items-center gap-0.5">
                  {oppConPaso.title} <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">Las oportunidades activas no tienen próximo paso definido.</p>
            )}
          </div>
        )
      })()}

      {aiProfile && (
        <EntityAIAnalysisCard
          entityType="company"
          entityId={company.id}
          entityLabel={company.name}
          profileId={aiProfile.id}
          profileName={aiProfile.name}
          latestRun={latestAiRun}
        />
      )}

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
            <CardHeader><CardTitle>Estado comercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select label="Estado comercial" value={company.b2b_status} onValueChange={handleStatusChange} options={statusOptions} />
              {company.b2b_score != null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Potencial comercial</p>
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

          {/* B2B Intelligence */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#1B3A6B]" />Inteligencia B2B
                </CardTitle>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${nivelColor(b2bScore.nivel)}`}>
                  {b2bScore.score} — {nivelLabel(b2bScore.nivel)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Perfil de cliente detectado</p>
                <p className="text-sm font-medium text-[#1B3A6B]">{ICP_NOMBRES[b2bScore.icpSugerido]}</p>
              </div>
              {b2bScore.razonesPositivas.slice(0, 3).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />Fortalezas
                  </p>
                  <ul className="space-y-0.5">
                    {b2bScore.razonesPositivas.slice(0, 3).map((r, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-green-500 shrink-0">·</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {b2bScore.riesgos.slice(0, 2).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />Riesgos
                  </p>
                  <ul className="space-y-0.5">
                    {b2bScore.riesgos.slice(0, 2).map((r, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-orange-400 shrink-0">·</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="border-t border-gray-50 pt-2">
                <p className="text-[10px] font-semibold text-[#1B3A6B] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />Próximo paso
                </p>
                <p className="text-xs text-gray-700">{b2bScore.proximoPaso}</p>
              </div>
              {(company.b2b_score == null || Math.abs(b2bScore.score - company.b2b_score) >= 3) && (
                <button
                  disabled={savingScore}
                  onClick={handleApplyScore}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1B3A6B] px-3 py-2 text-xs font-medium text-white hover:bg-[#1B3A6B]/90 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {savingScore ? 'Guardando…' : `Aplicar potencial sugerido (${b2bScore.score})`}
                </button>
              )}
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
            <Card id="contactos-relacionados">
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
            <Card id="oportunidades-relacionadas">
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
