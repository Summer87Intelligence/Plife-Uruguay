'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PoliciesSubnav } from '@/components/policies/policies-subnav'
import { CatalogManager } from '@/components/admin/catalog-manager'
import { isDemoMode } from '@/lib/demo'
import { DEMO_ASEGURADORAS, DEMO_RAMOS } from '@/lib/demo/universe'

interface MockItem {
  id: string
  name: string
  is_active: boolean
}

const INITIAL_INSURERS: MockItem[] = isDemoMode()
  ? DEMO_ASEGURADORAS.map(a => ({ id: a.id, name: a.name, is_active: a.is_active }))
  : [
  { id: 'mi-1', name: 'BSE', is_active: true },
  { id: 'mi-2', name: 'Porto Seguro', is_active: true },
  { id: 'mi-3', name: 'Mapfre', is_active: true },
  { id: 'mi-4', name: 'SURA', is_active: true },
]

const INITIAL_BRANCHES: MockItem[] = isDemoMode()
  ? DEMO_RAMOS.map(r => ({ id: r.id, name: r.name, is_active: r.is_active }))
  : [
  { id: 'mb-1', name: 'Vehículos', is_active: true },
  { id: 'mb-2', name: 'Responsabilidad civil', is_active: true },
  { id: 'mb-3', name: 'Accidentes de trabajo', is_active: true },
  { id: 'mb-4', name: 'Vida', is_active: true },
  { id: 'mb-5', name: 'Incendio', is_active: true },
  { id: 'mb-6', name: 'Transporte', is_active: true },
  { id: 'mb-7', name: 'Hogar', is_active: true },
  { id: 'mb-8', name: 'Comercio', is_active: true },
]

let mockCounter = 100

/**
 * Bloque UI-0 (prototipo visual): reutiliza el mismo CatalogManager del
 * Bloque Técnico 1 (Admin > Aseguradoras/Ramos), pero con estado 100% local
 * — no llama a los server actions reales ni a Supabase. Es una vista
 * independiente para validar UX dentro de la navegación de Pólizas; el
 * catálogo real y persistido sigue viviendo en Admin.
 */
export function ConfiguracionView() {
  const [insurers, setInsurers] = useState(INITIAL_INSURERS)
  const [branches, setBranches] = useState(INITIAL_BRANCHES)

  function makeHandlers(setItems: React.Dispatch<React.SetStateAction<MockItem[]>>) {
    return {
      onCreate: async (name: string) => {
        mockCounter += 1
        setItems(prev => [...prev, { id: `mock-${mockCounter}`, name, is_active: true }])
        return { data: {} }
      },
      onUpdate: async (id: string, name: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, name } : i))
        return { data: {} }
      },
      onSetActive: async (id: string, is_active: boolean) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, is_active } : i))
        return { data: {} }
      },
    }
  }

  const insurerHandlers = makeHandlers(setInsurers)
  const branchHandlers = makeHandlers(setBranches)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">Catálogos de aseguradoras y ramos usados al registrar una póliza.</p>
        {!isDemoMode() && (
          <p className="text-xs text-amber-600 mt-0.5">Prototipo visual — cambios acá no se guardan ni afectan el catálogo real de Admin.</p>
        )}
      </div>

      <PoliciesSubnav />

      <Card>
        <CardHeader><CardTitle>Aseguradoras</CardTitle></CardHeader>
        <CardContent>
          <CatalogManager
            entityLabel="aseguradora"
            entityLabelPlural="aseguradoras"
            newItemLabel="Nueva aseguradora"
            items={insurers}
            {...insurerHandlers}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ramos</CardTitle></CardHeader>
        <CardContent>
          <CatalogManager
            entityLabel="ramo"
            entityLabelPlural="ramos"
            newItemLabel="Nuevo ramo"
            items={branches}
            {...branchHandlers}
          />
        </CardContent>
      </Card>
    </div>
  )
}
