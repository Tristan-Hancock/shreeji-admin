import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  MessageCircle,
  Truck,
  PackageCheck,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrdersRepository, type Order } from '../../repositories';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { order_items: any[] }) | null>(null);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await OrdersRepository.getAll();
      setOrders(data as any);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    try {
      await OrdersRepository.updateStatus(id, status);
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const sendWhatsApp = (order: Order) => {
    const message = `Hello ${order.customer_name}, your order #${order.id.slice(0, 8)} status has been updated to ${order.status.replace(/_/g, ' ')}. Summarize: ${order.total_amount}.`;
    window.open(`https://wa.me/${order.customer_phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

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
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="packed">Packed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">Loading orders...</td>
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
                        <span className="text-sm font-bold">{order.customer_name}</span>
                        <span className="text-xs text-neutral-500">{order.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
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
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No orders found</td>
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
                    <p className="text-sm font-bold">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-neutral-600">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-2xl">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase mb-1 block">Payment</span>
                    <p className="text-sm font-bold uppercase">{selectedOrder.payment_method}</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Delivery Address</span>
                  <div className="flex gap-3 items-start p-4 border border-neutral-100 rounded-2xl">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{selectedOrder.customer_address}</p>
                      <p className="text-sm font-bold mt-1">Pincode: {selectedOrder.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Order Items</span>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border border-neutral-100 rounded-xl">
                        <div>
                          <p className="text-sm font-bold">{item.product_name}</p>
                          <p className="text-xs text-neutral-500">{item.variant_name} x {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(item.price_at_order * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="font-bold text-emerald-900">Total Amount</span>
                    <span className="text-lg font-black text-emerald-900">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase mb-3 block">Update Status</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'accepted')}
                        className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept Order
                      </button>
                    )}
                    {selectedOrder.status === 'accepted' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'packed')}
                        className="flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        <PackageCheck className="w-4 h-4" /> Mark Packed
                      </button>
                    )}
                    {selectedOrder.status === 'packed' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'out_for_delivery')}
                        className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all"
                      >
                        <Truck className="w-4 h-4" /> Out for Delivery
                      </button>
                    )}
                    {selectedOrder.status === 'out_for_delivery' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                        className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Delivered
                      </button>
                    )}
                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="flex items-center justify-center gap-2 p-3 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Order
                      </button>
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
