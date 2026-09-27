import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { OptionCard } from "@/components/OptionCard";
import { SetupNotice } from "@/components/SetupNotice";
import { Alert, CheckIcon, ScaleIcon } from "@/components/ui";
import { submittedOnly } from "@/lib/groupFacts";
import { loadTripPage } from "@/lib/pageData";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trip options" };

const OPTION_LABELS = ["Option A", "Option B", "Option C"];

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { setupError, data, analysis } = await loadTripPage(id, { withAnalysis: true });
  if (setupError) return <SetupNotice message={setupError} />;
  if (!data) notFound();

  const { trip, participants } = data;
  const submitted = submittedOnly(participants);
  const total = Math.max(trip.expected_travellers, participants.length);

  if (!analysis) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <p className="text-4xl">🧭</p>
          <h1 className="mt-3 text-xl font-semibold">No trip options yet</h1>
          <p className="mt-2 text-sm text-slate-600">
            {submitted.length === 0
              ? "Nobody has shared their preferences yet. Invite the group from the dashboard first."
              : `${submitted.length} of ${total} people have responded. Run the analysis to see your options.`}
          </p>
          <AnalyzeButton tripId={trip.id} disabled={submitted.length === 0} className="mx-auto mt-6 max-w-xs" />
          <Link href={`/trip/${trip.id}`} className="btn-ghost btn-sm mt-3">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { result } = analysis;
  const analyzedAt = new Date(analysis.created_at).getTime();
  const newResponses = submitted.filter((p) => new Date(p.preferences.updated_at).getTime() > analyzedAt).length;

  const insights = [
    { label: "Budget", icon: "💰", text: result.insights.budget },
    { label: "Dates", icon: "📅", text: result.insights.dates },
    { label: "Destinations", icon: "🗺️", text: result.insights.destinations },
    { label: "Trip style", icon: "🎒", text: result.insights.styles },
  ].filter((i) => i.text);

  return (
    <div className="container-page py-10 sm:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href={`/trip/${trip.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
            ← {trip.name}
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your Group&apos;s Trip Options</h1>
          <p className="mt-2 text-sm text-slate-500">
            Based on {analysis.response_count} of {total} responses · Generated {formatDateTime(analysis.created_at)}
          </p>
        </div>
        <AnalyzeButton tripId={trip.id} label="Re-analyze" variant="secondary" className="sm:w-48" />
      </div>

      <div className="mt-6 space-y-3">
        {newResponses > 0 && (
          <Alert tone="warning" title="New responses since this analysis">
            {newResponses} {newResponses === 1 ? "person has" : "people have"} submitted or updated preferences. Re-analyze
            to include them.
          </Alert>
        )}
        {analysis.response_count < total && newResponses === 0 && (
          <Alert tone="info">
            {total - analysis.response_count} {total - analysis.response_count === 1 ? "traveller hasn't" : "travellers haven't"}{" "}
            responded yet, so these options may change once everyone&apos;s in.
          </Alert>
        )}
      </div>

      {/* Summary */}
      <section className="card mt-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">The big picture</h2>
          <span className="badge bg-indigo-50 text-indigo-700 ring-indigo-200">AI suggests · your group decides</span>
        </div>
        <p className="mt-3 leading-relaxed text-slate-700">{result.summary}</p>
        {insights.length > 0 && (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((i) => (
              <div key={i.label} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-semibold text-slate-500">
                  <span aria-hidden>{i.icon}</span> {i.label}
                </dt>
                <dd className="mt-1 text-sm text-slate-700">{i.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Agree / trade-offs */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <CheckIcon />
            </span>
            Where the group agrees
          </h2>
          <ul className="mt-4 space-y-2.5">
            {result.agreements.map((a) => (
              <li key={a} className="flex gap-2.5 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {a}
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-amber-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
              <ScaleIcon />
            </span>
            Where the group has trade-offs
          </h2>
          <ul className="mt-4 space-y-2.5">
            {result.tradeoffs.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Options */}
      <section className="mt-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-xl font-bold tracking-tight">{result.options.length} options to discuss</h2>
          <p className="text-sm text-slate-500">No single right answer — compare the trade-offs together.</p>
        </div>
        <div className={cn("mt-5 grid items-start gap-6", result.options.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
          {result.options.map((option, i) => (
            <OptionCard key={`${option.destination}-${i}`} option={option} label={OPTION_LABELS[i] ?? `Option ${i + 1}`} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl bg-indigo-50 px-6 py-6 text-sm text-indigo-900 ring-1 ring-inset ring-indigo-100">
        <p className="font-semibold">What next?</p>
        <p className="mt-1 text-indigo-800">
          Share these options with the group and pick one together. Fit scores are AI estimates based on what everyone
          entered — use them to guide the conversation, not to end it. Costs and dates are rough and should be checked
          before booking.
        </p>
      </section>
    </div>
  );
}
