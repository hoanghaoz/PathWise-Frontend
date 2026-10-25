import { isAxiosError } from "axios";

import type {
  ApiErrorResponse,
  NormalizedApiError,
} from "../types/commonTypes";

/**
 * Normalizes any error thrown by an axios call (server response error or
 * network error) into a single NormalizedApiError shape so callers never have
 * to deal with a raw AxiosError.
 */
export const handleApiError = (error: unknown): NormalizedApiError => {
  if (isAxiosError<Partial<ApiErrorResponse>>(error)) {
    if (error.response) {
      const body = error.response.data ?? {};
      const fieldErrors: Record<string, string> = {};
      for (const detail of body.errors ?? []) {
        if (detail.messages.length > 0) {
          fieldErrors[detail.field] = detail.messages[0];
        }
      }
      return {
        statusCode: body.statusCode ?? error.response.status,
        code: body.code ?? error.response.statusText,
        message: body.message ?? error.message,
        fieldErrors,
      };
    }

    return {
      statusCode: 0,
      code: "NETWORK_ERROR",
      message: error.message || "Network error",
      fieldErrors: {},
    };
  }

  return {
    statusCode: 0,
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error",
    fieldErrors: {},
  };
};
