import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { industryLabel } from '@/lib/industry-labels'
import type { CompanyDuplicateMatch, ContactDuplicateMatch } from '@/domains/duplicates/types'

interface DuplicateWarningPanelProps {
  title: string
  description: string
  companyMatches?: CompanyDuplicateMatch[]
  contactMatches?: ContactDuplicateMatch[]
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function DuplicateWarningPanel({
  title,
  description,
  companyMatches = [],
  contactMatches = [],
  onConfirm,
  onCancel,
  loading,
}: DuplicateWarningPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-900">{title}</h3>
            <p className="text-sm text-amber-800">{description}</p>
          </div>
        </div>
      </div>

      {companyMatches.length > 0 && (
        <ul className="space-y-3">
          {companyMatches.map(match => (
            <li
              key={match.id}
              className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-gray-900">{match.name}</p>
                  {match.industry && (
                    <p className="text-gray-600">Rubro: {industryLabel(match.industry)}</p>
                  )}
                  {match.website && <p className="text-gray-600 truncate">Web: {match.website}</p>}
                  {match.linkedin_url && (
                    <p className="text-gray-600 truncate">LinkedIn: {match.linkedin_url}</p>
                  )}
                  <p className="text-xs text-amber-700">{match.reasons.join(' · ')}</p>
                </div>
                <Link
                  href={`/app/empresas/${match.id}`}
                  className="shrink-0 text-sm font-medium text-[#1B3A6B] hover:underline"
                >
                  Ver empresa
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {contactMatches.length > 0 && (
        <ul className="space-y-3">
          {contactMatches.map(match => (
            <li
              key={match.id}
              className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {match.first_name} {match.last_name}
                  </p>
                  {match.company_name && (
                    <p className="text-gray-600">Empresa: {match.company_name}</p>
                  )}
                  {match.email && <p className="text-gray-600 truncate">Email: {match.email}</p>}
                  {match.phone && <p className="text-gray-600">Teléfono: {match.phone}</p>}
                  <p className="text-xs text-amber-700">{match.reasons.join(' · ')}</p>
                </div>
                <Link
                  href={`/app/contactos/${match.id}`}
                  className="shrink-0 text-sm font-medium text-[#1B3A6B] hover:underline"
                >
                  Ver contacto
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Volver y revisar
        </Button>
        <Button type="button" variant="outline" onClick={onConfirm} loading={loading}>
          Crear de todos modos
        </Button>
      </div>
    </div>
  )
}
