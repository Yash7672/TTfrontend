import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="muted">
        {totalElements} result{totalElements === 1 ? '' : 's'}
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="muted">
        Page {page + 1} of {totalPages} · {totalElements} result{totalElements === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary btn-sm"
          disabled={page <= 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary btn-sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
