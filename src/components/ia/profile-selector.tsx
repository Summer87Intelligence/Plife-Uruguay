'use client'

import type { AIAnalysisProfile } from '@/types/database'

interface ProfileSelectorProps {
  profiles: AIAnalysisProfile[]
  value: string
  onChange: (id: string) => void
  className?: string
  label?: string
}

export function ProfileSelector({ profiles, value, onChange, className = '', label = 'Perfil activo' }: ProfileSelectorProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] min-w-[200px]"
      >
        {profiles.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}{p.is_active ? ' (activo)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
