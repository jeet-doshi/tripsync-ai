"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Spinner } from "./ui";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" className="btn-secondary btn-sm" onClick={() => startTransition(() => router.refresh())} disabled={pending}>
      {pending ? <Spinner /> : null}
      Refresh
    </button>
  );
}
