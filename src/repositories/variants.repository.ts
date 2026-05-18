import { supabase } from '../lib/supabase';
import type { VariantInsert, VariantUpdate, ProductVariant } from '../types/catalog';

export const VariantsRepository = {
  async createVariant(payload: VariantInsert): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  async updateVariant(id: string, payload: VariantUpdate): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  async updateVariantStock(id: string, stockQty: number): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ stock_qty: stockQty, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  async toggleVariantStatus(id: string, isActive: boolean): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },
};
