export type AuditableFields = {
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export type AuditableEntity = {
  id: string
} & AuditableFields
