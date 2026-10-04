export const ROUTES = {
  ROOT: "/",
  DEMO: "/demo",

  AUTH: {
    LOGIN: "/(auth)/login",
    SERVER_CONFIG: "/(auth)/server-config",
  },

  APP: {
    WELCOME: "/(app)/welcome",
    HOME: "/(app)/home",
    PROFILE: "/(app)/profile",
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