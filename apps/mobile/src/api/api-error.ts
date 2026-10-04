export type ApiValidationErrors = Record<
  string,
  string[]
>;

type ApiErrorOptions = {
  status?: number;
  code?: string;
  errors?: ApiValidationErrors;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  errors?: ApiValidationErrors;

  constructor(
    message: string,
    options: ApiErrorOptions = {}
  ) {
    super(message);

    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.errors = options.errors;

    Object.setPrototypeOf(
      this,
      ApiError.prototype
    );
  }
}