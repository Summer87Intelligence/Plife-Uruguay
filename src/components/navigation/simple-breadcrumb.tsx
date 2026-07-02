import Link from 'next/link'
import type { Route } from 'next'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface SimpleBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function SimpleBreadcrumb({ items }: SimpleBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            {item.href && !isLast ? (
              <Link href={item.href as Route} className="hover:text-[#1B3A6B] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-600 font-medium truncate max-w-[200px] sm:max-w-none' : ''}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
