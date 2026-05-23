/**
 * Catalog domain types.
 * These are the "application-level" shapes — base DB rows plus the computed
 * or joined fields that the UI actually works with.  Always derive from the
 * Database type so that a schema change surfaces as a type error here first.
 */

import type { Database } from './database';

// ─── Raw row aliases ──────────────────────────────────────────────────────

export type Category       = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Product        = Database['public']['Tables']['products']['Row'];
export type ProductInsert  = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate  = Database['public']['Tables']['products']['Update'];

export type ProductVariant  = Database['public']['Tables']['product_variants']['Row'];
export type VariantInsert   = Database['public']['Tables']['product_variants']['Insert'];
export type VariantUpdate   = Database['public']['Tables']['product_variants']['Update'];

// ─── Category join types ──────────────────────────────────────────────────

/** Category row augmented with the count of products that reference it. */
export type CategoryWithCount = Category & {
  product_count: number;
};

// ─── Product join types ───────────────────────────────────────────────────

/** Slim variant shape used inside the product list (avoids over-fetching). */
export type VariantSummary = Pick<ProductVariant, 'id' | 'stock_qty' | 'is_active' | 'price'>;

/** Slim category shape embedded in product queries. */
export type CategoryRef = Pick<Category, 'id' | 'name' | 'slug'>;

/**
 * Product list item — used on the /admin/products table view.
 * Contains a slim variant array (id, stock_qty, is_active only) plus
 * pre-computed aggregate fields so components don't repeat that math.
 */
export type ProductListItem = Product & {
  categories: CategoryRef | null;
  product_variants: VariantSummary[];
  /** Computed client-side from product_variants */
  variant_count: number;
  total_stock: number;
  active_variants: number;
  min_price: number | null;
  max_price: number | null;
};

/**
 * Full product with all variant fields — used on /admin/products/:id.
 */
export type ProductWithVariants = Product & {
  categories: CategoryRef | null;
  product_variants: ProductVariant[];
};

// ─── Unit type options (used in variant form) ─────────────────────────────

export const UNIT_TYPES = ['ml', 'L', 'g', 'kg', 'pcs', 'pack', 'dozen', 'box'] as const;
export type UnitType = typeof UNIT_TYPES[number];
