import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900 font-sans">
      <Sidebar />
      {/* pt-20 on mobile clears the fixed 64px (h-16) header + 16px breathing room */}
      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
