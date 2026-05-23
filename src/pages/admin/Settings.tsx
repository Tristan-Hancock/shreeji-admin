import { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  ChevronRight,
  User,
  AlertTriangle,
  Lock,
  LogOut,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { AccountService } from '../../services/account.service';

export default function Settings() {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sections = [
    {
      title: "Store Configuration",
      items: [
        { icon: Building2, label: "Store Details", desc: "Name, address, and VAT info", path: "#" },
        { icon: MessageCircle, label: "WhatsApp Setup", desc: "Configure automated notification numbers", path: "#" },
        { icon: Smartphone, label: "App Appearance", desc: "Logos, colors and theme settings", path: "#" },
      ]
    }
  ];

  // All roles in the system
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access, manage orders, inventory, and staff',
      permissions: ['View Dashboard', 'Manage Orders', 'Manage Products', 'Manage Inventory', 'Manage Delivery Boys', 'System Settings'],
      badge: 'Full Access'
    },
    {
      id: 'delivery_boy',
      name: 'Delivery Boy',
      description: 'View assigned orders and mark deliveries as complete',
      permissions: ['View Pending Orders', 'Mark Order Complete', 'View Customer Details', 'Call Customer'],
      badge: 'Limited Access'
    }
  ];

  const currentRole = roles.find(r => r.id === profile?.role);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      // Call account deletion service
      await AccountService.deleteAccount();

      toast('success', 'Account deleted successfully');

      // Sign out and redirect
      await signOut();
      setTimeout(() => navigate('/admin/login'), 500);
    } catch (err: any) {
      console.error('[Settings] Error deleting account:', err);
      toast('error', err?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-500">Configure your grocery platform preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.full_name}</h2>
            <p className="text-sm text-neutral-500">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {currentRole?.name}
            </span>
          </div>
        </div>
        <button className="px-4 py-2 border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
          Edit Profile
        </button>
      </div>

      {/* Store Configuration Section */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{section.title}</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {section.items.map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-neutral-50 rounded-xl text-neutral-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900">{item.label}</h4>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security & Roles Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-500" />
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Security & Roles</h3>
        </div>

        <div className="divide-y divide-neutral-100">
          {/* Current Role Display */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-neutral-900 text-lg">Your Role & Permissions</h4>
                <p className="text-sm text-neutral-500 mt-1">View your current access level and capabilities</p>
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                {currentRole?.badge}
              </span>
            </div>

            {currentRole && (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-neutral-900 text-base">{currentRole.name}</h5>
                  <p className="text-sm text-neutral-600 mt-1">{currentRole.description}</p>
                </div>

                <div>
                  <h5 className="font-semibold text-neutral-900 text-sm mb-2">Your Permissions:</h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentRole.permissions.map((permission, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* All Available Roles */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-neutral-600" />
                <h4 className="font-bold text-neutral-900">System Roles</h4>
              </div>
              <p className="text-sm text-neutral-500">All available roles in the system</p>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role.id === profile?.role
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-bold text-neutral-900">{role.name}</h5>
                      <p className="text-xs text-neutral-500 mt-0.5">{role.description}</p>
                    </div>
                    {role.id === profile?.role && (
                      <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-1 rounded">Current</span>
                    )}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3 text-xs text-neutral-600">
                    {role.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-emerald-600">✓</span> {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-lg">Danger Zone</h3>
            <p className="text-sm text-red-700 mt-1">Irreversible actions</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-red-900">Delete Your Account</h4>
                  <p className="text-xs text-red-700 mt-1">Permanently delete your account and all associated data</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  <Lock className="w-4 h-4" />
                  Delete Account
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-neutral-900">Sign Out</h4>
                  <p className="text-xs text-neutral-600 mt-1">Sign out from all sessions</p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/admin/login');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-bold rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900">Delete Account?</h2>
                  <p className="text-xs text-neutral-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-900">
                <p className="font-semibold mb-2">Warning:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>Your account will be permanently deleted</li>
                  <li>All your data will be removed</li>
                  <li>You won't be able to recover your account</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
