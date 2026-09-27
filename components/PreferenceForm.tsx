"use client";

import Link from "next/link";
import { useState } from "react";
import { CURRENCIES, DESTINATION_TYPES, EXCLUSIVE_CHOICES, FLEXIBILITY_OPTIONS, TRIP_STYLES } from "@/lib/constants";
import type { Flexibility } from "@/lib/types";
import { cn, nameKey } from "@/lib/utils";
import { Alert, CheckIcon, Spinner } from "./ui";

interface Props {
  tripId: string;
  currency: string;
  pendingNames: string[];
  submittedNames: string[];
  initialName?: string;
}

function toggleChoice(list: string[], value: string) {
  if (list.includes(value)) return list.filter((v) => v !== value);
  if (EXCLUSIVE_CHOICES.includes(value)) return [value];
  return [...list.filter((v) => !EXCLUSIVE_CHOICES.includes(v)), value];
}

function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-slate-100 pt-6 first:border-0 first:pt-0">
      <legend className="flex items-center gap-2.5 text-base font-semibold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
          {step}
        </span>
        {title}
      </legend>
      {hint && <p className="hint ml-[34px] mt-1">{hint}</p>}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

function ChoiceChips({
  options,
  selected,
  onToggle,
}: {
  options: readonly { value: string; emoji: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition-colors",
              active
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400",
            )}
          >
            <span aria-hidden>{o.emoji}</span>
            {o.value}
          </button>
        );
      })}
    </div>
  );
}

export function PreferenceForm({ tripId, currency, pendingNames, submittedNames, initialName = "" }: Props) {
  const [name, setName] = useState(initialName);
  const [budget, setBudget] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [destinationTypes, setDestinationTypes] = useState<string[]>([]);
  const [tripStyles, setTripStyles] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState("");
  const [avoid, setAvoid] = useState("");
  const [flexibility, setFlexibility] = useState<Flexibility>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; updated: boolean } | null>(null);

  const currencyLabel = CURRENCIES.find((c) => c.code === currency)?.label ?? currency;
  const [mySubmittedKey, setMySubmittedKey] = useState<string | null>(null);
  const isResubmission = mySubmittedKey === nameKey(name) || submittedNames.some((n) => nameKey(n) === nameKey(name));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (destinationTypes.length === 0) return setError("Pick at least one destination type (or “Any”).");
    if (tripStyles.length === 0) return setError("Pick at least one trip style (or “Mixed”).");
    if (start && end && end < start) return setError("Your end date must be on or after your start date.");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          budgetMax: Number(budget),
          availableStart: start,
          availableEnd: end,
          destinationTypes,
          tripStyles,
          mustHaves,
          avoid,
          flexibility,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone({ name: name.trim(), updated: isResubmission });
      setMySubmittedKey(nameKey(name));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card mt-8 p-8 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">
          {done.updated ? "Your answers are updated" : `Thanks, ${done.name}! You're in.`}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          Your preferences are saved. Once more of the group responds, your coordinator can generate trip options.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/trip/${tripId}`} className="btn-primary">
            See group status
          </Link>
          <button type="button" className="btn-secondary" onClick={() => setDone(null)}>
            Edit my answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-6 p-6 sm:p-8">
      <Section step={1} title="Who are you?">
        <input
          id="name"
          aria-label="Your name"
          className="input"
          placeholder="Your name"
          list="pending-names"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
        />
        <datalist id="pending-names">
          {pendingNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        {isResubmission && (
          <p className="mt-2 text-xs text-amber-700">
            {name.trim()} has already responded — submitting again will replace those answers.
          </p>
        )}
      </Section>

      <Section step={2} title="Maximum budget per person" hint="All-in: travel, stay, food and activities.">
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-500">
            {currencyLabel}
          </span>
          <input
            id="budget"
            aria-label="Maximum budget per person"
            type="number"
            inputMode="numeric"
            min={1}
            step="any"
            className="input pl-[4.5rem]"
            placeholder="25000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>
      </Section>

      <Section step={3} title="When are you free?" hint="The widest window you could travel in.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start" className="label">
              Available from
            </label>
            <input id="start" type="date" className="input" min={todayIso()} value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="end" className="label">
              Available until
            </label>
            <input id="end" type="date" className="input" min={start || todayIso()} value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
        </div>
      </Section>

      <Section step={4} title="What kind of destination?" hint="Pick as many as you like.">
        <ChoiceChips options={DESTINATION_TYPES} selected={destinationTypes} onToggle={(v) => setDestinationTypes((l) => toggleChoice(l, v))} />
      </Section>

      <Section step={5} title="What kind of trip?" hint="Pick as many as you like.">
        <ChoiceChips options={TRIP_STYLES} selected={tripStyles} onToggle={(v) => setTripStyles((l) => toggleChoice(l, v))} />
      </Section>

      <Section step={6} title="Must-haves and deal-breakers" hint="Optional, but it really helps the AI.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="must" className="label">
              Must-haves
            </label>
            <textarea
              id="must"
              rows={3}
              className="input resize-none"
              placeholder="e.g. a pool, vegetarian food, one trek"
              value={mustHaves}
              onChange={(e) => setMustHaves(e.target.value)}
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="avoid" className="label">
              Want to avoid
            </label>
            <textarea
              id="avoid"
              rows={3}
              className="input resize-none"
              placeholder="e.g. long bus rides, extreme heat, crowds"
              value={avoid}
              onChange={(e) => setAvoid(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>
      </Section>

      <Section step={7} title="How flexible are you?">
        <div className="grid gap-3 sm:grid-cols-3">
          {FLEXIBILITY_OPTIONS.map((f) => {
            const active = flexibility === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFlexibility(f.value)}
                className={cn(
                  "rounded-xl p-4 text-left ring-1 ring-inset transition-colors",
                  active ? "bg-indigo-50 ring-2 ring-indigo-600" : "bg-white ring-slate-300 hover:bg-slate-50",
                )}
              >
                <p className={cn("text-sm font-semibold", active ? "text-indigo-700" : "text-slate-900")}>{f.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{f.description}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {error && <Alert tone="error">{error}</Alert>}

      <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Saving…
          </>
        ) : (
          "Submit my preferences"
        )}
      </button>
    </form>
  );
}
