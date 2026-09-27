import { NextResponse } from "next/server";
import { analyzeGroup } from "@/lib/analysis";
import { handleApiError, jsonError } from "@/lib/api";
import { getTripWithParticipants, saveAnalysis } from "@/lib/db";
import { computeGroupFacts, submittedOnly } from "@/lib/groupFacts";

// Gemini can take 10–40s; give the Vercel function room.
export const maxDuration = 60;

// POST /api/trips/:id/analyze — run the AI analysis on all responses received so far
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getTripWithParticipants(id);
    if (!data) return jsonError("Trip not found.", 404);

    const submitted = submittedOnly(data.participants);
    if (submitted.length === 0) {
      return jsonError("No one has submitted preferences yet. Share the link first!", 400);
    }

    const facts = computeGroupFacts(submitted);
    const { result, model } = await analyzeGroup(data.trip, submitted, facts);
    const analysisId = await saveAnalysis(id, result, submitted.length, model);
    return NextResponse.json({ id: analysisId });
  } catch (e) {
    return handleApiError(e, "The AI analysis didn't work this time. Please try again in a moment.");
  }
}
