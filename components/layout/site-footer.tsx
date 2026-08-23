export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-contrast text-on-contrast/65">
      <div className="mx-auto max-w-6xl px-6 py-8 text-xs md:px-10">
        <p>&copy; {new Date().getFullYear()} Workbench Notes.</p>
      </div>
    </footer>
  );
}
