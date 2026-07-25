'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TYPE_LABELS, POLICY_STATUS_COLORS, POLICY_STATUS_LABELS } from '@/domains/policies/types'
import type { Policy, PolicyStatus } from '@/domains/policies/types'
import { isDemoMode } from '@/lib/demo'

interface PolicyDetailProps {
  policy: Policy
  canSeeCommission: boolean
}

// CTA contextual por estado — decisión 8 del usuario. Los estados marcados
// "(extrapolado)" no estaban explícitos en esa decisión (que solo cubrió
// borrador/pendiente_documentación/emitida/vigente/próxima a vencer/en
// renovación/vencida/renovada/no_renovada/cancelada); se completan por
// consistencia con el resto del flujo, a validar.
const STATUS_CTA: Partial<Record<PolicyStatus, string>> = {
  borrador: 'Completar póliza',
  cotizacion: 'Enviar a aseguradora', // extrapolado
  pendiente_documentacion: 'Completar documentación',
  enviada_a_aseguradora: 'Registrar respuesta de aseguradora', // extrapolado
  emitida: 'Activar póliza',
  vigente: 'Registrar próxima acción',
  proxima_a_vencer: 'Iniciar renovación',
  en_renovacion: 'Confirmar renovación',
  renovada: 'Ver nueva vigencia',
  no_renovada: 'Registrar próxima acción comercial',
  rechazada: 'Definir situación', // extrapolado (la decisión 8 mencionaba "vencida", no modelado como estado propio)
  // cancelada: sin CTA de avance — se muestra el estado final abajo.
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function PolicyDetail({ policy, canSeeCommission }: PolicyDetailProps) {
  const cta = STATUS_CTA[policy.status]

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/app/polizas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Volver a Pólizas
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{policy.companyName}</h1>
          <p className="text-sm text-gray-500">{policy.insurerName} · {policy.branchName}</p>
          {!isDemoMode() && <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — dato de ejemplo, sin conexión a la base de datos.</p>}
        </div>
        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${POLICY_STATUS_COLORS[policy.status]}`}>
          {POLICY_STATUS_LABELS[policy.status]}
        </span>
      </div>

      {cta && (
        <div>
          <Button variant="success">{cta}</Button>
        </div>
      )}

      <Section title="Identificación">
        <Field label="Número de póliza" value={policy.policyNumber} />
        <Field label="Producto" value={policy.product} />
      </Section>

      <Section title="Cliente">
        <Field label="Empresa" value={policy.companyName} />
        <Field label="Contacto responsable" value={policy.contactName} />
      </Section>

      <Section title="Aseguradora y ramo">
        <Field label="Aseguradora" value={policy.insurerName} />
        <Field label="Ramo" value={policy.branchName} />
      </Section>

      <Section title="Vigencia">
        <Field label="Inicio de vigencia" value={policy.startDate} />
        <Field label="Vencimiento" value={policy.endDate} />
      </Section>

      <Section title="Importes">
        <Field label="Prima" value={policy.premium != null ? `$${policy.premium.toLocaleString('es-UY')} ${policy.currency}` : null} />
        <Field
          label="Comisión"
          value={
            !canSeeCommission
              ? <span className="text-gray-400 italic">No visible para tu rol</span>
              : policy.commissionValue != null
              ? `${policy.commissionValue}${policy.commissionType === 'percentage' ? '%' : ` ${policy.currency}`}`
              : 'Sin datos'
          }
        />
      </Section>

      <Section title="Responsables y seguimiento">
        <Field label="Ejecutivo responsable" value={policy.assignedToName} />
        <Field label="Próxima acción" value={policy.nextAction} />
        <Field label="Fecha de próxima acción" value={policy.nextActionDate} />
        <Field label="Observaciones" value={policy.notes} />
      </Section>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Documentación ({policy.documents.length})</h2>
        {policy.documents.length === 0 ? (
          <p className="text-sm text-gray-400">Sin documentos registrados todavía.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {policy.documents.map(d => (
              <li key={d.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400">{DOCUMENT_TYPE_LABELS[d.type]} · agregado el {d.addedAt}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
