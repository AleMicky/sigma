import axios, { type AxiosError } from "axios";

export interface ApiFieldValidationError {
    field: string;
    message: string;
    rejectedValue?: unknown;
}

export interface ApiValidationError {
    field: string;
    messages: string[];
    rejectedValue?: unknown;
}

export interface ApiErrorResponse {
    success?: boolean;
    message?: string;
    title?: string;
    detail?: string;
    error?: string;
    code?: string;
    status?: number;
    path?: string;
    timestamp?: string;
    validationErrors?: ApiFieldValidationError[];
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

function normalizeErrorResponseData(
    raw: unknown,
): ApiErrorResponse | undefined {
    if (!raw) {
        return undefined;
    }

    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) {
            return undefined;
        }
        try {
            const parsed: unknown = JSON.parse(trimmed);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed as ApiErrorResponse;
            }
        } catch {
            // Texto plano no JSON
        }
        return { message: trimmed };
    }

    if (typeof Blob !== "undefined" && raw instanceof Blob) {
        return undefined;
    }

    if (typeof raw === "object") {
        return raw as ApiErrorResponse;
    }

    return undefined;
}

function mapValidationErrors(
    data?: ApiErrorResponse,
): ApiValidationError[] {
    if (
        Array.isArray(data?.validationErrors) &&
        data.validationErrors.length > 0
    ) {
        const grouped = new Map<string, ApiValidationError>();

        for (const item of data.validationErrors) {
            if (!item?.field) {
                continue;
            }

            const message = item.message || "Valor inválido";
            const existing = grouped.get(item.field);

            if (existing) {
                existing.messages.push(message);
            } else {
                grouped.set(item.field, {
                    field: item.field,
                    messages: [message],
                    ...(item.rejectedValue !== undefined
                        ? { rejectedValue: item.rejectedValue }
                        : {}),
                });
            }
        }

        return Array.from(grouped.values());
    }

    if (data?.errors && typeof data.errors === "object") {
        return Object.entries(data.errors).map(
            ([field, messages]) => ({
                field,
                messages: Array.isArray(messages)
                    ? messages
                    : [String(messages)],
            }),
        );
    }

    return [];
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
        error as AxiosError<unknown>;

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

    const { status, data: rawData } = axiosError.response;
    const data = normalizeErrorResponseData(rawData);

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
        code: data?.code ?? axiosError.code,
        validationErrors: mapValidationErrors(data),
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
