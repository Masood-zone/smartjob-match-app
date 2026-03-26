import { MaterialSymbol } from "@/components/common/MaterialSymbol";

export function AccessDenied() {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <MaterialSymbol icon="lock" className="text-2xl" />
      </div>
      <h1 className="text-3xl text-on-surface">Access restricted</h1>
      <p className="mx-auto mt-2 max-w-lg text-sm text-on-surface-variant">
        You do not have permission to view this admin route.
      </p>
    </div>
  );
}
