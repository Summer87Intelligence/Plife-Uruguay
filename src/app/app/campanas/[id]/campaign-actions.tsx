'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CampaignForm } from '../campaign-form'
import { CampaignAIDialog } from './campaign-ai'
import { updateCampaignStatus } from '@/domains/campaigns/actions'
import { CAMPAIGN_STATUS_LABELS } from '@/lib/constants'
import type { Campaign } from '@/types/database'

const statusOptions = Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  async function handleStatusChange(status: string) {
    await updateCampaignStatus(campaign.id, status)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-40">
        <Select value={campaign.status} onValueChange={handleStatusChange} options={statusOptions} />
      </div>
      <CampaignAIDialog campaignId={campaign.id} />
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm"><Pencil className="h-4 w-4" />Editar</Button>
        </DialogTrigger>
        <DialogContent title="Editar campaña" description="Actualizá la estrategia y los mensajes de la campaña">
          <CampaignForm
            mode="edit"
            campaignId={campaign.id}
            initial={{
              name: campaign.name,
              type: campaign.type,
              status: campaign.status,
              objective: campaign.objective ?? '',
              target_segment: campaign.target_segment ?? '',
              icp_description: campaign.icp_description ?? '',
              initial_message: campaign.initial_message ?? '',
              call_script: campaign.call_script ?? '',
              expected_objections: campaign.expected_objections ?? [],
              start_date: campaign.start_date ?? '',
              end_date: campaign.end_date ?? '',
            }}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
