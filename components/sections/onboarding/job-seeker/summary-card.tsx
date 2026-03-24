export function SummaryCard({
  label,
  title,
  copy,
}: {
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
        {label}
      </p>
      <h3 className="mt-3 text-xl tracking-tight text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}
