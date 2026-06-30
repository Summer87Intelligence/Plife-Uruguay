import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import {
  ArrowLeft, Megaphone, Target, Users, MessageSquare, PhoneCall,
  ShieldQuestion, Building2, TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS, CAMPAIGN_TYPE_LABELS,
  B2B_STATUS_LABELS, B2B_STATUS_COLORS,
  OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_COLORS,
} from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export default async function CampanaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { data: campaign },
    { data: companies },
    { data: opportunities },
  ] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('companies').select('id, name, industry, b2b_status').eq('campaign_id', id).is('deleted_at', null).order('name'),
    supabase.from('opportunities').select('id, title, stage, type').eq('campaign_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
  ])

  if (!campaign) notFound()

  const linkedCompanies = companies ?? []
  const linkedOpportunities = opportunities ?? []

  const metrics = [
    { label: 'Objetivos', value: campaign.total_targets },
    { label: 'Contactados', value: campaign.total_contacted },
    { label: 'Respuestas', value: campaign.total_responses },
    { label: 'Reuniones', value: campaign.total_meetings },
    { label: 'Convertidos', value: campaign.total_converted },
  ]
  const conversionRate = campaign.total_targets > 0
    ? Math.round((campaign.total_converted / campaign.total_targets) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/app/campanas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
              <Megaphone className="h-6 w-6 text-[#1B3A6B]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}>
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </span>
                <span className="text-sm text-gray-500">{CAMPAIGN_TYPE_LABELS[campaign.type]}</span>
                {campaign.start_date && (
                  <span className="text-xs text-gray-400">
                    {formatDate(campaign.start_date)}
                    {campaign.end_date ? ` → ${formatDate(campaign.end_date)}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Desempeño de la campaña</CardTitle>
            <span className="text-sm font-bold text-[#1B3A6B]">{conversionRate}% conversión</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal: estrategia */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-[#1B3A6B]" />Estrategia comercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Objetivo" value={campaign.objective} placeholder="Sin objetivo definido. Ej: generar 20 reuniones con dueños de pymes en 60 días." />
              <Field label="Segmento objetivo" value={campaign.target_segment} placeholder="Sin segmento definido. Ej: pymes de 10 a 50 empleados en Montevideo." />
              <Field label="Cliente ideal (ICP)" value={campaign.icp_description} placeholder="Sin ICP definido. Describí quién es el cliente ideal y sus señales de compra." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#1B3A6B]" />Mensaje inicial</CardTitle></CardHeader>
            <CardContent>
              {campaign.initial_message ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg bg-gray-50 p-4">{campaign.initial_message}</p>
              ) : (
                <EmptyHint text="Todavía no se definió el mensaje inicial de apertura para esta campaña." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-[#1B3A6B]" />Guion de llamada</CardTitle></CardHeader>
            <CardContent>
              {campaign.call_script ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg bg-gray-50 p-4">{campaign.call_script}</p>
              ) : (
                <EmptyHint text="Sin guion de llamada cargado. Sirve para estandarizar el discurso del equipo comercial." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4 text-[#1B3A6B]" />Objeciones esperadas</CardTitle></CardHeader>
            <CardContent>
              {campaign.expected_objections && campaign.expected_objections.length > 0 ? (
                <ul className="space-y-2">
                  {campaign.expected_objections.map((obj, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-[#C9A84C] font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyHint text="No se anticiparon objeciones. Ej: “ya tengo seguro”, “es caro”, “lo voy a pensar”." />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral: asociados */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[#1B3A6B]" />Empresas asociadas ({linkedCompanies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedCompanies.length === 0 ? (
                <EmptyHint text="Aún no hay empresas vinculadas a esta campaña." />
              ) : (
                <ul className="space-y-2">
                  {linkedCompanies.map(co => (
                    <li key={co.id}>
                      <Link href={`/app/empresas/${co.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{co.name}</p>
                          {co.industry && <p className="text-xs text-gray-400">{co.industry}</p>}
                        </div>
                        <span className={`ml-2 shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[co.b2b_status]}`}>
                          {B2B_STATUS_LABELS[co.b2b_status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#1B3A6B]" />Oportunidades ({linkedOpportunities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedOpportunities.length === 0 ? (
                <EmptyHint text="Todavía no se generaron oportunidades desde esta campaña." />
              ) : (
                <ul className="space-y-2">
                  {linkedOpportunities.map(opp => (
                    <li key={opp.id}>
                      <Link href={`/app/oportunidades/${opp.id}`} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50">
                        <p className="text-sm text-gray-700 truncate">{opp.title}</p>
                        <span className={`ml-2 shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPPORTUNITY_STAGE_COLORS[opp.stage]}`}>
                          {OPPORTUNITY_STAGE_LABELS[opp.stage]}
                        </span>
                      </Link>
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

function Field({ label, value, placeholder }: { label: string; value: string | null; placeholder: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {value ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">{placeholder}</p>
      )}
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 text-center py-6">{text}</p>
}
