interface AppEnvironment {
    apiUrl: string;
    appName: string;
    environment: string;
    enableDevtools: boolean;
}

function getRequiredEnv(
    value: string | undefined,
    variableName: string,
): string {
    if (!value) {
        throw new Error(
            `La variable de entorno ${variableName} no está configurada`,
        );
    }

    return value;
}

export const env: AppEnvironment = {
    apiUrl: getRequiredEnv(
        import.meta.env.VITE_API_URL,
        "VITE_API_URL",
    ),

    appName:
        import.meta.env.VITE_APP_NAME ??
        "SIGMA – Sistema Integrado de Gestión de Mantenimiento, Vehículos y Activos",

    environment:
        import.meta.env.MODE,

    enableDevtools:
        import.meta.env.DEV,
};