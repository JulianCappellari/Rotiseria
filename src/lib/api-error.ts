type ApiErrorData = {
  message?: string;
  details?: unknown;
};

type ApiErrorLike = {
  response?: {
    data?: ApiErrorData;
  };
};

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return typeof error === "object" && error !== null && "response" in error;
}

export function getApiErrorData(error: unknown) {
  if (!isApiErrorLike(error)) return undefined;
  return error.response?.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  return getApiErrorData(error)?.message || fallback;
}
