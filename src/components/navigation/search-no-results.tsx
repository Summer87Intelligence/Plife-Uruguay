interface SearchNoResultsProps {
  onClearSearch?: () => void
  onClearFilters?: () => void
  hasFilters?: boolean
}

export function SearchNoResults({ onClearSearch, onClearFilters, hasFilters }: SearchNoResultsProps) {
  return (
    <div className="text-center space-y-2">
      <p className="text-sm font-medium text-gray-700">No encontramos resultados para esta búsqueda.</p>
      <p className="text-sm text-gray-500">Probá cambiar el texto o limpiar filtros.</p>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs text-[#1B3A6B] hover:underline"
          >
            Limpiar búsqueda
          </button>
        )}
        {hasFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-[#1B3A6B] hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
