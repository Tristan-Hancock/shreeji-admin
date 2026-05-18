import { supabase } from '../lib/supabase';
import type {
  ProductInsert,
  ProductUpdate,
  ProductListItem,
  ProductWithVariants,
} from '../types/catalog';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
}

export const ProductsRepository = {
  /**
   * Return a flat list of products enriched with variant aggregates
   * (count, total stock, active variant count).  Uses a partial variant
   * select to minimise payload on the list view.
   */
  async listProducts(filters: ProductFilters = {}): Promise<ProductListItem[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_variants(id, stock_qty, is_active)
      `)
      .order('created_at', { ascending: false });

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row) => {
      const variants = (row.product_variants as any[]) ?? [];
      return {
        ...row,
        variant_count: variants.length,
        total_stock: variants.reduce((s: number, v: any) => s + (v.stock_qty ?? 0), 0),
        active_variants: variants.filter((v: any) => v.is_active).length,
      } as ProductListItem;
    });
  },

  /**
   * Fetch a single product with ALL variant fields — used on the detail page.
   */
  async getProduct(id: string): Promise<ProductWithVariants> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProductWithVariants;
  },

  /**
   * Legacy helper kept for Dashboard / Inventory pages.
   * Returns all products with full variant arrays.
   */
  async getAllWithVariants() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)');
    if (error) throw error;
    return data ?? [];
  },

  async createProduct(payload: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, payload: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleProductStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
