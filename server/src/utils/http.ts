export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown): never => {
  throw new HttpError(400, message, details);
};

export const unauthorized = (message = "Unauthorized"): never => {
  throw new HttpError(401, message);
};

export const forbidden = (message = "Forbidden"): never => {
  throw new HttpError(403, message);
};

export const notFound = (message = "Not found"): never => {
  throw new HttpError(404, message);
};

export const assertExists = <T>(value: T | null | undefined, message = "Not found"): T => {
  if (value === null || value === undefined) {
    throw new HttpError(404, message);
  }
  return value;
};
