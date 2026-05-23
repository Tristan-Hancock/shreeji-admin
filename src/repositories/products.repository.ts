import { supabase } from '../lib/supabase';
import { cachedFetch, invalidate } from '../lib/cache';
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

function productsCacheKey(filters: ProductFilters): string {
  return `products:list:${filters.categoryId ?? ''}:${filters.search ?? ''}:${filters.activeOnly ?? ''}`;
}

export const ProductsRepository = {
  async listProducts(filters: ProductFilters = {}): Promise<ProductListItem[]> {
    return cachedFetch(productsCacheKey(filters), async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(id, name, slug),
          product_variants(id, stock_qty, is_active, price)
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
        const prices = variants.map((v: any) => v.price as number).filter((p) => p != null && !isNaN(p));
        return {
          ...row,
          variant_count: variants.length,
          total_stock: variants.reduce((s: number, v: any) => s + (v.stock_qty ?? 0), 0),
          active_variants: variants.filter((v: any) => v.is_active).length,
          min_price: prices.length > 0 ? Math.min(...prices) : null,
          max_price: prices.length > 0 ? Math.max(...prices) : null,
        } as ProductListItem;
      });
    });
  },

  async getProduct(id: string): Promise<ProductWithVariants> {
    return cachedFetch(`products:${id}`, async () => {
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
    });
  },

  async getAllWithVariants() {
    return cachedFetch('products:allWithVariants', async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)');
      if (error) throw error;
      return data ?? [];
    });
  },

  async createProduct(payload: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    invalidate('products');
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
    invalidate('products');
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
    invalidate('products');
    return data;
  },

  async archiveProduct(id: string) {
    const { error } = await supabase.rpc('archive_product', {
      product_uuid: id,
    });

    if (error) throw error;
    invalidate('products');
  },
};
