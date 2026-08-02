export { axiosInstance } from "./axios";

export {
    registerInterceptors,
} from "./interceptors";

export { http } from "./http";
export type { HttpClient } from "./http";

export {
    ApiError,
    getErrorMessage,
    isApiError,
    isValidationError,
    parseApiError,
} from "./errors";

export type {
    ApiErrorResponse,
    ApiValidationError,
} from "./errors";

export {
    createCrudService,
    createResourceEndpoints,
    createResourceKeys,
} from "./resource";
export type { CrudService, ResourceEndpoints } from "./resource";

export { createCrudMutations } from "./crud-mutations";
