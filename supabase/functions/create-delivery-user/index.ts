/// <reference lib="deno.window" />
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

interface CreateDeliveryUserRequest {
  full_name: string;
  phone: string;
  email: string;
  password: string;
}

interface DeliveryUserResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

/**
 * Edge Function: Create Delivery User
 *
 * Security:
 * 1. Verifies requester JWT (from Authorization header)
 * 2. Verifies requester is admin (checks profiles table)
 * 3. Creates auth user with service role (safe in Edge Function)
 * 4. Sets role metadata to 'delivery_boy'
 * 5. Returns created user (without exposing service role)
 *
 * Only accessible by admin users.
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role (safe in Edge Function only)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Verify the token by getting the user
    const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);

    let userId: string;
    if (tokenError || !tokenUser?.id) {
      console.error('JWT verification failed:', tokenError);
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    userId = tokenUser.id;

    // Verify requester is admin by checking profiles table
    const { data: requesterProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !requesterProfile) {
      console.error('Profile lookup failed:', profileError);
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (requesterProfile.role !== 'admin') {
      console.warn(`Non-admin user ${userId} attempted to create delivery user`);
      return new Response(
        JSON.stringify({ error: 'Only admins can create delivery users' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    let body: CreateDeliveryUserRequest;
    try {
      body = await req.json();
    } catch (err) {
      console.error('Invalid JSON:', err);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { full_name, phone, email, password } = body;

    // Validate input
    if (!full_name || !phone || !email || !password) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: full_name, phone, email, password',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create auth user with metadata
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      user_metadata: {
        full_name: full_name.trim(),
        phone: phone.trim(),
        role: 'delivery_boy',
      },
      email_confirm: true, // Auto-confirm email for internal staff
    });

    if (createError) {
      console.error('User creation failed:', createError);
      return new Response(
        JSON.stringify({
          error: createError.message || 'Failed to create user',
          details: createError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!newUser.user) {
      return new Response(JSON.stringify({ error: 'User creation failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare response (without sensitive data)
    const response: DeliveryUserResponse = {
      id: newUser.user.id,
      email: newUser.user.email || '',
      full_name: full_name,
      phone: phone,
      created_at: new Date().toISOString(),
    };

    console.log(`Delivery user created: ${response.id} (${response.email})`);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
