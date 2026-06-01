export function ErrorState({ message = "Ocurrió un error." }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700">
      {message}
    </div>
  );
}
