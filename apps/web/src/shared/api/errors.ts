import axios, { type AxiosError } from "axios";

export interface ApiValidationError {
    field: string;
    messages: string[];
}

export interface ApiErrorResponse {
    message?: string;
    title?: string;
    detail?: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export class ApiError extends Error {
    readonly status?: number;
    readonly code?: string;
    readonly validationErrors: ApiValidationError[];
    readonly originalError?: unknown;

    constructor(options: {
        message: string;
        status?: number;
        code?: string;
        validationErrors?: ApiValidationError[];
        originalError?: unknown;
    }) {
        super(options.message);

        this.name = "ApiError";
        this.status = options.status;
        this.code = options.code;
        this.validationErrors =
            options.validationErrors ?? [];
        this.originalError = options.originalError;
    }
}

function mapValidationErrors(
    errors?: Record<string, string[]>,
): ApiValidationError[] {
    if (!errors) {
        return [];
    }

    return Object.entries(errors).map(
        ([field, messages]) => ({
            field,
            messages,
        }),
    );
}

function getResponseMessage(
    data: ApiErrorResponse | undefined,
    fallbackMessage: string,
): string {
    return (
        data?.message ??
        data?.detail ??
        data?.title ??
        fallbackMessage
    );
}

export function parseApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        return new ApiError({
            message:
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado",
            originalError: error,
        });
    }

    const axiosError =
        error as AxiosError<ApiErrorResponse>;

    if (axiosError.code === "ECONNABORTED") {
        return new ApiError({
            message:
                "La solicitud tardó demasiado tiempo en responder",
            code: axiosError.code,
            originalError: error,
        });
    }

    if (!axiosError.response) {
        return new ApiError({
            message:
                "No se pudo conectar con el servidor. Verifica tu conexión.",
            code: axiosError.code,
            originalError: error,
        });
    }

    const { status, data } = axiosError.response;

    const defaultMessages: Record<number, string> = {
        400: "La solicitud contiene datos incorrectos",
        401: "Tu sesión no es válida o ha expirado",
        403: "No tienes permiso para realizar esta acción",
        404: "El recurso solicitado no fue encontrado",
        409: "La operación genera un conflicto",
        422: "Los datos enviados no son válidos",
        500: "Ocurrió un error interno en el servidor",
        502: "El servidor no está disponible",
        503: "El servicio no está disponible temporalmente",
    };

    return new ApiError({
        message: getResponseMessage(
            data,
            defaultMessages[status] ??
            "Ocurrió un error al procesar la solicitud",
        ),
        status,
        code: axiosError.code,
        validationErrors: mapValidationErrors(
            data?.errors,
        ),
        originalError: error,
    });
}

export function isApiError(
    error: unknown,
): error is ApiError {
    return error instanceof ApiError;
}

export function isValidationError(
    error: unknown,
): boolean {
    return (
        error instanceof ApiError &&
        error.validationErrors.length > 0
    );
}

export function getErrorMessage(
    error: unknown,
): string {
    return parseApiError(error).message;
}