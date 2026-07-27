import Link from 'next/link'
import type { Route } from 'next'
import { CalendarClock, FileWarning, FileText, Star, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttentionItem } from '@/lib/demo/universe'

const KIND_META: Record<AttentionItem['kind'], { label: string; icon: typeof CalendarClock; iconClassName: string }> = {
  renovacion: { label: 'Renovación', icon: CalendarClock, iconClassName: 'text-orange-500' },
  documentacion: { label: 'Documentación', icon: FileWarning, iconClassName: 'text-amber-500' },
  propuesta: { label: 'Propuesta', icon: FileText, iconClassName: 'text-[#1B3A6B]' },
  cliente: { label: 'Cliente prioritario', icon: Star, iconClassName: 'text-purple-500' },
}

const LIST_LIMIT = 6

export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  const visible = items.slice(0, LIST_LIMIT)

  return (
    <section className="rounded-xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-gray-700">Qué necesita atención hoy</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          Renovaciones urgentes, documentación pendiente, propuestas sin seguimiento y clientes prioritarios.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">
          No hay pendientes urgentes por ahora.
        </p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {visible.map(item => {
            const meta = KIND_META[item.kind]
            const Icon = meta.icon
            return (
              <li key={item.id}>
                <Link
                  href={item.href as Route}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50', meta.iconClassName)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{meta.label}</span>
                      {item.urgent && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">Urgente</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.clientName} · {item.responsible}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.dueLabel} — {item.actionLabel}
                    </p>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {items.length > LIST_LIMIT && (
        <div className="border-t border-gray-50 px-4 py-2.5 text-center text-xs text-gray-400">
          +{items.length - LIST_LIMIT} pendientes más — revisá Pólizas, Propuestas y Empresas
        </div>
      )}
    </section>
  )
}
