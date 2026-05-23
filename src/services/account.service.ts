import { supabase } from '../lib/supabase';

/**
 * Account Service
 * Handles user account operations like deletion
 */
export const AccountService = {
  /**
   * Delete user's own account
   * Calls Edge Function for secure deletion
   */
  async deleteAccount(): Promise<void> {
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

    const functionUrl = `${supabaseUrl}/functions/v1/delete-account`;
    if (import.meta.env.DEV) console.log('[AccountService] Calling delete-account function:', functionUrl);

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (import.meta.env.DEV) console.log('[AccountService] Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `Failed to delete account: ${response.statusText}`);
      }

      const data = await response.json();
      if (import.meta.env.DEV) console.log('[AccountService] Account deleted successfully');

      return data;
    } catch (error) {
      console.error('[AccountService] Error:', error);
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  },
};
