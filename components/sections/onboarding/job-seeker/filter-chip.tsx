export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all ${active ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary"}`}
    >
      {label}
    </button>
  );
}
