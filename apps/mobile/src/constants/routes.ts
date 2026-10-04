export const ROUTES = {
  ROOT: "/",

  AUTH: {
    LOGIN: "/(auth)/login",
  },

  APP: {
    HOME: "/(app)/(tabs)",
    PROFILE: "/(app)/(tabs)/profile",
    SETTINGS: "/(app)/settings",
  },

  SOLICITUDES: {
    LIST: "/(app)/(tabs)/solicitudes",

    CREATE: "/(app)/solicitudes/create",

    DETAIL: (id: number | string) =>
      `/(app)/solicitudes/${id}` as const,

    EDIT: (id: number | string) =>
      `/(app)/solicitudes/${id}/edit` as const,
  },
} as const;