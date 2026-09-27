import "server-only";
import { getLatestAnalysis, getTripWithParticipants } from "./db";
import { isConfigError } from "./errors";
import type { AnalysisRecord, TripWithParticipants } from "./types";

type Loaded =
  | { setupError: string; data: null; analysis: null }
  | { setupError: null; data: TripWithParticipants | null; analysis: AnalysisRecord | null };

/** Loads everything a trip page needs; turns missing env vars into a friendly setup message. */
export async function loadTripPage(tripId: string, { withAnalysis = false } = {}): Promise<Loaded> {
  try {
    const data = await getTripWithParticipants(tripId);
    const analysis = withAnalysis && data ? await getLatestAnalysis(tripId) : null;
    return { setupError: null, data, analysis };
  } catch (e) {
    if (isConfigError(e)) return { setupError: e.message, data: null, analysis: null };
    throw e;
  }
}
