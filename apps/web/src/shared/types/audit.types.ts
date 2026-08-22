export type AuditableFields = {
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export type AuditoriaResponse = AuditableFields

export type AuditableEntity = {
  id: string
  auditoria?: AuditableFields
} & Partial<AuditableFields>
