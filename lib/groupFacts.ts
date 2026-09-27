import type { Participant, SubmittedParticipant } from "./types";
import { daysBetweenInclusive, parseDay } from "./utils";

export function submittedOnly(participants: Participant[]): SubmittedParticipant[] {
  return participants.filter((p): p is SubmittedParticipant => p.preferences !== null);
}

export interface GroupFacts {
  responseCount: number;
  budget: { min: number; max: number; lowestNames: string[] } | null;
  dateOverlap: { start: string; end: string; days: number } | null;
  destinationVotes: Record<string, number>;
  styleVotes: Record<string, number>;
  flexibilityCounts: Record<string, number>;
}

function tally(lists: string[][]) {
  const counts: Record<string, number> = {};
  for (const list of lists) for (const item of list) counts[item] = (counts[item] ?? 0) + 1;
  return counts;
}

/** Deterministic facts computed from raw preferences — shown on the dashboard and fed to the AI as grounding. */
export function computeGroupFacts(participants: SubmittedParticipant[]): GroupFacts {
  const responseCount = participants.length;
  if (responseCount === 0) {
    return { responseCount, budget: null, dateOverlap: null, destinationVotes: {}, styleVotes: {}, flexibilityCounts: {} };
  }

  const budgets = participants.map((p) => p.preferences.budget_max);
  const min = Math.min(...budgets);
  const max = Math.max(...budgets);

  const latestStart = participants.map((p) => p.preferences.available_start).reduce((a, b) => (parseDay(a) > parseDay(b) ? a : b));
  const earliestEnd = participants.map((p) => p.preferences.available_end).reduce((a, b) => (parseDay(a) < parseDay(b) ? a : b));
  const dateOverlap =
    parseDay(earliestEnd) >= parseDay(latestStart)
      ? { start: latestStart, end: earliestEnd, days: daysBetweenInclusive(latestStart, earliestEnd) }
      : null;

  return {
    responseCount,
    budget: {
      min,
      max,
      lowestNames: participants.filter((p) => p.preferences.budget_max === min).map((p) => p.name),
    },
    dateOverlap,
    destinationVotes: tally(participants.map((p) => p.preferences.destination_types)),
    styleVotes: tally(participants.map((p) => p.preferences.trip_styles)),
    flexibilityCounts: tally(participants.map((p) => [p.preferences.flexibility])),
  };
}

export function topVotes(votes: Record<string, number>, limit = 3) {
  return Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
