import axios, { type AxiosError } from "axios";

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  validationErrors?: Record<string, unknown>;
  errors?: Record<string, unknown> | unknown[];
};

const GENERIC_HTTP_MESSAGES = new Set([
  "bad request",
  "unauthorized",
  "forbidden",
  "not found",
  "conflict",
  "internal server error",
  "request failed with status code 400",
  "request failed with status code 401",
  "request failed with status code 403",
  "request failed with status code 404",
  "request failed with status code 409",
  "request failed with status code 500",
]);

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE = "Cannot connect to the server. Check your connection and try again.";

export function getErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return getAxiosErrorMessages(error);
  }

  if (error instanceof Error && isMeaningfulMessage(error.message)) {
    return [error.message];
  }

  if (typeof error === "string" && isMeaningfulMessage(error)) {
    return [error];
  }

  return [DEFAULT_ERROR_MESSAGE];
}

export function getErrorMessage(error: unknown): string {
  return getErrorMessages(error).join("\n");
}

function getAxiosErrorMessages(error: AxiosError<ApiErrorBody>): string[] {
  if (!error.response) {
    return [NETWORK_ERROR_MESSAGE];
  }

  const data = error.response.data;
  const status = error.response.status;
  const validationMessages = extractValidationMessages(data);

  if (validationMessages.length > 0) {
    return validationMessages;
  }

  if (isMeaningfulMessage(data?.message)) {
    return [String(data.message).trim()];
  }

  if (status !== 500 && isMeaningfulMessage(data?.error)) {
    return [String(data.error).trim()];
  }

  if (status === 500) {
    return ["Server error. Please try again later."];
  }

  if (!status && isMeaningfulMessage(error.message)) {
    return [error.message.trim()];
  }

  return [DEFAULT_ERROR_MESSAGE];
}

function extractValidationMessages(data: ApiErrorBody | undefined): string[] {
  const validationErrors = data?.validationErrors ?? data?.errors;

  if (!validationErrors) {
    return [];
  }

  if (Array.isArray(validationErrors)) {
    return validationErrors
      .map((value) => String(value).trim())
      .filter(isMeaningfulMessage);
  }

  return Object.entries(validationErrors)
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(", ") : String(value);
      return field ? `${humanizeField(field)}: ${message}` : message;
    })
    .map((message) => message.trim())
    .filter(isMeaningfulMessage);
}

function humanizeField(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isMeaningfulMessage(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();
  return trimmed.length > 0 && !GENERIC_HTTP_MESSAGES.has(normalized);
}
