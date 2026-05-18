import { cn } from '../../lib/utils';

type StatusType = 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'active' | 'inactive';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-700' },
  packed: { label: 'Packed', className: 'bg-indigo-100 text-indigo-700' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Inactive', className: 'bg-neutral-100 text-neutral-600' },
};

export default function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
      config.className
    )}>
      {config.label}
    </span>
  );
}
