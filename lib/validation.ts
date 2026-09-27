import {
  CURRENCY_CODES,
  DESTINATION_VALUES,
  EXCLUSIVE_CHOICES,
  FLEXIBILITY_VALUES,
  MAX_TRAVELLERS,
  STYLE_VALUES,
} from "./constants";
import { ValidationError } from "./errors";
import type { Flexibility } from "./types";
import { cleanName, nameKey, parseDay } from "./utils";

export interface CreateTripInput {
  name: string;
  coordinatorName: string;
  travellers: number;
  currency: string;
  friendNames: string[];
}

export interface PreferenceInput {
  name: string;
  budgetMax: number;
  availableStart: string;
  availableEnd: string;
  destinationTypes: string[];
  tripStyles: string[];
  mustHaves: string;
  avoid: string;
  flexibility: Flexibility;
}

type Body = Record<string, unknown>;

function str(body: Body, key: string, label: string, { min = 1, max = 120 } = {}) {
  const raw = body[key];
  const value = typeof raw === "string" ? cleanName(raw) : "";
  if (value.length < min) throw new ValidationError(`${label} is required.`);
  if (value.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`);
  return value;
}

function longText(body: Body, key: string, label: string, max = 500) {
  const raw = body[key];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`);
  return value;
}

function choiceList(body: Body, key: string, allowed: string[], label: string) {
  const raw = body[key];
  const list = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string" && allowed.includes(v)) : [];
  const unique = Array.from(new Set(list));
  if (unique.length === 0) throw new ValidationError(`Pick at least one ${label}.`);
  const exclusive = unique.find((v) => EXCLUSIVE_CHOICES.includes(v));
  return exclusive ? [exclusive] : unique;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseCreateTrip(body: Body): CreateTripInput {
  const name = str(body, "name", "Trip name");
  const coordinatorName = str(body, "coordinatorName", "Your name", { max: 60 });
  const travellers = Number(body.travellers);
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > MAX_TRAVELLERS) {
    throw new ValidationError(`Number of travellers must be between 1 and ${MAX_TRAVELLERS}.`);
  }
  const currency = typeof body.currency === "string" && CURRENCY_CODES.includes(body.currency) ? body.currency : "INR";

  const rawFriends = Array.isArray(body.friendNames) ? body.friendNames : [];
  const seen = new Set([nameKey(coordinatorName)]);
  const friendNames: string[] = [];
  for (const f of rawFriends) {
    if (typeof f !== "string") continue;
    const clean = cleanName(f).slice(0, 60);
    if (!clean || seen.has(nameKey(clean))) continue;
    seen.add(nameKey(clean));
    friendNames.push(clean);
  }
  if (friendNames.length + 1 > MAX_TRAVELLERS) throw new ValidationError("Too many travellers.");

  return { name, coordinatorName, travellers, currency, friendNames };
}

export function parsePreferences(body: Body): PreferenceInput {
  const name = str(body, "name", "Your name", { max: 60 });

  const budgetMax = Math.round(Number(body.budgetMax));
  if (!Number.isFinite(budgetMax) || budgetMax <= 0) throw new ValidationError("Enter your maximum budget per person.");
  if (budgetMax > 100_000_000) throw new ValidationError("That budget looks too large — please double-check it.");

  const availableStart = typeof body.availableStart === "string" ? body.availableStart : "";
  const availableEnd = typeof body.availableEnd === "string" ? body.availableEnd : "";
  if (!DAY_RE.test(availableStart) || !DAY_RE.test(availableEnd)) {
    throw new ValidationError("Enter both your available start and end dates.");
  }
  if (parseDay(availableEnd) < parseDay(availableStart)) {
    throw new ValidationError("Your end date must be on or after your start date.");
  }

  const flexibility = body.flexibility;
  if (typeof flexibility !== "string" || !FLEXIBILITY_VALUES.includes(flexibility)) {
    throw new ValidationError("Choose how flexible you are.");
  }

  return {
    name,
    budgetMax,
    availableStart,
    availableEnd,
    destinationTypes: choiceList(body, "destinationTypes", DESTINATION_VALUES, "destination type"),
    tripStyles: choiceList(body, "tripStyles", STYLE_VALUES, "trip style"),
    mustHaves: longText(body, "mustHaves", "Must-haves"),
    avoid: longText(body, "avoid", "Things to avoid"),
    flexibility: flexibility as Flexibility,
  };
}

export const TRIP_ID_RE = /^[a-z0-9]{6,16}$/;
