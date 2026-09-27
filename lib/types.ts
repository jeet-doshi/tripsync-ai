export type Flexibility = "low" | "medium" | "high";

export interface Trip {
  id: string;
  name: string;
  coordinator_name: string;
  expected_travellers: number;
  currency: string;
  created_at: string;
}

export interface Preferences {
  id: string;
  participant_id: string;
  budget_max: number;
  available_start: string; // YYYY-MM-DD
  available_end: string; // YYYY-MM-DD
  destination_types: string[];
  trip_styles: string[];
  must_haves: string;
  avoid: string;
  flexibility: Flexibility;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  trip_id: string;
  name: string;
  is_coordinator: boolean;
  created_at: string;
  preferences: Preferences | null;
}

export type SubmittedParticipant = Participant & { preferences: Preferences };

export interface TripWithParticipants {
  trip: Trip;
  participants: Participant[];
}

// ---- AI analysis output (stored as jsonb in analyses.result) ----

export interface ParticipantFit {
  name: string;
  fit: number; // 0–100
  reason: string;
  compromise: string; // empty string when no compromise needed
}

export interface TripOption {
  destination: string;
  region: string;
  groupFit: number; // 0–100
  whyItWorks: string;
  strengths: string[];
  tradeoffs: string[];
  estimatedCostPerPerson: string;
  suggestedDates: string;
  participantFit: ParticipantFit[];
}

export interface AnalysisResult {
  summary: string;
  agreements: string[];
  tradeoffs: string[];
  insights: {
    budget: string;
    dates: string;
    destinations: string;
    styles: string;
  };
  options: TripOption[];
}

export interface AnalysisRecord {
  id: string;
  trip_id: string;
  result: AnalysisResult;
  response_count: number;
  model: string | null;
  created_at: string;
}
