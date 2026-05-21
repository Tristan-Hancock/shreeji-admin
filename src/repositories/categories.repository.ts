import { supabase } from '../lib/supabase';
import { cachedFetch, invalidate } from '../lib/cache';
import type { CategoryInsert, CategoryUpdate, CategoryWithCount } from '../types/catalog';

export const CategoriesRepository = {
  async listCategories(): Promise<CategoryWithCount[]> {
    return cachedFetch('categories:list', async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, products(id)')
        .order('name');

      if (error) throw error;

      return (data ?? []).map((row) => {
        const { products, ...category } = row as any;
        return {
          ...category,
          product_count: Array.isArray(products) ? products.length : 0,
        } as CategoryWithCount;
      });
    });
  },

  async getCategory(id: string) {
    return cachedFetch(`categories:${id}`, async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    });
  },

  async createCategory(payload: CategoryInsert) {
    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    invalidate('categories');
    return data;
  },

  async updateCategory(id: string, payload: CategoryUpdate) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    invalidate('categories');
    return data;
  },

  async toggleCategoryStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    invalidate('categories');
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.rpc('delete_category_safe', {
      category_uuid: id,
    });

    if (error) throw error;
    invalidate('categories');
  },
};
