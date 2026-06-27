export function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function normalizeRequiredText(value, fieldName) {
  if (typeof value !== "string") {
    throw createHttpError(`${fieldName} must be a string`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  return trimmed;
}

export function normalizeOptionalText(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw createHttpError(`${fieldName} must be a string`, 400);
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function normalizePassword(value) {
  if (typeof value !== "string") {
    throw createHttpError("Password must be a string", 400);
  }

  if (!value.length) {
    throw createHttpError("Password is required", 400);
  }

  return value;
}

export function parsePositiveNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw createHttpError(`${fieldName} must be a positive number`, 400);
  }

  return parsed;
}

export function parseMonth(value) {
  if (!value) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) {
    throw createHttpError("Month must use YYYY-MM format", 400);
  }

  return value;
}

export function parseDateString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw createHttpError(`A valid ${fieldName.toLowerCase()} is required`, 400);
  }

  return value;
}
