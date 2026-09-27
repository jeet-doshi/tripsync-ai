import type { Flexibility } from "./types";

export const DESTINATION_TYPES = [
  { value: "Beach", emoji: "🏖️" },
  { value: "Mountains", emoji: "🏔️" },
  { value: "City", emoji: "🏙️" },
  { value: "Nature", emoji: "🌿" },
  { value: "Any", emoji: "✨" },
] as const;

export const TRIP_STYLES = [
  { value: "Relaxation", emoji: "🧘" },
  { value: "Adventure", emoji: "🧗" },
  { value: "Nightlife", emoji: "🎉" },
  { value: "Culture", emoji: "🏛️" },
  { value: "Food", emoji: "🍜" },
  { value: "Mixed", emoji: "🎒" },
] as const;

/** Selecting one of these clears the other choices in its group (and vice versa). */
export const EXCLUSIVE_CHOICES = ["Any", "Mixed"];

export const FLEXIBILITY_OPTIONS: { value: Flexibility; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "My dates and budget are fixed." },
  { value: "medium", label: "Medium", description: "I can stretch a little if needed." },
  { value: "high", label: "High", description: "I'm easy — happy to go with the group." },
];

export const CURRENCIES = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "AUD", label: "A$ AUD" },
  { code: "CAD", label: "C$ CAD" },
  { code: "SGD", label: "S$ SGD" },
  { code: "AED", label: "AED" },
];

export const DESTINATION_VALUES: string[] = DESTINATION_TYPES.map((d) => d.value);
export const STYLE_VALUES: string[] = TRIP_STYLES.map((s) => s.value);
export const CURRENCY_CODES: string[] = CURRENCIES.map((c) => c.code);
export const FLEXIBILITY_VALUES: string[] = FLEXIBILITY_OPTIONS.map((f) => f.value);

export const MAX_TRAVELLERS = 50;
