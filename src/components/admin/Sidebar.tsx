import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  Users,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import shreejiLogo from '../../assets/shreejilogo.png';

const navItems = [
  // Admin Only
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/admin/dashboard',    roles: ['admin'] },
  { icon: ShoppingBag,    label: 'Orders',         path: '/admin/orders',       roles: ['admin'] },
  { icon: Package,        label: 'Products',       path: '/admin/products',     roles: ['admin'] },
  { icon: ClipboardList,  label: 'Categories',     path: '/admin/categories',   roles: ['admin'] },
  { icon: ClipboardList,  label: 'Inventory',      path: '/admin/inventory',    roles: ['admin'] },
  { icon: Users,          label: 'Delivery Boys',  path: '/admin/delivery-boys', roles: ['admin'] },
  { icon: MapPin,         label: 'Pincodes',       path: '/admin/pincodes',     roles: ['admin'] },
  { icon: Settings,       label: 'Settings',       path: '/admin/settings',     roles: ['admin'] },

  // Delivery Boy Only
  { icon: ShoppingBag,    label: 'My Deliveries',  path: '/delivery/orders',    roles: ['delivery_boy'] },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = navItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <img src={shreejiLogo} alt="ShreeJi Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold tracking-tight">ShreeJi Store Manager</span>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredItems.map((item) => {
          // Match exact path or any child route (e.g. /admin/products/:id → Products)
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/admin/dashboard' &&
              location.pathname.startsWith(item.path + '/'));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-emerald-50 text-emerald-700 font-medium" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600")} />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-200 pt-6 px-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600">
            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold truncate">{profile?.full_name || 'User'}</span>
            <span className="text-xs text-neutral-500 capitalize">{profile?.role}</span>
          </div>
        </div>
        <button
          onClick={() => {
            signOut();
            navigate('/admin/login');
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <img src="/src/assets/shreejilogo.png" alt="ShreeJi Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold tracking-tight text-lg">ShreeJi Store Manager</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-neutral-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-neutral-200 z-50 md:hidden"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-500"
              >
                <X className="w-6 h-6" />
              </button>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 h-screen sticky top-0 bg-white border-r border-neutral-200 overflow-y-auto shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
