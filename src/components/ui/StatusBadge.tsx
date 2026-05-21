import { cn } from '../../lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  // Order statuses
  pending:          { label: 'Pending',          className: 'bg-amber-100 text-amber-700' },
  accepted:         { label: 'Accepted',         className: 'bg-blue-100 text-blue-700' },
  packed:           { label: 'Packed',           className: 'bg-indigo-100 text-indigo-700' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-700' },
  delivered:        { label: 'Delivered',        className: 'bg-emerald-100 text-emerald-700' },
  cancelled:        { label: 'Cancelled',        className: 'bg-red-100 text-red-700' },

  // Payment statuses
  paid:             { label: 'Paid',             className: 'bg-emerald-100 text-emerald-700' },
  failed:           { label: 'Failed',           className: 'bg-red-100 text-red-700' },
  refunded:         { label: 'Refunded',         className: 'bg-orange-100 text-orange-700' },

  // Generic
  active:           { label: 'Active',           className: 'bg-emerald-100 text-emerald-700' },
  inactive:         { label: 'Inactive',         className: 'bg-neutral-100 text-neutral-600' },
};

const fallbackConfig = { label: 'Unknown', className: 'bg-neutral-100 text-neutral-500' };

function formatLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status];

  if (!config) {
    console.warn('StatusBadge: unknown status:', status);
  }

  const resolved = config ?? { ...fallbackConfig, label: formatLabel(status) };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
      resolved.className
    )}>
      {resolved.label}
    </span>
  );
}
