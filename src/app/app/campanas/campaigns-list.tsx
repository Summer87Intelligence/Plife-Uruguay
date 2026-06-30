'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Plus, Megaphone, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CAMPAIGN_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { CampaignForm } from './campaign-form'
import type { Profile, Campaign } from '@/types/database'

const statusColors: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  activa: 'bg-green-100 text-green-800',
  pausada: 'bg-yellow-100 text-yellow-800',
  finalizada: 'bg-blue-100 text-blue-800',
  archivada: 'bg-gray-100 text-gray-500',
}

interface CampaignsListProps {
  campaigns: Campaign[]
  profile: Profile
}

export function CampaignsList({ campaigns, profile }: CampaignsListProps) {
  const [open, setOpen] = useState(false)
  const canManage = ['admin', 'direccion', 'lider_comercial'].includes(profile.role)

  const active = campaigns.filter(c => c.status === 'activa')
  const others = campaigns.filter(c => c.status !== 'activa')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campañas B2B</h1>
          <p className="text-sm text-gray-500">{campaigns.length} campañas · {active.length} activas</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Nueva campaña</Button>
            </DialogTrigger>
            <DialogContent title="Nueva campaña B2B" description="Definí el segmento y objetivo">
              <CampaignForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin campañas"
          description="Creá una campaña para organizar tus acciones comerciales por segmento"
          action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nueva campaña</Button> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activas</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Otras</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {others.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const convRate = campaign.total_targets > 0
    ? Math.round((campaign.total_converted / campaign.total_targets) * 100)
    : 0

  return (
    <Link href={`/app/campanas/${campaign.id}` as Route} className="block rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{campaign.name}</p>
          {campaign.target_segment && (
            <p className="text-xs text-gray-500 mt-0.5">{campaign.target_segment}</p>
          )}
        </div>
        <span className={`ml-2 shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[campaign.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Targets', value: campaign.total_targets },
          { label: 'Contactados', value: campaign.total_contacted },
          { label: 'Reuniones', value: campaign.total_meetings },
          { label: 'Convertidos', value: campaign.total_converted },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg bg-gray-50 p-2">
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {campaign.start_date && (
        <p className="text-xs text-gray-400 mt-3">
          {formatDate(campaign.start_date)} {campaign.end_date ? `→ ${formatDate(campaign.end_date)}` : '(sin fecha fin)'}
        </p>
      )}
    </Link>
  )
}
