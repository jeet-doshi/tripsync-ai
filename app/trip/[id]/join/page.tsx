import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreferenceForm } from "@/components/PreferenceForm";
import { SetupNotice } from "@/components/SetupNotice";
import { loadTripPage } from "@/lib/pageData";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Share your preferences" };

export default async function JoinTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id } = await params;
  const { name } = await searchParams;
  const { setupError, data } = await loadTripPage(id);
  if (setupError) return <SetupNotice message={setupError} />;
  if (!data) notFound();

  const { trip, participants } = data;
  const pendingNames = participants.filter((p) => !p.preferences).map((p) => p.name);
  const submittedNames = participants.filter((p) => p.preferences).map((p) => p.name);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="eyebrow">{trip.coordinator_name} invited you</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="mx-auto mt-2 max-w-lg text-slate-600">
            Share what works for you. It takes about two minutes, and everyone&apos;s answers carry equal weight.
          </p>
        </div>
        <PreferenceForm
          tripId={trip.id}
          currency={trip.currency}
          pendingNames={pendingNames}
          submittedNames={submittedNames}
          initialName={typeof name === "string" ? name.slice(0, 60) : ""}
        />
      </div>
    </div>
  );
}
