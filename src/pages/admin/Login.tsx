import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Truck, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('[Login] Component rendered, state:', { email, password, loading, error });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[Login] Attempting login with email:', email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[Login] Auth error:', authError);
        throw authError;
      }

      console.log('[Login] Login successful, fetching user profile to determine role...');

      // Get user's profile to determine where to redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found after login');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('[Login] Profile fetch error:', profileError);
        throw new Error('Unable to load user profile');
      }

      console.log('[Login] User profile found, role:', profile.role);

      // Redirect based on role
      if (profile.role === 'admin') {
        console.log('[Login] Admin user, redirecting to /admin/dashboard');
        navigate('/admin/dashboard');
      } else if (profile.role === 'delivery_boy') {
        console.log('[Login] Delivery user, redirecting to /delivery/orders');
        navigate('/delivery/orders');
      } else {
        console.warn('[Login] Unknown role:', profile.role);
        throw new Error(`Unknown user role: ${profile.role}`);
      }
    } catch (err: any) {
      console.error('[Login] Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-xl shadow-emerald-200">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">ShreeJi Store Manager Admin</h1>
          <p className="text-neutral-500 mt-2">Sign in to manage your grocery operations</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200 border border-neutral-100">
          <form onSubmit={(e) => {
            console.log('[Login] Form submitted, email:', email, 'password length:', password.length);
            handleLogin(e);
          }} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log('[Login] Button clicked, loading:', loading)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm text-neutral-500">
          Operational Dashboard v1.0
        </p>
      </motion.div>
    </div>
  );
}
