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
    // Get current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error('Unauthorized: No active session');
    }

    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/create-delivery-user`;
    console.log('[DeliveryService] Calling Edge Function:', functionUrl);

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Log response status for debugging
      console.log('[DeliveryService] Response status:', response.status, response.statusText);

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If we can't parse JSON, use the status text
          throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `Failed to create delivery user: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DeliveryService] User created successfully:', data.id);

      return data as CreateDeliveryUserResponse;
    } catch (error) {
      console.error('[DeliveryService] Fetch error:', error);
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
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
};
