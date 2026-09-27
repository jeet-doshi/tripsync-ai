import type { Metadata } from "next";
import { CreateTripForm } from "@/components/CreateTripForm";

export const metadata: Metadata = { title: "Create a trip" };

export default function CreatePage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Step 1 of 4</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Create your trip</h1>
        <p className="mt-2 text-slate-600">
          You&apos;ll get a link to share with your group. Everyone fills in their preferences, then TripSync finds the
          options that fit.
        </p>
        <CreateTripForm />
      </div>
    </div>
  );
}
