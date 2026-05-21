/**
 * Barrel re-export for all repositories.
 *
 * Consumers can import from this single entry point:
 *   import { OrdersRepository, CategoriesRepository } from '../../repositories';
 */

// ─── Catalog ──────────────────────────────────────────────────────────────
export { CategoriesRepository } from './categories.repository';
export { ProductsRepository }   from './products.repository';
export { VariantsRepository }   from './variants.repository';

// ─── Types (re-export for convenience) ───────────────────────────────────
export type {
  Category,
  CategoryInsert,
  CategoryUpdate,
  CategoryWithCount,
  Product,
  ProductInsert,
  ProductUpdate,
  ProductListItem,
  ProductWithVariants,
  ProductVariant,
  VariantInsert,
  VariantUpdate,
} from '../types/catalog';

// ─── Orders ───────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';
import { cachedFetch, invalidate } from '../lib/cache';
import type { Database } from '../types/database';

export type Order     = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type OrderWithItems = Order & { order_items: OrderItem[] };

export const OrdersRepository = {
  async listAdminOrders(): Promise<OrderWithItems[]> {
    return cachedFetch('orders:all', async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[OrdersRepository.listAdminOrders] query error:', error);
        throw error;
      }

      return (data ?? []) as OrderWithItems[];
    });
  },

  async getAdminOrder(id: string): Promise<OrderWithItems> {
    return cachedFetch(`orders:${id}`, async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('[OrdersRepository.getAdminOrder] query error:', error);
        throw error;
      }

      return data as OrderWithItems;
    });
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[OrdersRepository.updateStatus] error:', error);
      throw error;
    }
    invalidate('orders');
    return data;
  },

  async assignDeliveryBoy(id: string, deliveryBoyId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ delivery_boy_id: deliveryBoyId })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[OrdersRepository.assignDeliveryBoy] error:', error);
      throw error;
    }
    invalidate('orders');
    return data;
  },
};

// ─── Delivery Staff ───────────────────────────────────────────────────────
export const DeliveryRepository = {
  async getDeliveryBoys() {
    return cachedFetch('delivery:all', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'delivery_boy');
      if (error) throw error;
      return data;
    });
  },
};

// ─── Pincodes ─────────────────────────────────────────────────────────────
export const PincodeRepository = {
  async getAll() {
    return cachedFetch('pincodes:all', async () => {
      const { data, error } = await supabase
        .from('serviceable_pincodes')
        .select('*');
      if (error) throw error;
      return data;
    });
  },

  async update(
    pincode: string,
    updates: Database['public']['Tables']['serviceable_pincodes']['Update'],
  ) {
    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .update(updates)
      .eq('pincode', pincode)
      .select()
      .single();
    if (error) throw error;
    invalidate('pincodes');
    return data;
  },
};
