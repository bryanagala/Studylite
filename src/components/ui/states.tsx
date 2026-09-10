import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <p className="text-lg font-bold text-slate-900 dark:text-white">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40">
      <p className="font-bold text-rose-700 dark:text-rose-300">{title}</p>
      {description ? <p className="mt-2 text-sm text-rose-600/80">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}
