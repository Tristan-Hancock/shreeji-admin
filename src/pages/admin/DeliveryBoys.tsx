import { useEffect, useState } from 'react';
import {
  Plus,
  RefreshCcw,
  AlertTriangle,
  ShoppingBag,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeliveryService } from '../../services/delivery.service';
import { formatDate, cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import CreateDeliveryUserForm from '../../components/delivery/CreateDeliveryUserForm';
import type { Database } from '../../types/database';

type DeliveryProfile = Database['public']['Tables']['profiles']['Row'];

export default function DeliveryBoys() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<DeliveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDeliveryStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DeliveryService.listDeliveryStaff();
      setStaff(data);
    } catch (err) {
      console.error('[DeliveryBoys] Error fetching staff:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load delivery staff';
      setError(msg);
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryStaff();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const newStatus = !currentStatus;
      await DeliveryService.toggleDeliveryStaffStatus(id, newStatus);

      setStaff(
        staff.map((s) => (s.id === id ? { ...s, is_active: newStatus } : s))
      );

      const staffMember = staff.find((s) => s.id === id);
      const action = newStatus ? 'activated' : 'deactivated';
      toast('success', `${staffMember?.full_name} has been ${action}`);
    } catch (err) {
      console.error('[DeliveryBoys] Error toggling status:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast('error', msg);
    } finally {
      setTogglingId(null);
    }
  };

  if (error && !loading && staff.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Delivery Staff</h1>
          <p className="text-neutral-500">Manage delivery team members</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200"
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Failed to Load Staff</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </motion.div>
        <button
          onClick={fetchDeliveryStaff}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Delivery Staff</h1>
          <p className="text-neutral-500">Manage your delivery team ({staff.length} members)</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Delivery Member
        </button>
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Create Delivery User</h2>
                <p className="text-sm text-neutral-600 mb-6">
                  Add a new member to your delivery team
                </p>
                <CreateDeliveryUserForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    fetchDeliveryStaff();
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    Loading staff...
                  </td>
                </tr>
              ) : staff.length > 0 ? (
                staff.map((member) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                          {member.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-neutral-900">{member.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        {member.phone || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm">{member.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          member.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-600'
                        )}
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        {formatDate(member.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(member.id, member.is_active)
                        }
                        disabled={togglingId === member.id}
                        className={cn(
                          'p-2 rounded-lg transition-colors disabled:opacity-50',
                          member.is_active
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        )}
                        title={
                          member.is_active
                            ? 'Deactivate staff member'
                            : 'Reactivate staff member'
                        }
                      >
                        {member.is_active ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12">
                      <ShoppingBag className="h-12 w-12 text-neutral-300 mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-600">
                        No delivery staff yet
                      </h3>
                      <p className="text-neutral-500 mt-2">
                        Create your first delivery team member to get started
                      </p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Add First Member
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About Delivery Staff</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Delivery staff can login and see pending orders</li>
          <li>✓ They can mark orders as completed</li>
          <li>✓ Deactivate staff to revoke access without deleting their history</li>
          <li>✓ Only admins can create and manage delivery staff</li>
        </ul>
      </div>
    </div>
  );
}
