import { useEffect, useState } from 'react';
import {
  Search,
  MessageCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  RefreshCcw,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrdersRepository, type OrderWithItems } from '../../repositories';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';

export default function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrdersRepository.listAdminOrders();
      setOrders(data);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to load orders';
      console.error('[Orders page] fetch error:', err);
      setError(msg);
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await OrdersRepository.updateStatus(id, status);
      toast('success', `Order status updated to ${status.replace(/_/g, ' ')}`);
      await fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: status as any } : null,
        );
      }
    } catch (err: any) {
      console.error('[Orders page] status update error:', err);
      toast('error', err?.message ?? 'Failed to update order status');
    }
  };


  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.order_status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (order.customer_name ?? '').toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      (order.phone ?? '').includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const sendWhatsApp = (order: OrderWithItems) => {
    const phone = (order.phone ?? '').startsWith('+')
      ? (order.phone ?? '').replace(/\D/g, '')
      : `91${(order.phone ?? '').replace(/\D/g, '')}`;
    const statusLabel = (order.order_status ?? 'unknown').replace(/_/g, ' ');
    const message =
      `Hello ${order.customer_name ?? 'Customer'}, your order #${order.id.slice(0, 8)} has been updated.\n\n` +
      `Status: ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}\n` +
      `Amount: ₹${(order.total ?? 0).toFixed(2)}\n\n` +
      `Thank you for shopping with us!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // ── Error state ───────────────────────────────────────────────────────────

  if (error && !loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Orders Management</h1>
          <p className="text-neutral-500">View and process customer orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-red-50 rounded-2xl mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Failed to load orders</h3>
            <p className="text-sm text-neutral-500 max-w-xs mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Orders Management</h1>
          <p className="text-neutral-500">View and process customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCcw className={cn("w-5 h-5 text-neutral-500", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{order.customer_name ?? '—'}</span>
                        <span className="text-xs text-neutral-500">{order.customer_phone ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {formatCurrency(order.total ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.order_status ?? 'pending'} />
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sendWhatsApp(order)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Contact via WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors md:hidden"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={ShoppingBag}
                      title={searchQuery || filter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
                      description={
                        searchQuery || filter !== 'all'
                          ? 'Try adjusting your search or status filter.'
                          : 'Orders will appear here once customers start placing them.'
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-neutral-500">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-neutral-100 rounded-full"
                >
                  <XCircle className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Customer</span>
                    <p className="text-sm font-bold">{selectedOrder.customer_name ?? '—'}</p>
                    <p className="text-xs text-neutral-600">{selectedOrder.customer_phone ?? '—'}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Payment</span>
                    <p className="text-sm font-bold uppercase">{selectedOrder.payment_method ?? '—'}</p>
                    <StatusBadge status={selectedOrder.status ?? 'pending'} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Delivery Address</span>
                  <div className="flex gap-3 items-start p-4 border border-neutral-100 rounded-2xl">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{selectedOrder.customer_address ?? '—'}</p>
                      <p className="text-sm font-bold mt-1">Pincode: {selectedOrder.pincode ?? '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Order Items</span>
                  <div className="space-y-3">
                    {(selectedOrder.order_items ?? []).length > 0 ? (
                      selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-neutral-100 rounded-xl">
                          <div>
                            <p className="text-sm font-bold">{item.product_name ?? '—'}</p>
                            <p className="text-xs text-neutral-500">{item.variant_name ?? '—'} x {item.quantity ?? 0}</p>
                          </div>
                          <p className="text-sm font-bold">{formatCurrency((item.price_at_order ?? 0) * (item.quantity ?? 0))}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-neutral-400 text-sm">No items found</div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="font-bold text-emerald-900">Total Amount</span>
                    <span className="text-lg font-black text-emerald-900">{formatCurrency(selectedOrder.total_amount ?? 0)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Actions</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                          className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                          className="flex items-center justify-center gap-2 p-3 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'completed' && (
                      <div className="col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                        <p className="text-sm font-semibold text-emerald-900">✓ Order Completed</p>
                      </div>
                    )}
                    {selectedOrder.status === 'cancelled' && (
                      <div className="col-span-2 p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                        <p className="text-sm font-semibold text-red-900">✗ Order Cancelled</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => sendWhatsApp(selectedOrder)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-emerald-100 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" /> Message on WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
