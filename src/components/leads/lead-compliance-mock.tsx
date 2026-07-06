import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PREVENTIVE_WARNINGS = [
  'No prometer coberturas ni condiciones que no estén validadas.',
  'No inventar primas, descuentos ni plazos de respuesta.',
  'No confirmar condiciones MAPFRE sin documentación oficial.',
  'Revisión humana obligatoria antes de enviar cualquier mensaje al cliente.',
]

export function LeadComplianceMock() {
  return (
    <Card className="border-orange-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-orange-600" />
          Compliance preventivo
          <span className="ml-auto rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700">
            Mock
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-gray-500">
          Recordatorios antes de contactar al lead. El revisor real estará en el módulo Compliance.
        </p>
        <ul className="space-y-2">
          {PREVENTIVE_WARNINGS.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs text-orange-900"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
              {warning}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
