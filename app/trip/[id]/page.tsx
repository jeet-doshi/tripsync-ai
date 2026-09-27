import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { RefreshButton } from "@/components/RefreshButton";
import { SetupNotice } from "@/components/SetupNotice";
import { ShareCard } from "@/components/ShareCard";
import { Alert, ArrowRight, Avatar, Chip, ProgressBar } from "@/components/ui";
import { computeGroupFacts, submittedOnly, topVotes } from "@/lib/groupFacts";
import { loadTripPage } from "@/lib/pageData";
import type { Participant } from "@/lib/types";
import { formatDateRange, formatDateTime, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Group dashboard" };

export default async function TripDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const { setupError, data, analysis } = await loadTripPage(id, { withAnalysis: true });
  if (setupError) return <SetupNotice message={setupError} />;
  if (!data) notFound();

  const { trip, participants } = data;
  const submitted = submittedOnly(participants);
  const pending = participants.filter((p) => !p.preferences);
  const unnamedSlots = Math.max(0, trip.expected_travellers - participants.length);
  const total = Math.max(trip.expected_travellers, participants.length);
  const facts = computeGroupFacts(submitted);
  const coordinator = participants.find((p) => p.is_coordinator);
  const coordinatorPending = coordinator && !coordinator.preferences;
  const allIn = submitted.length >= total;

  return (
    <div className="container-page py-10 sm:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Group dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Coordinated by {trip.coordinator_name} · Created {formatDateTime(trip.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          {analysis && (
            <Link href={`/trip/${trip.id}/results`} className="btn-primary btn-sm">
              View results <ArrowRight />
            </Link>
          )}
        </div>
      </div>

      {created && (
        <div className="mt-6">
          <Alert tone="success" title="Your trip is ready! 🎉">
            Copy the invite link below and drop it in your group chat.
            {coordinatorPending && " Don't forget to add your own preferences too."}
          </Alert>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: responses */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">Responses</h2>
              <p className="text-sm text-slate-500">
                <span className="text-2xl font-bold text-slate-900">{submitted.length}</span> of {total} received
              </p>
            </div>
            <ProgressBar value={(submitted.length / total) * 100} className="mt-4 h-2.5" />

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Submitted ({submitted.length})
                </h3>
                {submitted.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No responses yet. Share the link to get started.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {submitted.map((p) => (
                      <SubmittedRow key={p.id} participant={p} currency={trip.currency} />
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Still pending ({pending.length + unnamedSlots})
                </h3>
                {pending.length + unnamedSlots === 0 ? (
                  <p className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Everyone has responded! 🙌</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {pending.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <Avatar name={p.name} muted />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">
                            {p.name}
                            {p.is_coordinator && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-400">Waiting for preferences</p>
                        </div>
                        {p.is_coordinator && (
                          <Link href={`/trip/${trip.id}/join?name=${encodeURIComponent(p.name)}`} className="text-xs font-semibold text-indigo-600 hover:underline">
                            Add mine
                          </Link>
                        )}
                      </li>
                    ))}
                    {unnamedSlots > 0 && (
                      <li className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
                          +{unnamedSlots}
                        </span>
                        <p className="text-sm text-slate-500">
                          {unnamedSlots} more {unnamedSlots === 1 ? "traveller" : "travellers"} yet to join
                        </p>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {submitted.length > 0 && (
            <section className="card p-6">
              <h2 className="font-semibold">Group snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">A quick look at the raw numbers before the AI weighs in.</p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Stat
                  label="Budget range (per person)"
                  value={
                    facts.budget!.min === facts.budget!.max
                      ? formatMoney(facts.budget!.min, trip.currency)
                      : `${formatMoney(facts.budget!.min, trip.currency)} – ${formatMoney(facts.budget!.max, trip.currency)}`
                  }
                  note={`Lowest: ${facts.budget!.lowestNames.join(", ")}`}
                />
                <Stat
                  label="Dates everyone can make"
                  value={facts.dateOverlap ? formatDateRange(facts.dateOverlap.start, facts.dateOverlap.end) : "No common window"}
                  note={facts.dateOverlap ? `${facts.dateOverlap.days} days overlap` : "Someone will need to shift dates"}
                  warn={!facts.dateOverlap}
                />
                <Stat label="Top destination types" value={voteSummary(facts.destinationVotes)} />
                <Stat label="Top trip styles" value={voteSummary(facts.styleVotes)} />
              </dl>
            </section>
          )}
        </div>

        {/* Right: share + analyze */}
        <div className="space-y-6">
          <ShareCard tripId={trip.id} tripName={trip.name} highlight={Boolean(created)} />

          <section className="card p-6">
            <h2 className="font-semibold">Find your trip options</h2>
            <p className="mt-1 text-sm text-slate-600">
              {submitted.length === 0
                ? "Once at least one person responds, you can run the analysis."
                : allIn
                  ? "Everyone's in. Let the AI find options that balance the whole group."
                  : `You can analyze now with ${submitted.length} of ${total} responses, or wait for the rest. You can re-run it any time.`}
            </p>
            <AnalyzeButton
              tripId={trip.id}
              disabled={submitted.length === 0}
              label={analysis ? "Re-analyze with latest responses" : "Analyze Trip Options"}
              className="mt-5"
            />
            {analysis && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Last analyzed {formatDateTime(analysis.created_at)} with {analysis.response_count}{" "}
                {analysis.response_count === 1 ? "response" : "responses"}.{" "}
                <Link href={`/trip/${trip.id}/results`} className="font-medium text-indigo-600 hover:underline">
                  View
                </Link>
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function voteSummary(votes: Record<string, number>) {
  const top = topVotes(votes);
  return top.length ? top.map(([k, n]) => `${k} (${n})`).join(", ") : "—";
}

function Stat({ label, value, note, warn }: { label: string; value: string; note?: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
      {note && <dd className={warn ? "mt-0.5 text-xs text-amber-700" : "mt-0.5 text-xs text-slate-500"}>{note}</dd>}
    </div>
  );
}

function SubmittedRow({ participant, currency }: { participant: Participant; currency: string }) {
  const prefs = participant.preferences!;
  return (
    <li className="flex items-start gap-3">
      <Avatar name={participant.name} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {participant.name}
          {participant.is_coordinator && <span className="ml-1.5 text-xs font-normal text-indigo-600">Coordinator</span>}
        </p>
        <p className="text-xs text-slate-500">
          {formatMoney(prefs.budget_max, currency)} · {formatDateRange(prefs.available_start, prefs.available_end)} ·{" "}
          {prefs.flexibility} flex
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[...prefs.destination_types, ...prefs.trip_styles].map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>
    </li>
  );
}
