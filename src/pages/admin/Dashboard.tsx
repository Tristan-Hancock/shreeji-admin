import { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  MapPin,
  Truck,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { OrdersRepository, type OrderWithItems } from '../../repositories';
import { ProductsRepository } from '../../repositories/products.repository';
import { formatCurrency, cn } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    revenue: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setFetchError(null);

      let orders: OrderWithItems[] = [];
      try {
        orders = await OrdersRepository.listAdminOrders();
      } catch (err: any) {
        console.error('Dashboard: failed to load orders:', err);
        setFetchError(err?.message ?? 'Failed to load orders');
      }

      let lowStockCount = 0;
      try {
        const products = await ProductsRepository.getAllWithVariants();
        products.forEach(p => {
          (p.product_variants ?? []).forEach((v: any) => {
            if (v.stock_qty < 10) lowStockCount++;
          });
        });
      } catch (err) {
        console.error('Dashboard: failed to load products:', err);
      }

      // Debug: log actual status values from DB so mismatches are visible
      const statusCounts: Record<string, number> = {};
      orders.forEach(o => {
        const s = o.order_status ?? '(null)';
        statusCounts[s] = (statusCounts[s] ?? 0) + 1;
      });
      console.log('[Dashboard] order status breakdown:', statusCounts);

      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => {
        try { return new Date(o.created_at).toDateString() === today; }
        catch { return false; }
      });

      const s = (v: string | null | undefined) => (v ?? '').toLowerCase().trim();

      const pending = orders.filter(o => {
        const st = s(o.order_status);
        return st === 'pending';
      }).length;
      const delivered = orders.filter(o => s(o.order_status) === 'completed').length;
      const revenue = orders
        .filter(o => s(o.order_status) === 'completed')
        .reduce((sum, o) => sum + (o.total ?? 0), 0);

      setStats({
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        pendingOrders: pending,
        deliveredOrders: delivered,
        revenue,
        lowStock: lowStockCount,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-96 flex items-center justify-center text-neutral-400">Loading metrics...</div>;
  }

  const widgets = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-neutral-700", bg: "bg-neutral-100" },
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Delivered", value: stats.deliveredOrders, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Revenue", value: formatCurrency(stats.revenue), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h1>
        <p className="text-neutral-500">Real-time operational summary</p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Orders failed to load: {fetchError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {widgets.map((widget, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={cn("inline-flex p-2.5 rounded-xl mb-4", widget.bg)}>
              <widget.icon className={cn("w-6 h-6", widget.color)} />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-neutral-900">{widget.value}</span>
              <span className="text-sm font-medium text-neutral-500">{widget.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Orders */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">#{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-neutral-500">{order.customer_name ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">{formatCurrency(order.total ?? 0)}</span>
                    <StatusBadge status={order.order_status ?? 'pending'} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-400 text-sm">No orders yet</div>
            )}
          </div>
        </section>

        {/* Operational Tasks Quick Links */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Operational Shortcuts</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/inventory" className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-600" />
              <span className="text-sm font-bold">Manage Inventory</span>
            </Link>
            <Link to="/admin/pincodes" className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-3">
              <MapPin className="w-8 h-8 text-emerald-600" />
              <span className="text-sm font-bold">Service Areas</span>
            </Link>
            <Link to="/admin/delivery-boys" className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />
              <span className="text-sm font-bold">Staff Mgmt</span>
            </Link>
            <Link to="/admin/settings" className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-3">
              <Settings className="w-8 h-8 text-emerald-600" />
              <span className="text-sm font-bold">Store Settings</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
