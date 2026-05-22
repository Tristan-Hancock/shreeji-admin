import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireDeliveryBoy() {
  const { user, loading, profileLoading, profile } = useAuth();

  // Show loading while initial auth or profile is being fetched
  if (loading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // After loading is complete, check authentication
  // Only redirect if we're sure user is not authenticated or not delivery_boy
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If we have a user but profile failed to load, show an error
  if (profile === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Unable to Load Profile</h1>
          <p className="text-neutral-600 mb-4">Please refresh the page or try again</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Check if user has delivery_boy role
  if (profile.role !== 'delivery_boy') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
