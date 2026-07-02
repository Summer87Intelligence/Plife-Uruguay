import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft } from 'lucide-react'

interface DetailBackLinkProps {
  href: string
  label: string
}

export function DetailBackLink({ href, label }: DetailBackLinkProps) {
  return (
    <Link
      href={href as Route}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}
