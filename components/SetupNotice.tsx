/** Shown instead of a page when Supabase / Gemini env vars are missing. */
export function SetupNotice({ message }: { message: string }) {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-8">
        <p className="eyebrow">Setup needed</p>
        <h1 className="mt-2 text-xl font-semibold">TripSync isn&apos;t connected yet</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>
            Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to{" "}
            <code className="rounded bg-slate-100 px-1">.env.local</code>.
          </li>
          <li>Fill in your Supabase and Gemini keys.</li>
          <li>
            Run <code className="rounded bg-slate-100 px-1">supabase/schema.sql</code> in the Supabase SQL editor.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  );
}
