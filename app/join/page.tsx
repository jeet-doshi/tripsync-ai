import type { Metadata } from "next";
import { JoinCodeForm } from "@/components/JoinCodeForm";

export const metadata: Metadata = { title: "Join a trip" };

export default function JoinPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">Join a trip</h1>
        <p className="mt-2 text-slate-600">
          Paste the link your coordinator shared, or type the trip code at the end of it.
        </p>
        <JoinCodeForm />
      </div>
    </div>
  );
}
