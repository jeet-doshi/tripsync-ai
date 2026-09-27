import "server-only";
import { randomBytes } from "crypto";
import { getSupabase } from "./supabase";
import type { AnalysisRecord, AnalysisResult, Participant, Preferences, Trip, TripWithParticipants } from "./types";
import { nameKey } from "./utils";
import { TRIP_ID_RE, type CreateTripInput, type PreferenceInput } from "./validation";

// No look-alike characters (0/o, 1/l/i) so codes are easy to read aloud.
const ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function generateTripId(length = 8) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

function fail(action: string, message: string): never {
  throw new Error(`Could not ${action}: ${message}`);
}

// ---------------------------------------------------------------- reads

export async function getTripWithParticipants(tripId: string): Promise<TripWithParticipants | null> {
  if (!TRIP_ID_RE.test(tripId)) return null;
  const supabase = getSupabase();

  const { data: trip, error } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();
  if (error) fail("load trip", error.message);
  if (!trip) return null;

  const { data: rows, error: pErr } = await supabase
    .from("participants")
    .select("id, trip_id, name, is_coordinator, created_at, preferences(*)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (pErr) fail("load participants", pErr.message);

  const participants: Participant[] = (rows ?? []).map((r) => {
    // PostgREST returns a one-to-one relation as an object, but normalise just in case.
    const prefs = r.preferences as unknown as Preferences | Preferences[] | null;
    return {
      id: r.id,
      trip_id: r.trip_id,
      name: r.name,
      is_coordinator: r.is_coordinator,
      created_at: r.created_at,
      preferences: Array.isArray(prefs) ? (prefs[0] ?? null) : prefs,
    };
  });
  participants.sort((a, b) => Number(b.is_coordinator) - Number(a.is_coordinator));

  return { trip: trip as Trip, participants };
}

export async function getLatestAnalysis(tripId: string): Promise<AnalysisRecord | null> {
  if (!TRIP_ID_RE.test(tripId)) return null;
  const { data, error } = await getSupabase()
    .from("analyses")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("load analysis", error.message);
  return (data as AnalysisRecord | null) ?? null;
}

// ---------------------------------------------------------------- writes

export async function createTrip(input: CreateTripInput): Promise<string> {
  const supabase = getSupabase();
  const expected = Math.max(input.travellers, input.friendNames.length + 1);

  let tripId = "";
  for (let attempt = 0; attempt < 3 && !tripId; attempt++) {
    const id = generateTripId();
    const { error } = await supabase.from("trips").insert({
      id,
      name: input.name,
      coordinator_name: input.coordinatorName,
      expected_travellers: expected,
      currency: input.currency,
    });
    if (!error) tripId = id;
    else if (error.code !== "23505") fail("create trip", error.message); // 23505 = id collision, retry
  }
  if (!tripId) fail("create trip", "please try again");

  const people = [
    { trip_id: tripId, name: input.coordinatorName, is_coordinator: true },
    ...input.friendNames.map((name) => ({ trip_id: tripId, name, is_coordinator: false })),
  ];
  const { error: pErr } = await supabase.from("participants").insert(people);
  if (pErr) fail("add travellers", pErr.message);

  return tripId;
}

/** Creates the participant if their name is new to this trip, then inserts or updates their preferences. */
export async function submitPreferences(trip: Trip, input: PreferenceInput) {
  const supabase = getSupabase();
  const key = nameKey(input.name);

  const findParticipant = () =>
    supabase.from("participants").select("id").eq("trip_id", trip.id).eq("name_key", key).maybeSingle();

  let { data: participant, error } = await findParticipant();
  if (error) fail("look up participant", error.message);

  if (!participant) {
    const inserted = await supabase
      .from("participants")
      .insert({ trip_id: trip.id, name: input.name, is_coordinator: false })
      .select("id")
      .single();
    if (inserted.error?.code === "23505") {
      // Someone with the same name submitted at the same moment — use their row.
      ({ data: participant } = await findParticipant());
    } else if (inserted.error) {
      fail("add participant", inserted.error.message);
    } else {
      participant = inserted.data;
    }

    // Keep "X of Y responded" honest if more people join than the coordinator expected.
    const { count } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", trip.id);
    if (count && count > trip.expected_travellers) {
      await supabase.from("trips").update({ expected_travellers: count }).eq("id", trip.id);
    }
  }
  if (!participant) fail("add participant", "please try again");

  const { error: prefErr } = await supabase.from("preferences").upsert(
    {
      participant_id: participant.id,
      budget_max: input.budgetMax,
      available_start: input.availableStart,
      available_end: input.availableEnd,
      destination_types: input.destinationTypes,
      trip_styles: input.tripStyles,
      must_haves: input.mustHaves,
      avoid: input.avoid,
      flexibility: input.flexibility,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "participant_id" },
  );
  if (prefErr) fail("save preferences", prefErr.message);

  return participant.id as string;
}

export async function saveAnalysis(tripId: string, result: AnalysisResult, responseCount: number, model: string) {
  const { data, error } = await getSupabase()
    .from("analyses")
    .insert({ trip_id: tripId, result, response_count: responseCount, model })
    .select("id")
    .single();
  if (error) fail("save analysis", error.message);
  return data.id as string;
}
