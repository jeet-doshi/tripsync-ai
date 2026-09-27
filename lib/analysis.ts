import "server-only";
import { generateJson, geminiModel } from "./gemini";
import type { GroupFacts } from "./groupFacts";
import type { AnalysisResult, ParticipantFit, SubmittedParticipant, Trip, TripOption } from "./types";

const SYSTEM_PROMPT = `You are TripSync AI, a neutral decision-support assistant for a group of friends planning a trip together.

Your job is to help the group decide — never to decide for them.

Analyse the structured preferences you are given and identify:
- common preferences, and conflicting preferences
- budget constraints (the lowest budget is a hard ceiling unless that person is highly flexible)
- date compatibility (use the pre-computed common date window when one exists)
- destination-type overlap and trip-style / activity overlap
- important trade-offs between people

Then propose 2 or 3 realistic, distinct trip destinations that best balance the whole group.

Rules:
- Return 3 options unless the constraints genuinely only support 2. Make the options meaningfully different (e.g. different destination types or price points), so the group has a real choice.
- Do NOT declare any option the single best or a winner. Present each option's strengths and trade-offs honestly.
- Destinations must be realistic for the budgets: infer the group's likely home region from the currency (e.g. INR → India, GBP → UK) and include travel and stay costs in your per-person estimate, written in the group's currency.
- Suggest concrete dates inside the common availability window if one exists. If there is none, say who would need to shift their dates.
- "participantFit" must contain exactly one entry for EVERY participant listed, using their exact name. "fit" is 0–100 and reflects that person's budget, dates, destination types, trip styles, must-haves and things they want to avoid.
- "compromise" says what that person would have to give up or accept for this option. Use an empty string if they need no real compromise.
- "groupFit" (0–100) should roughly reflect the participant fits, lowered if any hard constraint (budget, dates, an explicit "avoid") is broken.
- Respect every "avoid" item; if an option conflicts with one, name it as a trade-off.
- Be concise and specific. whyItWorks: at most 2 sentences. Each strength / trade-off / agreement: one short phrase or sentence. 2–4 strengths and 2–4 trade-offs per option. 3–5 agreements and 3–5 group trade-offs.
- Use a friendly, neutral tone. Refer to people by name.`;

const stringList = (description: string) => ({ type: "ARRAY", items: { type: "STRING" }, description });

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "2–3 sentence neutral overview of the group's situation." },
    agreements: stringList("Where the group agrees."),
    tradeoffs: stringList("Where the group has conflicts or trade-offs to resolve."),
    insights: {
      type: "OBJECT",
      properties: {
        budget: { type: "STRING", description: "One sentence on budget constraints." },
        dates: { type: "STRING", description: "One sentence on date compatibility." },
        destinations: { type: "STRING", description: "One sentence on destination-type overlap." },
        styles: { type: "STRING", description: "One sentence on trip-style / activity overlap." },
      },
      required: ["budget", "dates", "destinations", "styles"],
    },
    options: {
      type: "ARRAY",
      description: "2–3 distinct destination options.",
      items: {
        type: "OBJECT",
        properties: {
          destination: { type: "STRING", description: "Destination name, e.g. 'Goa'." },
          region: { type: "STRING", description: "State / country, e.g. 'India'." },
          groupFit: { type: "INTEGER", description: "Overall group fit, 0–100." },
          whyItWorks: { type: "STRING" },
          strengths: stringList("Key strengths for this group."),
          tradeoffs: stringList("Key trade-offs for this group."),
          estimatedCostPerPerson: { type: "STRING", description: "Rough all-in cost per person in the group's currency." },
          suggestedDates: { type: "STRING", description: "Suggested travel dates and trip length." },
          participantFit: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                fit: { type: "INTEGER", description: "0–100" },
                reason: { type: "STRING", description: "One short sentence on why this fits (or doesn't) for them." },
                compromise: { type: "STRING", description: "What they would need to compromise on, or empty string." },
              },
              required: ["name", "fit", "reason", "compromise"],
            },
          },
        },
        required: [
          "destination",
          "region",
          "groupFit",
          "whyItWorks",
          "strengths",
          "tradeoffs",
          "estimatedCostPerPerson",
          "suggestedDates",
          "participantFit",
        ],
      },
    },
  },
  required: ["summary", "agreements", "tradeoffs", "insights", "options"],
};

