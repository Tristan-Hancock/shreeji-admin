import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Checks authentication status only.
 * Specific role requirements are enforced by RequireAdmin and RequireDeliveryBoy guards.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (import.meta.env.DEV) console.log('[ProtectedRoute] Checking auth:', {
    loading,
    user: user?.id,
    email: user?.email,
  });

  if (loading) {
    console.log('[ProtectedRoute] Still loading, showing spinner');
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (import.meta.env.DEV) console.log('[ProtectedRoute] User authenticated, rendering outlet');
  return <Outlet />;
}
