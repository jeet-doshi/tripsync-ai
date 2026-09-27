"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Alert, Spinner } from "./ui";

const LOADING_STEPS = [
  "Reading everyone's preferences…",
  "Checking budgets and date windows…",
  "Looking for overlaps and conflicts…",
  "Balancing trade-offs across the group…",
  "Writing up your options…",
];

export function AnalyzeButton({
  tripId,
  disabled,
  label = "Analyze Trip Options",
  variant = "primary",
  className,
}: {
  tripId: string;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 4000);
    return () => clearInterval(timer);
  }, [loading]);

  async function analyze() {
    setError(null);
    setStep(0);
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/analyze`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The analysis failed. Please try again.");
      router.push(`/trip/${tripId}/results`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The analysis failed.");
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={analyze}
        disabled={disabled || loading}
        className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", "w-full")}
      >
        {loading ? (
          <>
            <Spinner /> Analyzing…
          </>
        ) : (
          label
        )}
      </button>
      {loading && (
        <p className="text-center text-xs text-slate-500" aria-live="polite">
          {LOADING_STEPS[step]} This usually takes 10–30 seconds.
        </p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
    </div>
  );
}
