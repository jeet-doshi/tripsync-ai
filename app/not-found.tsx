import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="text-4xl">🗺️</p>
        <h1 className="mt-3 text-xl font-semibold">We couldn&apos;t find that trip</h1>
        <p className="mt-2 text-sm text-slate-600">
          The link may be incomplete or mistyped. Ask your coordinator to share it again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/join" className="btn-primary">
            Enter a trip code
          </Link>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
