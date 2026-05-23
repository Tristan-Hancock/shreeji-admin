/// <reference lib="deno.window" />
import { createClient } from 'supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

interface DeactivateRequest {
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request body
    let payload: DeactivateRequest;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { user_id } = payload;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id in request' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create admin client for privileged operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Verify the current user by passing the token directly — correct server-side pattern
    // (auth.getUser() without a token doesn't work in Deno; there is no localStorage session)
    const { data: { user: currentUser }, error: currentUserError } = await adminClient.auth.getUser(token);

    if (currentUserError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get current user's profile to verify they are admin
    const { data: currentUserProfile, error: currentProfileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentProfileError || !currentUserProfile) {
      console.error('[DeactivateDeliveryUser] Current user profile error:', currentProfileError);
      return new Response(
        JSON.stringify({ error: 'Unable to verify admin status' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if current user is admin
    if (currentUserProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can deactivate delivery users' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Prevent self-deactivation
    if (user_id === currentUser.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot deactivate your own account' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get target user's profile to verify they are a delivery user (not admin)
    const { data: targetUserProfile, error: targetProfileError } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', user_id)
      .single();

    if (targetProfileError || !targetUserProfile) {
      console.error('[DeactivateDeliveryUser] Target user profile error:', targetProfileError);
      return new Response(
        JSON.stringify({ error: 'Delivery user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Prevent deactivating admins
    if (targetUserProfile.role === 'admin') {
      return new Response(
        JSON.stringify({ error: 'Cannot deactivate admin users' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Only allow deactivating delivery_boy users
    if (targetUserProfile.role !== 'delivery_boy') {
      return new Response(
        JSON.stringify({ error: 'Can only deactivate delivery users' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update profile to deactivate (set is_active to false)
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (updateError) {
      console.error('[DeactivateDeliveryUser] Profile update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to deactivate delivery user: ' + updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Optional: Ban the user from auth to prevent login
    // Using a very long ban duration (100 years) effectively disables login
    const { error: banError } = await adminClient.auth.admin.updateUserById(user_id, {
      ban_duration: '876000h', // 100 years = effectively permanent
    });

    if (banError) {
      console.error('[DeactivateDeliveryUser] Ban update warning (non-critical):', banError);
      // Don't fail the operation if ban fails, as profile deactivation is the critical part
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${targetUserProfile.full_name} has been deactivated`,
        user_id,
        deactivated_at: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('[DeactivateDeliveryUser] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
