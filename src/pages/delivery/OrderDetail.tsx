import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Package,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { OrdersRepository } from '../../repositories';
import type { OrderWithItems } from '../../repositories';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatOrderAddress } from '../../lib/utils';
import { motion } from 'motion/react';
import { useToast } from '../../components/ui/Toast';

export default function DeliveryOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const orderData = await OrdersRepository.getAdminOrder(id);
        setOrder(orderData);
      } catch (err) {
        console.error('[DeliveryOrderDetail] Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleMarkCompleted = async () => {
    if (!id || !order) return;

    try {
      setCompleting(true);
      await OrdersRepository.updateStatus(id, 'completed');
      toast('success', 'Order marked as completed');
      setTimeout(() => navigate('/delivery/orders'), 1000);
    } catch (err) {
      console.error('[DeliveryOrderDetail] Error updating status:', err);
      toast('error', err instanceof Error ? err.message : 'Failed to mark completed');
    } finally {
      setCompleting(false);
    }
  };

  const handleCallCustomer = () => {
    if (order?.phone) {
      window.location.href = `tel:${order.phone}`;
    }
  };

  const handleOpenMaps = () => {
    if (order) {
      const address = formatOrderAddress(
        order.address_line_1,
        order.address_line_2,
        order.landmark,
        order.city,
        order.state,
        order.pincode
      );
      const encodedAddress = encodeURIComponent(address);
      window.open(
        `https://maps.google.com/?q=${encodedAddress}`,
        '_blank'
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/delivery/orders')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error Loading Order</h3>
            <p className="text-sm mt-1">{error || 'Order not found'}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/delivery/orders')}
        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-1">Order ID</p>
          <p className="font-mono text-lg font-bold text-neutral-900">
            {order.id.toUpperCase()}
          </p>
        </div>
        <StatusBadge status={order.order_status} />
      </div>

      {/* Customer Information */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-bold text-neutral-900 mb-4 text-lg">Customer</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-neutral-500 font-semibold mb-1">Name</p>
            <p className="text-sm font-bold text-neutral-900">
              {order.customer_name || 'Unknown'}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-500 font-semibold mb-1">Phone</p>
            <p className="text-sm font-semibold text-neutral-900">
              {order.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-500 font-semibold mb-1">Delivery Address</p>
            <p className="text-sm text-neutral-900 mt-1">
              {formatOrderAddress(
                order.address_line_1,
                order.address_line_2,
                order.landmark,
                order.city,
                order.state,
                order.pincode
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-bold text-neutral-900 mb-4 text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items ({order.order_items?.length || 0})
        </h2>

        {!order.order_items || order.order_items.length === 0 ? (
          <p className="text-sm text-neutral-500">No items in this order</p>
        ) : (
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 border border-neutral-100"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.product_name_snapshot || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Qty: {item.quantity} × {formatCurrency(item.price_snapshot)}
                  </p>
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  {formatCurrency(item.total || 0)}
                </p>
              </div>
            ))}

            {/* Total Amount */}
            <div className="border-t border-neutral-100 pt-3 mt-3">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                <span className="text-sm font-semibold text-emerald-900">Total Amount</span>
                <span className="text-lg font-bold text-emerald-900">
                  {formatCurrency(order.total || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Large for Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleCallCustomer}
          disabled={!order.phone}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-4 font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          <Phone className="h-5 w-5" />
          Call
        </button>

        <button
          onClick={handleOpenMaps}
          disabled={!order.address_line_1}
          className="flex items-center justify-center gap-2 rounded-lg bg-purple-50 px-4 py-4 font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
        >
          <MapPin className="h-5 w-5" />
          Maps
        </button>

        <button
          onClick={handleMarkCompleted}
          disabled={completing || order.order_status !== 'pending'}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-4 font-semibold text-white hover:bg-emerald-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {completing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Completed
            </>
          )}
        </button>
      </div>

      {/* Order Info */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 text-sm text-blue-700">
        <p className="font-semibold mb-1">Order Placed</p>
        <p>{formatDate(order.created_at)}</p>
      </div>
    </motion.div>
  );
}
