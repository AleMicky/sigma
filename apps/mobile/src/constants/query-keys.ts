export const QUERY_KEYS = {
  AUTH: {
    ME: ["auth", "me"] as const,
  },

  USERS: {
    ALL: ["users"] as const,

    LIST: (filters?: Record<string, unknown>) =>
      ["users", "list", filters] as const,

    DETAIL: (id: number | string) =>
      ["users", "detail", id] as const,
  },

  SOLICITUDES: {
    ALL: ["solicitudes"] as const,

    LIST: (filters?: Record<string, unknown>) =>
      ["solicitudes", "list", filters] as const,

    DETAIL: (id: number | string) =>
      ["solicitudes", "detail", id] as const,
  },
} as const;