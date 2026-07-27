import { ListOrdered } from 'lucide-react'

const STEPS = [
  'Definí segmento y objetivo',
  'Prepará empresas/contactos a trabajar',
  'Registrá conversaciones reales',
  'Creá oportunidades cuando haya interés',
  'Revisá resultados y próximos pasos',
]

interface CampaignOperationalGuideProps {
  compact?: boolean
}

export function CampaignOperationalGuide({ compact }: CampaignOperationalGuideProps) {
  if (compact) {
    return (
      <p className="text-xs text-gray-500">
        Una campaña no envía mensajes automáticamente. Planificá, priorizá y convertí interés en oportunidades.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-[#1B3A6B]/10 bg-[#1B3A6B]/[0.03] p-4">
      <div className="flex items-start gap-2 mb-3">
        <ListOrdered className="h-4 w-4 text-[#1B3A6B] shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Cómo usar campañas</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            No envían WhatsApp, emails ni mensajes automáticamente. Organizan acciones comerciales para que el equipo haga seguimiento real.
          </p>
        </div>
      </div>
      <ol className="space-y-1.5 pl-6 list-decimal text-xs text-gray-600">
        {STEPS.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  )
}
