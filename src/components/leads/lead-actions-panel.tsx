import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MockLead } from '@/domains/leads/mock-data'
import { buildProposalHref } from './lead-proposal-link'

export function LeadActionsPanel({ lead }: { lead: MockLead }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Acciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-[#1B3A6B]/15 bg-[#1B3A6B]/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#1B3A6B]" />
            <p className="text-sm font-medium text-gray-900">Crear propuesta</p>
          </div>
          <p className="text-xs text-gray-600">
            Usá los motores para armar un borrador a partir de este lead.
          </p>
          <Button asChild className="w-full justify-center">
            <Link href={buildProposalHref(lead)}>
              <FileText className="h-4 w-4" />
              Crear propuesta desde este lead
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
