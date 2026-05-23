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

      console.log('[OrdersRepository.listAdminOrders] Query successful, rows:', data?.length ?? 0);
      return (data ?? []) as OrderWithItems[];
    });
  },

  async listPendingOrders(): Promise<OrderWithItems[]> {
    console.log('[OrdersRepository.listPendingOrders] Querying pending orders...');
    return cachedFetch('orders:pending', async () => {
      console.log('[OrdersRepository.listPendingOrders] Cache miss, fetching from database...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[OrdersRepository.listPendingOrders] query error:', error);
        throw error;
      }

      console.log('[OrdersRepository.listPendingOrders] Query successful, rows:', data?.length ?? 0);
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
    console.log('[OrdersRepository.updateStatus] Updating order via RPC:', id, 'to status:', status);

    // Use RPC function instead of direct PATCH to respect business logic
    const { error } = await supabase.rpc('update_order_status', {
      order_uuid: id,
      new_status: status,
    });

    if (error) {
      console.error('[OrdersRepository.updateStatus] RPC error:', error);
      throw error;
    }

    console.log('[OrdersRepository.updateStatus] RPC call successful');
    invalidate('orders');
    return { id, status };
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
