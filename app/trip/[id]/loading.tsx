export default function TripLoading() {
  return (
    <div className="container-page animate-pulse py-10 sm:py-12" aria-busy="true" aria-label="Loading trip">
      <div className="h-3 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-72 max-w-full rounded bg-slate-200" />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card h-72 lg:col-span-2" />
        <div className="space-y-6">
          <div className="card h-40" />
          <div className="card h-40" />
        </div>
      </div>
    </div>
  );
}
