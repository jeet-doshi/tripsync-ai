import "server-only";
import { NextResponse } from "next/server";
import { isConfigError, isValidationError } from "./errors";

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Converts thrown errors into friendly JSON responses. */
export function handleApiError(e: unknown, fallback: string) {
  if (isValidationError(e)) return jsonError(e.message, 400);
  if (isConfigError(e)) return jsonError(e.message, 503);
  console.error(e);
  return jsonError(fallback, 500);
}
