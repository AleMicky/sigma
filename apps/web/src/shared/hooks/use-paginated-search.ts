import { useEffect, useState } from "react"

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

type UsePaginatedSearchOptions = {
  debounceMs?: number
  /** When this value changes, page and search reset. */
  resetKey?: unknown
}

export function usePaginatedSearch(options: UsePaginatedSearchOptions = {}) {
  const { debounceMs, resetKey } = options
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, debounceMs)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    if (resetKey === undefined) return
    setPage(0)
    setSearch("")
  }, [resetKey])

  return {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    query: debouncedSearch.trim() || undefined,
  }
}

export function useClampPage(
  page: number,
  setPage: (page: number) => void,
  totalPages?: number,
) {
  useEffect(() => {
    if (totalPages !== undefined && totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1)
    }
  }, [page, setPage, totalPages])
}
