"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CURRENCIES, MAX_TRAVELLERS } from "@/lib/constants";
import { Alert, Spinner } from "./ui";

export function CreateTripForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [travellers, setTravellers] = useState("5");
  const [currency, setCurrency] = useState("INR");
  const [friends, setFriends] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          coordinatorName,
          travellers: Number(travellers),
          currency,
          friendNames: friends.split(/[,\n]/).map((f) => f.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      router.push(`/trip/${data.id}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-6 p-6 sm:p-8">
      <div>
        <label htmlFor="trip-name" className="label">
          Trip name
        </label>
        <input
          id="trip-name"
          className="input"
          placeholder="e.g. Goa or bust 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="coordinator" className="label">
          Your name
        </label>
        <input
          id="coordinator"
          className="input"
          placeholder="e.g. Riya"
          value={coordinatorName}
          onChange={(e) => setCoordinatorName(e.target.value)}
          maxLength={60}
          required
        />
        <p className="hint mt-1.5">You&apos;ll be the trip coordinator.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="travellers" className="label">
            How many travellers?
          </label>
          <input
            id="travellers"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_TRAVELLERS}
            className="input"
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            required
          />
          <p className="hint mt-1.5">Including you. An estimate is fine.</p>
        </div>
        <div>
          <label htmlFor="currency" className="label">
            Budget currency
          </label>
          <select id="currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="friends" className="label">
          Friends&apos; names <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="friends"
          className="input"
          placeholder="Arjun, Meera, Kabir, Zoya"
          value={friends}
          onChange={(e) => setFriends(e.target.value)}
        />
        <p className="hint mt-1.5">Separate with commas. Lets you see exactly who hasn&apos;t responded yet.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Creating trip…
          </>
        ) : (
          "Create trip & get link"
        )}
      </button>
    </form>
  );
}
