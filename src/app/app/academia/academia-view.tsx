'use client'
import { useState } from 'react'
import { GraduationCap, BookOpen, MessageSquare, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Profile, TrainingModule, ObjectionItem } from '@/types/database'

interface AcademiaViewProps {
  profile: Profile
  modules: TrainingModule[]
  objections: ObjectionItem[]
}

const levelColors: Record<string, string> = {
  basico: 'bg-green-100 text-green-800',
  intermedio: 'bg-yellow-100 text-yellow-800',
  avanzado: 'bg-red-100 text-red-800',
}

export function AcademiaView({ profile, modules, objections }: AcademiaViewProps) {
  const [activeObjId, setActiveObjId] = useState<string | null>(null)
  const [tab, setTab] = useState<'modulos' | 'objeciones'>('modulos')

  const categories = [...new Set(objections.map(o => o.category).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1B3A6B] flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Academia PLIFE</h1>
          <p className="text-sm text-gray-500">Capacitación comercial y manejo de objeciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden w-fit">
        {(['modulos', 'objeciones'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-[#1B3A6B] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {t === 'modulos' ? 'Módulos de capacitación' : 'Biblioteca de objeciones'}
          </button>
        ))}
      </div>

      {tab === 'modulos' && (
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <Card key={mod.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{mod.title}</p>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[mod.level] ?? 'bg-gray-100 text-gray-700'}`}>
                        {mod.level}
                      </span>
                    </div>
                    {mod.description && <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>}
                  </div>
                  {mod.estimated_minutes && (
                    <div className="shrink-0 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {mod.estimated_minutes} min
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {modules.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay módulos disponibles</p>
            </div>
          )}
        </div>
      )}

      {tab === 'objeciones' && (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 capitalize">{cat}</p>
              <div className="space-y-2">
                {objections.filter(o => o.category === cat).map(obj => (
                  <div key={obj.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveObjId(activeObjId === obj.id ? null : obj.id)}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" />
                        <p className="text-sm font-medium text-gray-900">"{obj.objection}"</p>
                      </div>
                      {activeObjId === obj.id ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                    </button>
                    {activeObjId === obj.id && (
                      <div className="px-5 pb-4 border-t border-gray-50">
                        <p className="text-xs font-semibold text-green-700 mb-1 mt-3">Respuesta recomendada:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{obj.recommended_response}</p>
                        {obj.context && (
                          <p className="text-xs text-gray-400 mt-2 italic">Contexto: {obj.context}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
