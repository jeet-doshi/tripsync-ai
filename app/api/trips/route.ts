import { NextResponse } from "next/server";
import { handleApiError, readJson } from "@/lib/api";
import { createTrip } from "@/lib/db";
import { parseCreateTrip } from "@/lib/validation";

// POST /api/trips — create a trip and its coordinator
export async function POST(req: Request) {
  try {
    const input = parseCreateTrip(await readJson(req));
    const id = await createTrip(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return handleApiError(e, "We couldn't create your trip. Please try again.");
  }
}
