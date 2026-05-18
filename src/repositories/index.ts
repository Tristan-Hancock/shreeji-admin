import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

export const OrdersRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async assignDeliveryBoy(id: string, deliveryBoyId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ delivery_boy_id: deliveryBoyId })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const ProductsRepository = {
  async getAllWithVariants() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)');
    if (error) throw error;
    return data;
  },

  async updateStock(variantId: string, stockQty: number) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ stock_qty: stockQty })
      .eq('id', variantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleProductActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const DeliveryRepository = {
  async getDeliveryBoys() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'delivery_boy');
    if (error) throw error;
    return data;
  }
};

export const PincodeRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .select('*');
    if (error) throw error;
    return data;
  },
  
  async update(pincode: string, updates: Database['public']['Tables']['serviceable_pincodes']['Update']) {
    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .update(updates)
      .eq('pincode', pincode)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
