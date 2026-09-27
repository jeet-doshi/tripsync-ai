export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} TripSync AI</p>
        <p>AI suggests. Your group decides.</p>
      </div>
    </footer>
  );
}
