interface SummaryItem {
  label: string
  value: React.ReactNode
  highlight?: boolean
}

interface EntitySummaryProps {
  items: SummaryItem[]
}

export function EntitySummary({ items }: EntitySummaryProps) {
  const visible = items.filter(
    item => item.value != null && item.value !== '' && item.value !== '—' && item.value !== false
  )
  if (visible.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 shadow-sm">
      {visible.map(item => (
        <div key={item.label}>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
          <div className={`text-sm mt-0.5 ${item.highlight ? 'font-semibold text-[#1B3A6B]' : 'text-gray-900'}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