function buildPrompt(trip: Trip, participants: SubmittedParticipant[], facts: GroupFacts) {
  const data = {
    trip: {
      name: trip.name,
      currency: trip.currency,
      expectedTravellers: trip.expected_travellers,
      responsesReceived: participants.length,
    },
    participants: participants.map((p) => ({
      name: p.name,
      maxBudgetPerPerson: p.preferences.budget_max,
      availableFrom: p.preferences.available_start,
      availableTo: p.preferences.available_end,
      destinationTypes: p.preferences.destination_types,
      tripStyles: p.preferences.trip_styles,
      mustHaves: p.preferences.must_haves || "(none)",
      avoid: p.preferences.avoid || "(none)",
      flexibility: p.preferences.flexibility,
    })),
    computedFacts: {
      lowestBudget: facts.budget?.min,
      highestBudget: facts.budget?.max,
      lowestBudgetBelongsTo: facts.budget?.lowestNames,
      commonDateWindow: facts.dateOverlap ?? "No date range where everyone is available.",
      destinationTypeVotes: facts.destinationVotes,
      tripStyleVotes: facts.styleVotes,
    },
  };

  const partialNote =
    participants.length < trip.expected_travellers
      ? `\nNote: only ${participants.length} of ${trip.expected_travellers} travellers have responded. Base the options on the responses available and mention in the summary that results may change as others respond.`
      : "";

  return `Here is the group's data as JSON:\n\n${JSON.stringify(data, null, 2)}\n${partialNote}\n\nAnalyse it and return the trip options.`;
}

// ---------------------------------------------------------------- output clean-up

const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown, max = 5) =>
  (Array.isArray(v) ? v : []).map(text).filter(Boolean).slice(0, max);

/** Make sure the AI output is well-formed and every participant appears in every option. */
function normalize(raw: Partial<AnalysisResult>, names: string[]): AnalysisResult {
  const options: TripOption[] = (Array.isArray(raw.options) ? raw.options : [])
    .filter((o) => o && text(o.destination))
    .slice(0, 3)
    .map((o) => {
      const fits = Array.isArray(o.participantFit) ? o.participantFit : [];
      const participantFit: ParticipantFit[] = names.map((name) => {
        const match = fits.find((f) => text(f?.name).toLowerCase() === name.toLowerCase());
        return match
          ? { name, fit: clamp(match.fit), reason: text(match.reason), compromise: text(match.compromise) }
          : { name, fit: 50, reason: "The AI didn't assess this person for this option.", compromise: "" };
      });
      return {
        destination: text(o.destination),
        region: text(o.region),
        groupFit: clamp(o.groupFit),
        whyItWorks: text(o.whyItWorks),
        strengths: list(o.strengths, 4),
        tradeoffs: list(o.tradeoffs, 4),
        estimatedCostPerPerson: text(o.estimatedCostPerPerson),
        suggestedDates: text(o.suggestedDates),
        participantFit,
      };
    });

  const insights = raw.insights ?? { budget: "", dates: "", destinations: "", styles: "" };
  return {
    summary: text(raw.summary),
    agreements: list(raw.agreements),
    tradeoffs: list(raw.tradeoffs),
    insights: {
      budget: text(insights.budget),
      dates: text(insights.dates),
      destinations: text(insights.destinations),
      styles: text(insights.styles),
    },
    options,
  };
}

export async function analyzeGroup(trip: Trip, participants: SubmittedParticipant[], facts: GroupFacts) {
  const names = participants.map((p) => p.name);
  const prompt = buildPrompt(trip, participants, facts);

  let result: AnalysisResult | null = null;
  // One retry covers the occasional malformed or too-short response.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await generateJson<Partial<AnalysisResult>>({ system: SYSTEM_PROMPT, prompt, schema: RESPONSE_SCHEMA });
      result = normalize(raw, names);
      if (result.options.length >= 2) break;
    } catch (e) {
      if (attempt === 1 || !(e instanceof SyntaxError)) throw e;
    }
  }
  if (!result || result.options.length === 0) {
    throw new Error("The AI didn't return any trip options. Please try again.");
  }
  return { result, model: geminiModel() };
}
