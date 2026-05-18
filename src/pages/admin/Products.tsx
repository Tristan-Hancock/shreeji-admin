import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Package
} from 'lucide-react';
import { ProductsRepository } from '../../repositories';
import { formatCurrency, cn } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await ProductsRepository.getAllWithVariants();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleProduct = async (id: string, currentStatus: boolean) => {
    try {
      await ProductsRepository.toggleProductActive(id, !currentStatus);
      fetchData();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products Catalog</h1>
          <p className="text-neutral-500">Manage categories, products and pricing</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100">
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
              activeCategory === cat 
                ? "bg-neutral-900 text-white border-neutral-900" 
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
            )}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-400">Loading catalog...</div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className={cn(
              "bg-white rounded-2xl border transition-all hover:shadow-lg overflow-hidden group",
              product.is_active ? "border-neutral-200" : "border-neutral-100 opacity-75"
            )}>
              <div className="aspect-[16/9] relative bg-neutral-100">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleProduct(product.id, product.is_active)}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-neutral-600 hover:text-emerald-600"
                  >
                    {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-neutral-600 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{product.category}</span>
                  <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                
                <div className="mt-4 space-y-2">
                  {product.product_variants.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100 group-hover:bg-white group-hover:border-neutral-200 transition-all">
                      <span className="text-xs font-bold text-neutral-600">{v.name}</span>
                      <span className="text-sm font-black text-neutral-900">{formatCurrency(v.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-400">No products found</div>
        )}
      </div>
    </div>
  );
}
