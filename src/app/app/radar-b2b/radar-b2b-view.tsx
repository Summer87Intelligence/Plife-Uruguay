'use client'
import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Radar, Plus, Search, Building2, TrendingUp, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, ArrowRight, Megaphone, Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchNoResults } from '@/components/navigation/search-no-results'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { B2B_STATUS_LABELS, B2B_STATUS_COLORS } from '@/lib/constants'
import { CompanyForm } from '../empresas/company-form'
import { OpportunityForm } from '../oportunidades/opportunity-form'
import { calcularScoreB2B, nivelColor, nivelLabel } from '@/lib/b2b/scoring'
import { ICP_NOMBRES } from '@/lib/b2b/icp'
import { saveCompanyB2BSuggestions, associateCompanyToCampaign } from '@/domains/companies/actions'
import { SectionGuideCard } from '@/components/guidance/section-guide-card'
import type { Profile, Company } from '@/types/database'
import type { ICPKey } from '@/lib/b2b/icp'
import type { CampaignType } from '@/types/database'

interface RadarB2BViewProps {
  companies: Company[]
  campaigns: { id: string; name: string; type: string }[]
  profile: Profile
}

const ALL = 'all'

export function RadarB2BView({ companies, campaigns, profile }: RadarB2BViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [newCompanyOpen, setNewCompanyOpen] = useState(false)
  const [oppCompanyId, setOppCompanyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterICP, setFilterICP] = useState<string>(ALL)
  const [filterNivel, setFilterNivel] = useState<string>(ALL)
  const [filterStatus, setFilterStatus] = useState<string>(ALL)

  // Pre-compute scores for all companies
  const scoredCompanies = useMemo(() =>
    companies.map(co => ({ co, result: calcularScoreB2B(co) })),
    [companies]
  )

  // Unique ICP values present in the list
  const icpOptions = useMemo(() => {
    const seen = new Set<string>()
    scoredCompanies.forEach(({ result }) => seen.add(result.icpSugerido))
    return Array.from(seen).sort()
  }, [scoredCompanies])

  const filtered = useMemo(() => {
    return scoredCompanies
      .filter(({ co, result }) => {
        if (filterICP !== ALL && result.icpSugerido !== filterICP) return false
        if (filterNivel !== ALL && result.nivel !== filterNivel) return false
        if (filterStatus !== ALL && co.b2b_status !== filterStatus) return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !co.name.toLowerCase().includes(q) &&
            !(co.industry?.toLowerCase().includes(q) ?? false) &&
            !(co.commercial_angle?.toLowerCase().includes(q) ?? false) &&
            !(co.opportunity_detected?.toLowerCase().includes(q) ?? false)
          ) return false
        }
        return true
      })
      .sort((a, b) => b.result.score - a.result.score)
  }, [scoredCompanies, filterICP, filterNivel, filterStatus, search])

  const stats = useMemo(() => ({
    muyAlto: scoredCompanies.filter(({ result }) => result.nivel === 'muy_alto').length,
    alto: scoredCompanies.filter(({ result }) => result.nivel === 'alto').length,
    medio: scoredCompanies.filter(({ result }) => result.nivel === 'medio').length,
    bajo: scoredCompanies.filter(({ result }) => result.nivel === 'bajo').length,
  }), [scoredCompanies])

  const topPriority = stats.muyAlto + stats.alto

  async function handleApplyScore(co: Company, result: ReturnType<typeof calcularScoreB2B>) {
    setSavingId(co.id)
    await saveCompanyB2BSuggestions(co.id, {
      b2b_score: result.score,
      commercial_angle: result.razonesPositivas[0] ? co.commercial_angle ?? result.razonesPositivas[0] : co.commercial_angle,
    })
    setSavingId(null)
    startTransition(() => router.refresh())
  }

  async function handleAssociateCampaign(coId: string, campaignId: string) {
    setSavingId(coId)
    await associateCompanyToCampaign(coId, campaignId || null)
    setSavingId(null)
    startTransition(() => router.refresh())
  }

  const uniqueStatuses = useMemo(() => {
    const seen = new Set(companies.map(c => c.b2b_status))
    return Array.from(seen)
  }, [companies])

  // Map CampaignType to campaign id (best match)
  function findCampaignId(type: CampaignType): string | undefined {
    return campaigns.find(c => c.type === type)?.id
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Radar className="h-5 w-5 text-[#1B3A6B]" />
            Radar B2B
          </h1>
          <p className="text-sm text-gray-500">Detectá empresas con potencial comercial y convertí señales en oportunidades de seguimiento.</p>
          <p className="text-xs text-gray-400 mt-0.5">El radar funciona mejor cuando hay empresas cargadas con rubro, tamaño y señales comerciales.</p>
        </div>
        <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
          <Button onClick={() => setNewCompanyOpen(true)}><Plus className="h-4 w-4" /> Nueva empresa</Button>
          <DialogContent title="Nueva empresa" description="Registrá una empresa para priorizarla en el radar">
            <CompanyForm onSuccess={() => { setNewCompanyOpen(false); router.refresh() }} onCancel={() => setNewCompanyOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-100 bg-green-50 p-3">
          <p className="text-[11px] font-medium text-green-700">Potencial muy alto</p>
          <p className="text-2xl font-bold text-green-800 mt-0.5">{stats.muyAlto}</p>
          <p className="text-[10px] text-green-600">Potencial 80+</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50/60 p-3">
          <p className="text-[11px] font-medium text-green-700">Potencial alto</p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">{stats.alto}</p>
          <p className="text-[10px] text-green-500">Potencial 60-79</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3">
          <p className="text-[11px] font-medium text-yellow-700">Potencial medio</p>
          <p className="text-2xl font-bold text-yellow-800 mt-0.5">{stats.medio}</p>
          <p className="text-[10px] text-yellow-600">Potencial 40-59</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-600">Potencial bajo</p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.bajo}</p>
          <p className="text-[10px] text-gray-400">Potencial &lt;40</p>
        </div>
      </div>

      {topPriority > 0 && (
        <div className="rounded-xl border border-[#1B3A6B]/10 bg-[#1B3A6B]/5 px-4 py-3">
          <p className="text-xs text-[#1B3A6B]">
            <strong>{topPriority} empresa{topPriority > 1 ? 's' : ''} con potencial alto o muy alto</strong> — expandí la fila para ver razones, riesgos y el próximo paso sugerido.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa, rubro o señal comercial"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>
        <select
          value={filterNivel}
          onChange={e => setFilterNivel(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value={ALL}>Todo el potencial</option>
          <option value="muy_alto">Potencial muy alto (80+)</option>
          <option value="alto">Potencial alto (60-79)</option>
          <option value="medio">Potencial medio (40-59)</option>
          <option value="bajo">Potencial bajo (&lt;40)</option>
        </select>
        <select
          value={filterICP}
          onChange={e => setFilterICP(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value={ALL}>Todos los perfiles de cliente</option>
          {icpOptions.map(icp => (
            <option key={icp} value={icp}>{ICP_NOMBRES[icp as ICPKey]}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          <option value={ALL}>Todos los estados comerciales</option>
          {uniqueStatuses.map(s => (
            <option key={s} value={s}>{B2B_STATUS_LABELS[s]}</option>
          ))}
        </select>
        {(filterICP !== ALL || filterNivel !== ALL || filterStatus !== ALL || search) && (
          <button
            onClick={() => { setFilterICP(ALL); setFilterNivel(ALL); setFilterStatus(ALL); setSearch('') }}
            className="h-9 px-3 text-sm text-gray-400 hover:text-gray-700 rounded-lg border border-gray-200 bg-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Dialog crear oportunidad */}
      <Dialog open={!!oppCompanyId} onOpenChange={v => { if (!v) setOppCompanyId(null) }}>
        <DialogContent title="Nueva oportunidad" description="Asociada a esta empresa">
          {oppCompanyId && (
            <OpportunityForm
              companyId={oppCompanyId}
              defaultType="b2b"
              onSuccess={() => { setOppCompanyId(null); router.refresh() }}
              onCancel={() => setOppCompanyId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <>
          <EmptyState
            icon={Radar}
            title={search || filterICP !== ALL || filterNivel !== ALL || filterStatus !== ALL ? 'No encontramos resultados para esta búsqueda.' : 'El Radar B2B todavía no tiene empresas para priorizar'}
            description={search || filterICP !== ALL || filterNivel !== ALL || filterStatus !== ALL ? undefined : 'Cargá empresas para que el sistema pueda ayudarte a detectar potencial comercial.'}
            action={
              search || filterICP !== ALL || filterNivel !== ALL || filterStatus !== ALL
                ? <SearchNoResults
                    onClearSearch={() => setSearch('')}
                    onClearFilters={() => { setFilterICP(ALL); setFilterNivel(ALL); setFilterStatus(ALL); setSearch('') }}
                    hasFilters={filterICP !== ALL || filterNivel !== ALL || filterStatus !== ALL}
                  />
                : <Button onClick={() => setNewCompanyOpen(true)}><Plus className="h-4 w-4" />Nueva empresa</Button>
            }
          />
          {companies.length === 0 && (
            <SectionGuideCard
              title="¿Por qué usar el Radar B2B?"
              description="El Radar asigna un score automático a cada empresa según su rubro, tamaño y señales comerciales. Priorizá las de mayor potencial y creá oportunidades desde acá."
              primaryActionLabel="Ver empresas"
              primaryActionHref="/app/empresas"
              nextStep="También podés ver oportunidades activas"
            />
          )}
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{filtered.length} empresa{filtered.length !== 1 ? 's' : ''}{filtered.length < scoredCompanies.length ? ` de ${scoredCompanies.length}` : ''}</p>
          {filtered.map(({ co, result }, idx) => {
            const isExpanded = expandedId === co.id
            const scoreDiff = co.b2b_score != null ? result.score - co.b2b_score : null
            const suggestedCampaignId = findCampaignId(result.campañaSugerida)
            const alreadyHasCampaign = !!co.campaign_id

            return (
              <div key={co.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                {/* Main row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Rank */}
                  <span className="text-xs font-bold text-gray-300 w-5 shrink-0 text-center">{idx + 1}</span>

                  {/* Score badge */}
                  <div className="shrink-0 text-center w-12">
                    <div className={`inline-flex items-center justify-center h-11 w-11 rounded-full font-bold text-sm ${nivelColor(result.nivel)}`}>
                      {result.score}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5">{nivelLabel(result.nivel)}</p>
                  </div>

                  {/* Company info */}
                  <Link href={`/app/empresas/${co.id}`} className="flex-1 min-w-0 group">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B3A6B] transition-colors">{co.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${B2B_STATUS_COLORS[co.b2b_status]}`}>
                        {B2B_STATUS_LABELS[co.b2b_status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#1B3A6B] font-medium flex items-center gap-1">
                        <Target className="h-3 w-3" />Perfil: {ICP_NOMBRES[result.icpSugerido]}
                      </span>
                      {co.industry && <span className="text-xs text-gray-400">{co.industry}</span>}
                      {co.estimated_employees && <span className="text-xs text-gray-400">{co.estimated_employees} empleados</span>}
                    </div>
                    {co.b2b_score != null && scoreDiff !== null && Math.abs(scoreDiff) >= 5 && (
                      <p className="text-[10px] mt-0.5 text-gray-400">
                        Potencial guardado: {co.b2b_score} · Sugerido: {result.score}
                        <span className={`ml-1 font-medium ${scoreDiff > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                          ({scoreDiff > 0 ? '+' : ''}{scoreDiff})
                        </span>
                      </p>
                    )}
                  </Link>

                  {/* CTAs */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setOppCompanyId(co.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#1B3A6B]/20 bg-[#1B3A6B]/5 px-2.5 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/10 transition-colors"
                    >
                      <TrendingUp className="h-3 w-3" />
                      Nueva oportunidad
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : co.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      Análisis
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Positive reasons */}
                      <div>
                        <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />Fortalezas
                        </p>
                        <ul className="space-y-1">
                          {result.razonesPositivas.map((r, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5 shrink-0">·</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div>
                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />Riesgos
                        </p>
                        {result.riesgos.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Sin riesgos identificados</p>
                        ) : (
                          <ul className="space-y-1">
                            {result.riesgos.map((r, i) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-orange-400 mt-0.5 shrink-0">·</span>{r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Next step */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#1B3A6B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />Próximo paso
                        </p>
                        <p className="text-xs text-gray-700">{result.proximoPaso}</p>
                        {result.campañaSugerida && (
                          <p className="text-[10px] text-gray-400 mt-2">
                            Campaña recomendada: <span className="font-medium text-[#1B3A6B]">{result.campañaSugerida.replace(/_/g, ' ')}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      <button
                        disabled={savingId === co.id}
                        onClick={() => handleApplyScore(co, result)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3A6B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3A6B]/90 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {savingId === co.id ? 'Guardando…' : `Guardar potencial sugerido (${result.score})`}
                      </button>

                      {!alreadyHasCampaign && suggestedCampaignId && (
                        <button
                          disabled={savingId === co.id}
                          onClick={() => handleAssociateCampaign(co.id, suggestedCampaignId)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1B3A6B]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#1B3A6B] hover:bg-[#1B3A6B]/5 disabled:opacity-50 transition-colors"
                        >
                          <Megaphone className="h-3 w-3" />
                          Asociar a campaña recomendada
                        </button>
                      )}

                      <Link
                        href={`/app/empresas/${co.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Building2 className="h-3 w-3" />
                        Ver empresa
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
