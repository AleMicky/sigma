import { env } from "./env";

export const appConfig = {
    name: env.appName,
    shortName: "SIGMA",
    description:
        "Sistema Integrado de Gestión de Mantenimiento, Vehículos y Activos",

    version: "1.0.0",

    locale: "es-BO",
    timezone: "America/La_Paz",

    pagination: {
        defaultPage: 1,
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
    },

    dateFormats: {
        date: "dd/MM/yyyy",
        dateTime: "dd/MM/yyyy HH:mm",
    },

    storageKeys: {
        accessToken: "access_token",
        refreshToken: "refresh_token",
        user: "authenticated_user",
        theme: "app_theme",
        sidebar: "sidebar_state",
    },
} as const;