'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Globe, Link2 as Linkedin, MapPin, Users, Bot, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS, OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS } from '@/lib/constants'
import { formatRelativeDate } from '@/lib/utils'
import { updateCompanyStatus } from '@/domains/companies/actions'
import { useRouter } from 'next/navigation'
import type { Profile, Company, Contact, Activity, Opportunity, CompanyB2BStatus } from '@/types/database'

interface CompanyDetailProps {
  company: Company
  contacts: Pick<Contact, 'id' | 'first_name' | 'last_name' | 'position' | 'status'>[]
  activities: Activity[]
  opportunities: Pick<Opportunity, 'id' | 'title' | 'stage' | 'type'>[]
  profile: Profile
}

const statusOptions = Object.entries(B2B_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

export function CompanyDetail({ company, contacts, activities, opportunities, profile }: CompanyDetailProps) {
  const router = useRouter()

  async function handleStatusChange(newStatus: string) {
    await updateCompanyStatus(company.id, newStatus)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/app/empresas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#1B3A6B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {company.industry && <span className="text-sm text-gray-500">{company.industry}</span>}
                {company.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />{company.location}
                  </span>
                )}
                {company.b2b_score != null && (
                  <span className="text-sm font-bold text-[#1B3A6B]">Score: {company.b2b_score}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/copiloto?company_id=${company.id}&company_name=${encodeURIComponent(company.name)}&mode=b2b`}>
            <Button variant="outline" size="sm"><Bot className="h-4 w-4" />Analizar con IA</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Estado B2B</CardTitle></CardHeader>
            <CardContent>
              <Select
                value={company.b2b_status}
                onValueChange={handleStatusChange}
                options={statusOptions}
              />
              {company.b2b_score != null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Score B2B</p>
                    <span className="text-sm font-bold text-[#1B3A6B]">{company.b2b_score}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#1B3A6B] h-2 rounded-full"
                      style={{ width: `${company.b2b_score}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Información</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {company.estimated_employees && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  {company.estimated_employees} empleados estimados
                </div>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline">
                  <Globe className="h-4 w-4" />Sitio web
                </a>
              )}
              {company.linkedin_url && (
                <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#1B3A6B] hover:underline">
                  <Linkedin className="h-4 w-4" />LinkedIn
                </a>
              )}
            </CardContent>
          </Card>

          {company.opportunity_detected && (
            <Card>
              <CardHeader><CardTitle>Oportunidad detectada</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{company.opportunity_detected}</p>
                {company.commercial_angle && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Ángulo comercial</p>
                    <p className="text-sm text-gray-700">{company.commercial_angle}</p>
                  </div>
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

        <div className="lg:col-span-2 space-y-4">
          {contacts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contactos ({contacts.length})</CardTitle>
                </div>
              </CardHeader>
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

          <Card>
            <CardHeader><CardTitle>Actividades recientes</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin actividades registradas</p>
              ) : (
                <ul className="space-y-3">
                  {activities.map(act => (
                    <li key={act.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                      <div className="h-7 w-7 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-[#1B3A6B]">{act.type.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{act.title}</p>
                        {act.outcome && <p className="text-xs text-gray-500 mt-0.5">{act.outcome}</p>}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatRelativeDate(act.created_at)}</span>
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
