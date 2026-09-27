"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ShareCard({ tripId, tripName, highlight }: { tripId: string; tripName: string; highlight?: boolean }) {
  const path = `/trip/${tripId}/join`;
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  // The full URL depends on where the app is hosted (localhost, Vercel preview, production…).
  useEffect(() => setUrl(`${window.location.origin}${path}`), [path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  const whatsappText = encodeURIComponent(
    `Let's finally plan "${tripName}"! Add your budget, dates and preferences here (takes 2 min): ${url}`,
  );

  return (
    <div className={cn("card p-6", highlight && "ring-2 ring-indigo-500")}>
      <h2 className="font-semibold">Invite your group</h2>
      <p className="mt-1 text-sm text-slate-600">Send this link to everyone going on the trip.</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 pl-3 ring-1 ring-inset ring-slate-200">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700" title={url}>
          {url}
        </span>
        <button type="button" onClick={copy} className="btn-primary btn-sm shrink-0">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Trip code: <span className="font-mono font-semibold text-slate-700">{tripId}</span>
        </span>
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-700 hover:underline"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
