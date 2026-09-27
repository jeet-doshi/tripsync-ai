import type { TripOption } from "@/lib/types";
import { FIT_STYLES, fitLevel } from "@/lib/utils";
import { Avatar, CheckIcon, FitBadge, FitBar, ScaleIcon } from "./ui";

export function OptionCard({ option, label }: { option: TripOption; label: string }) {
  const level = FIT_STYLES[fitLevel(option.groupFit)];
  const lowestFit = option.participantFit.reduce((min, p) => Math.min(min, p.fit), 100);

  return (
    <article className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight">{option.destination}</h3>
            {option.region && <p className="text-sm text-slate-500">{option.region}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-3xl font-bold ${level.text}`}>{option.groupFit}%</p>
            <p className="text-xs text-slate-500">group fit</p>
          </div>
        </div>
        <FitBar fit={option.groupFit} className="mt-4 h-2.5" />

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {option.estimatedCostPerPerson && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">💰 {option.estimatedCostPerPerson}</span>
          )}
          {option.suggestedDates && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">📅 {option.suggestedDates}</span>
          )}
        </div>

        <h4 className="mt-5 text-sm font-semibold">Why it works</h4>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{option.whyItWorks}</p>
      </div>

      {/* Strengths & trade-offs */}
      <div className="grid gap-5 border-t border-slate-100 px-6 py-5">
        <div>
          <h4 className="text-sm font-semibold text-emerald-700">Strengths</h4>
          <ul className="mt-2 space-y-1.5">
            {option.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-600">
                <CheckIcon className="mt-0.5 shrink-0 text-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-700">Trade-offs</h4>
          <ul className="mt-2 space-y-1.5">
            {option.tradeoffs.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-600">
                <ScaleIcon className="mt-0.5 shrink-0 text-amber-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Individual fit */}
      <div className="mt-auto border-t border-slate-100 bg-slate-50/60 px-6 py-5">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-semibold">How it fits each person</h4>
          <span className="text-xs text-slate-500">Lowest: {lowestFit}%</span>
        </div>
        <ul className="mt-4 space-y-4">
          {option.participantFit.map((p) => (
            <li key={p.name}>
              <div className="flex items-center gap-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <FitBadge fit={p.fit} />
                      <span className="w-9 text-right text-sm font-semibold tabular-nums">{p.fit}%</span>
                    </span>
                  </div>
                  <FitBar fit={p.fit} className="mt-1.5 h-1.5" />
                </div>
              </div>
              {(p.reason || p.compromise) && (
                <div className="ml-12 mt-1.5 space-y-1 text-xs leading-relaxed">
                  {p.reason && <p className="text-slate-600">{p.reason}</p>}
                  {p.compromise && (
                    <p className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">
                      <span className="font-semibold">Compromise:</span> {p.compromise}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
