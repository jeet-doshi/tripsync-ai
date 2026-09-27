import { NextResponse } from "next/server";
import { handleApiError, jsonError, readJson } from "@/lib/api";
import { getTripWithParticipants, submitPreferences } from "@/lib/db";
import { parsePreferences } from "@/lib/validation";

// POST /api/trips/:id/responses — submit (or update) one traveller's preferences
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = parsePreferences(await readJson(req));
    const data = await getTripWithParticipants(id);
    if (!data) return jsonError("This trip doesn't exist. Check the link with your coordinator.", 404);

    const participantId = await submitPreferences(data.trip, input);
    return NextResponse.json({ participantId }, { status: 201 });
  } catch (e) {
    return handleApiError(e, "We couldn't save your preferences. Please try again.");
  }
}
