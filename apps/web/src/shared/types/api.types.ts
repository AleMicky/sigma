export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export type PageParams = {
  page?: number
  size?: number
  sortBy?: string
  direction?: "ASC" | "DESC"
  q?: string
}
