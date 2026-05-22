import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireDeliveryBoy() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || profile?.role !== 'delivery_boy') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
