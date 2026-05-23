import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats order address from individual fields into a readable string
 */
export function formatOrderAddress(
  addressLine1: string | null | undefined,
  addressLine2: string | null | undefined,
  landmark: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  pincode: string | null | undefined
): string {
  const parts = [];

  if (addressLine1) parts.push(addressLine1);
  if (addressLine2) parts.push(addressLine2);
  if (landmark) parts.push(`(${landmark})`);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (pincode) parts.push(pincode);

  return parts.length > 0 ? parts.join(', ') : 'No address provided';
}

/**
 * Converts a human-readable name into a URL-safe slug.
 * e.g. "Bath & Soaps" → "bath-soaps"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric (keep spaces & hyphens)
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}
