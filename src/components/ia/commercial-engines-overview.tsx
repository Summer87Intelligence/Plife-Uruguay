import {
  Stethoscope, Compass, Package, Megaphone, BarChart3, BookOpen,
  ArrowRight, HelpCircle, Sparkles, Lightbulb,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  COMMERCIAL_ENGINES,
  ENGINE_STATUS_LABELS,
  ENGINE_STATUS_STYLES,
  ENGINES_SECTION,
  RECOMMENDED_FLOW,
  PROPOSALS_NOTE,
  EXAMPLE_SCENARIO,
  getEngine,
  type EngineId,
} from '@/domains/intelligence-engines'

const ENGINE_ICONS: Record<EngineId, typeof Stethoscope> = {
  diagnostico: Stethoscope,
  mercado: Compass,
  producto: Package,
  comercial: Megaphone,
  direccion: BarChart3,
  aprendizaje: BookOpen,
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{children}</h2>
}

export function CommercialEnginesOverview() {
  return (
    <div className="space-y-6">
      {/* 1. Qué hacen los motores */}
      <section className="space-y-2">
        <SectionTitle>Qué hacen los motores</SectionTitle>
        <p className="text-sm text-gray-600 max-w-3xl">{ENGINES_SECTION.intro}</p>
      </section>

      {/* 2. Motores disponibles */}
      <section className="space-y-3">
        <SectionTitle>Motores disponibles</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COMMERCIAL_ENGINES.map((engine) => {
            const Icon = ENGINE_ICONS[engine.id]
            return (
              <Card key={engine.id} className="border-gray-100">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-[#1B3A6B]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#1B3A6B]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{engine.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{engine.shortDescription}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${ENGINE_STATUS_STYLES[engine.status]}`}>
                      {ENGINE_STATUS_LABELS[engine.status]}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Qué hace
                    </p>
                    <ul className="space-y-0.5">
                      {engine.whatItDoes.map((item) => (
                        <li key={item} className="text-xs text-gray-600 flex gap-1.5">
                          <span className="text-[#1B3A6B]">·</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" /> Preguntas ejemplo
                      </p>
                      <ul className="space-y-0.5">
                        {engine.exampleQuestions.map((q) => (
                          <li key={q} className="text-xs text-gray-600 italic">“{q}”</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> Salidas ejemplo
                      </p>
                      <ul className="space-y-0.5">
                        {engine.exampleOutputs.map((o) => (
                          <li key={o} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-green-600">·</span>{o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 3. Flujo recomendado */}
      <section className="space-y-3">
        <SectionTitle>Flujo recomendado</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          {RECOMMENDED_FLOW.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                {step.label}
              </span>
              {i < RECOMMENDED_FLOW.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-800">{PROPOSALS_NOTE}</p>
        </div>
      </section>

      {/* 4. Ejemplo de uso */}
      <section className="space-y-3">
        <SectionTitle>{EXAMPLE_SCENARIO.title}</SectionTitle>
        <p className="text-sm text-gray-600">{EXAMPLE_SCENARIO.context}</p>
        <div className="space-y-2">
          {EXAMPLE_SCENARIO.steps.map((step, i) => {
            const engine = getEngine(step.engineId)
            const Icon = ENGINE_ICONS[step.engineId]
            return (
              <div key={step.engineId} className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-[10px] font-bold text-[#1B3A6B]">
                    {i + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-[#1B3A6B]" />
                  <p className="text-xs font-semibold text-gray-900">{engine.name}</p>
                </div>
                <p className="text-xs text-gray-600"><span className="text-gray-400">Pregunta:</span> “{step.question}”</p>
                <p className="text-xs text-gray-600 mt-0.5"><span className="text-gray-400">Entrega:</span> {step.output}</p>
              </div>
            )
          })}
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">
          <p className="text-xs text-green-800">{EXAMPLE_SCENARIO.result}</p>
        </div>
      </section>
    </div>
  )
}
