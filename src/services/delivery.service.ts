import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type DeliveryProfile = Database['public']['Tables']['profiles']['Row'];


interface CreateDeliveryUserPayload {
  full_name: string;
  phone: string;
  email: string;
  password: string;
}

interface CreateDeliveryUserResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

/**
 * Delivery Staff Service
 * Handles all delivery user creation and management operations
 */
export const DeliveryService = {
  /**
   * Create a new delivery user via secure Edge Function
   * Only accessible by admin users
   */
  async createDeliveryUser(
    payload: CreateDeliveryUserPayload
  ): Promise<CreateDeliveryUserResponse> {
    const { data, error } = await supabase.functions.invoke('create-delivery-user', {
      body: payload,
    });

    if (error) {
      const message = error.message || 'Failed to create delivery user';
      throw new Error(message);
    }

    return data as CreateDeliveryUserResponse;
  },

  /**
   * List all delivery staff (delivery_boy role)
   * Uses caching for performance
   */
  async listDeliveryStaff(): Promise<DeliveryProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'delivery_boy')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DeliveryService.listDeliveryStaff] Error:', error);
      throw error;
    }

    return (data ?? []) as DeliveryProfile[];
  },

  /**
   * Get single delivery staff member
   */
  async getDeliveryStaff(id: string): Promise<DeliveryProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'delivery_boy')
      .single();

    if (error) {
      console.error('[DeliveryService.getDeliveryStaff] Error:', error);
      throw error;
    }

    return data;
  },

  /**
   * Toggle delivery staff active/inactive status
   * Admin can deactivate staff (they keep their account but cannot login)
   */
  async toggleDeliveryStaffStatus(id: string, isActive: boolean): Promise<DeliveryProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .single();

    if (error) {
      console.error('[DeliveryService.toggleDeliveryStaffStatus] Error:', error);
      throw error;
    }

    return data as DeliveryProfile;
  },

  /**
   * Deactivate a delivery staff member
   */
  async deactivateDeliveryStaff(id: string): Promise<DeliveryProfile> {
    return this.toggleDeliveryStaffStatus(id, false);
  },

  /**
   * Reactivate a delivery staff member
   */
  async reactivateDeliveryStaff(id: string): Promise<DeliveryProfile> {
    return this.toggleDeliveryStaffStatus(id, true);
  },

  /**
   * Deactivate delivery user via secure Edge Function
   * Uses supabase.functions.invoke() which automatically handles
   * Authorization header, apikey, and session management.
   */
  async deactivateDeliveryUserSecure(userId: string): Promise<{ success: boolean; message: string; deactivated_at: string }> {
    const { data, error } = await supabase.functions.invoke('deactivate-delivery-user', {
      body: { user_id: userId },
    });

    if (error) {
      // error.context may contain the Response object with more detail
      const message = error.message || 'Failed to deactivate delivery user';
      throw new Error(message);
    }

    return data;
  },
};
