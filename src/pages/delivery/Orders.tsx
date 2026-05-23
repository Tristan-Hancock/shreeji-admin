import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { OrdersRepository } from '../../repositories';
import type { OrderWithItems } from '../../repositories';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatOrderAddress } from '../../lib/utils';
import { motion } from 'motion/react';

export default function DeliveryOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        console.log('[DeliveryOrders] Fetching pending orders...');
        setLoading(true);
        setError(null);
        const data = await OrdersRepository.listPendingOrders();
        console.log('[DeliveryOrders] Orders fetched:', {
          count: data.length,
          orders: data.map(o => ({ id: o.id, status: o.order_status, customer: o.customer_name }))
        });
        setOrders(data);
      } catch (err) {
        console.error('[DeliveryOrders] Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleOrderClick = (orderId: string) => {
    navigate(`/delivery/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Pending Orders</h1>
        <p className="mt-2 text-neutral-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} ready for delivery
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error Loading Orders</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 py-12">
          <ShoppingBag className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600">No Pending Orders</h3>
          <p className="mt-2 text-neutral-500">
            All orders have been delivered! Great work.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {orders.map((order) => (
            <motion.button
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="text-left"
            >
              <div className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                {/* Header: Order ID and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Order ID</p>
                    <p className="font-mono font-bold text-neutral-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge status={order.order_status} />
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {order.customer_name || 'Unknown Customer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Phone className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    {order.phone || 'N/A'}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-neutral-700">
                    <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {formatOrderAddress(
                        order.address_line_1,
                        order.address_line_2,
                        order.landmark,
                        order.city,
                        order.state,
                        order.pincode
                      )}
                    </span>
                  </div>
                </div>

                {/* Items Count & Total */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded bg-blue-50 p-2">
                    <p className="text-xs text-blue-600 font-semibold">Items</p>
                    <p className="text-lg font-bold text-blue-900">
                      {order.order_items?.length || 0}
                    </p>
                  </div>
                  <div className="rounded bg-emerald-50 p-2">
                    <p className="text-xs text-emerald-600 font-semibold">Total</p>
                    <p className="text-lg font-bold text-emerald-900">
                      {formatCurrency(order.total || 0)}
                    </p>
                  </div>
                </div>

                {/* Order Time */}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Clock className="h-4 w-4" />
                  {formatDate(order.created_at)}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
