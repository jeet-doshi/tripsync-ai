import Link from "next/link";
import { ArrowRight, Avatar, CheckIcon, FitBar } from "@/components/ui";

const STEPS = [
  { title: "Create a trip", body: "The coordinator names the trip and gets a shareable link in seconds." },
  { title: "Everyone shares preferences", body: "Budget, dates, destination types, trip style and deal-breakers — in about two minutes." },
  { title: "AI analyses the group", body: "Gemini finds overlaps, conflicts, budget limits and date windows across everyone." },
  { title: "Pick from 2–3 options", body: "Each option shows its trade-offs and how well it fits every single person." },
];

const PRINCIPLES = [
  { title: "Everyone gets heard", body: "The quiet friend's budget counts as much as the loudest opinion in the chat." },
  { title: "Trade-offs in the open", body: "See exactly who compromises on what, instead of discovering it a week before the trip." },
  { title: "Your group decides", body: "TripSync suggests balanced options. The final call always stays with you." },
];

const PREVIEW = [
  { name: "Riya", fit: 92 },
  { name: "Arjun", fit: 84 },
  { name: "Meera", fit: 61 },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-indigo-50/80 to-transparent" />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="badge bg-white text-indigo-700 ring-indigo-200">For friend groups stuck in the group chat</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Turn everyone&apos;s preferences into one clear trip decision.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Everyone shares their budget, dates and travel style. TripSync AI finds where your group agrees, surfaces
              the trade-offs, and suggests 2–3 destinations that actually fit — so you can stop polling and start going.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create" className="btn-primary px-6 text-base">
                Create a Trip <ArrowRight />
              </Link>
              <Link href="/join" className="btn-secondary px-6 text-base">
                Join a Trip
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">No sign-ups. No apps to install. Just a link.</p>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="card p-6 shadow-lg shadow-indigo-100/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Option A</p>
                  <p className="mt-0.5 text-lg font-semibold">Gokarna, Karnataka</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">82%</p>
                  <p className="text-xs text-slate-500">group fit</p>
                </div>
              </div>
              <FitBar fit={82} className="mt-4" />
              <p className="mt-4 text-sm text-slate-600">
                Quiet beaches on everyone&apos;s budget, with treks for Arjun and cafés for Meera.
              </p>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                {PREVIEW.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <Avatar name={p.name} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-slate-500">{p.fit}%</span>
                      </div>
                      <FitBar fit={p.fit} className="mt-1.5 h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Meera compromises on nightlife — Goa scores higher for her.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Sound familiar?</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Group trips die in the group chat</h2>
          <p className="mt-4 text-slate-600">
            Suggestions get buried, dates clash, opinions change, and the same conversation restarts every week.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            ["1,200+", "messages in the chat"],
            ["3 months", "of “let’s plan soon”"],
            ["0", "confirmed plans"],
          ].map(([stat, label]) => (
            <div key={stat} className="card p-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{stat}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200/70 bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">From chaos to a decision in four steps</h2>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Principles */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="card p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-indigo-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to finally book the trip?</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Create your trip, drop the link in the group chat, and let everyone weigh in.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/create" className="btn bg-white px-6 text-base text-indigo-700 hover:bg-indigo-50">
              Create a Trip
            </Link>
            <Link href="/join" className="btn px-6 text-base text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
              Join a Trip
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
