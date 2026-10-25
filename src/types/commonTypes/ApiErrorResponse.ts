/** One entry of `errors` when the backend's ValidationPipe rejects a body. */
export interface ValidationErrorDetail {
  field: string;
  messages: string[];
}

/** Error body produced by the backend's AllExceptionsFilter. */
export interface ApiErrorResponse {
  statusCode: number;
  success: false;
  code: string;
  message: string;
  errors?: ValidationErrorDetail[];
  path: string;
  timestamp: string;
}

/**
 * What `handleApiError` returns for any failed request (server error,
 * network error or unexpected exception), so callers never touch AxiosError.
 */
export interface NormalizedApiError {
  /** HTTP status, or 0 when the server could not be reached. */
  statusCode: number;
  /** Backend `ErrorCode` (BAD_REQUEST, UNAUTHORIZED…) or NETWORK_ERROR / UNKNOWN_ERROR. */
  code: string;
  /** Raw message from the backend (English) or the client. */
  message: string;
  /** Validation messages keyed by request field name. */
  fieldErrors: Record<string, string>;
}
