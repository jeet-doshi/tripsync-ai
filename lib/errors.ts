/** Thrown when a required environment variable (Supabase / Gemini) is missing. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function isConfigError(e: unknown): e is ConfigError {
  return e instanceof Error && e.name === "ConfigError";
}

/** Thrown for bad user input; API routes turn it into a 400 response. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function isValidationError(e: unknown): e is ValidationError {
  return e instanceof Error && e.name === "ValidationError";
}
