import { cn } from '../../lib/utils';

// ─── Base skeleton pulse ──────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-neutral-200', className)} />
  );
}

// ─── Table row skeleton ───────────────────────────────────────────────────

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={cn('h-4', i === 0 ? 'w-8 h-8 rounded-lg' : 'w-full')} />
        </td>
      ))}
    </tr>
  );
}

// ─── Card skeleton (for category grid) ───────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
