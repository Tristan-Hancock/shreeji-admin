import { useEffect, useState } from 'react';
import {
  Search,
  AlertTriangle,
  RefreshCcw,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { ProductsRepository } from '../../repositories/products.repository';
import { VariantsRepository } from '../../repositories/variants.repository';
import { cn } from '../../lib/utils';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ProductsRepository.getAllWithVariants();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStock = async (variantId: string) => {
    try {
      await VariantsRepository.updateVariantStock(variantId, editValue);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const allVariants = products.flatMap(p =>
    p.product_variants.map((v: any) => ({
      ...v,
      productName: p.name,
    }))
  );

  const filteredVariants = allVariants.filter((v: any) =>
    v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.variant_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = allVariants.filter(v => v.stock_qty < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-neutral-500">Track and update stock levels</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            {lowStockCount} Low Stock
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <RefreshCcw className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search products or variants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Product & Variant</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-400">Loading inventory...</td></tr>
              ) : filteredVariants.length > 0 ? (
                filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{variant.productName}</span>
                        <span className="text-xs text-neutral-500">{variant.variant_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-neutral-500">
                        {variant.sku ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === variant.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 px-2 py-1 border border-emerald-500 rounded-md outline-none text-sm"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value))}
                            autoFocus
                          />
                          <button onClick={() => handleUpdateStock(variant.id)} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-neutral-200 text-neutral-600 rounded hover:bg-neutral-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-bold",
                            variant.stock_qty < 10 ? "text-red-600" : "text-neutral-900"
                          )}>
                            {variant.stock_qty} units
                          </span>
                          {variant.stock_qty < 10 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingId(variant.id);
                          setEditValue(variant.stock_qty);
                        }}
                        className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-400">No stock items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
//dummy commit