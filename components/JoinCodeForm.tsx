"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "./ui";

/** Accepts either a full trip URL (…/trip/abc123/join) or just the code. */
function extractTripId(value: string) {
  const trimmed = value.trim();
  const fromUrl = trimmed.match(/\/trip\/([a-z0-9]{6,16})/i);
  const code = fromUrl ? fromUrl[1] : trimmed;
  return /^[a-z0-9]{6,16}$/i.test(code) ? code.toLowerCase() : null;
}

export function JoinCodeForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractTripId(value);
    if (!id) {
      setError("That doesn't look like a TripSync link or code. Check the message from your coordinator.");
      return;
    }
    router.push(`/trip/${id}/join`);
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor="code" className="label">
          Trip link or code
        </label>
        <input
          id="code"
          className="input"
          placeholder="e.g. k7m2p9xq"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          required
          autoFocus
        />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <button type="submit" className="btn-primary w-full">
        Continue
      </button>
    </form>
  );
}
