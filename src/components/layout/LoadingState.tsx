export function LoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}
