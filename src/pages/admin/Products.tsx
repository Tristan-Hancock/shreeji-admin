import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Archive,
  Package,
  AlertCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductsRepository } from '../../repositories/products.repository';
import { CategoriesRepository } from '../../repositories/categories.repository';
import { VariantsRepository } from '../../repositories/variants.repository';
import type { ProductListItem, Category } from '../../types/catalog';
import type { ProductInsert, VariantInsert } from '../../types/catalog';
import { cn, formatCurrency, generateSlug } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import ImagePreview from '../../components/ui/ImagePreview';
import ImageUpload from '../../components/ui/ImageUpload';
import { StorageService } from '../../services/storage.service';
import { useToast } from '../../components/ui/Toast';

// ─── Shared toggle ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        checked ? 'bg-emerald-500' : 'bg-neutral-300',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// ─── Product form (used inside slide panel) ───────────────────────────────

interface ProductFormValues {
  category_id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  image_url: string;
  is_active: boolean;
  price: string;
  mrp: string;
  stock_qty: string;
}

const BLANK_PRODUCT: ProductFormValues = {
  category_id: '',
  name: '',
  slug: '',
  brand: '',
  description: '',
  image_url: '',
  is_active: true,
  price: '',
  mrp: '',
  stock_qty: '0',
};

interface ProductFormProps {
  initial?: Partial<ProductFormValues>;
  categories: Category[];
  onSubmit: (v: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}

function ProductForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  submitting,
  error,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({ ...BLANK_PRODUCT, ...initial });
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));

  function handleNameChange(name: string) {
    setValues((p) => ({
      ...p,
      name,
      slug: slugLocked ? p.slug : generateSlug(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  const field = 'w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-shadow';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Section: Info */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Product Info
        </p>

        {/* Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Coca Cola"
              required
              className={field}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm select-none">
                /
              </span>
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  setValues((p) => ({ ...p, slug: e.target.value }));
                }}
                placeholder="coca-cola"
                required
                className={cn(field, 'pl-7 font-mono')}
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Auto-generated — edit to customise.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={values.category_id}
                onChange={(e) => setValues((p) => ({ ...p, category_id: e.target.value }))}
                required
                className={cn(field, 'appearance-none pr-8 cursor-pointer')}
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Brand <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={values.brand}
              onChange={(e) => setValues((p) => ({ ...p, brand: e.target.value }))}
              placeholder="e.g. Coca Cola"
              className={field}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Description <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={values.description}
              onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short product description…"
              rows={3}
              className={cn(field, 'resize-none')}
            />
          </div>
        </div>
      </div>

      {/* Section: Image */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Image
        </p>
        <ImageUpload
          value={values.image_url || null}
          onChange={(url) => setValues((p) => ({ ...p, image_url: url ?? '' }))}
          onUpload={StorageService.uploadProductImage}
          aspectRatio="16/9"
        />
      </div>

      {/* Section: Pricing */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
          Pricing
        </p>
        <p className="text-xs text-neutral-400 mb-3">
          Optional — sets a single default price. Leave blank to add variants with individual prices later.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Selling Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => setValues((p) => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              MRP (₹) <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.mrp}
              onChange={(e) => setValues((p) => ({ ...p, mrp: e.target.value }))}
              placeholder="0.00"
              className={field}
            />
          </div>
        </div>
        {values.price && (
          <div className="mt-3">
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={values.stock_qty}
              onChange={(e) => setValues((p) => ({ ...p, stock_qty: e.target.value }))}
              className={field}
            />
          </div>
        )}
      </div>

      {/* Section: Visibility */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Visibility
        </p>
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Active</p>
            <p className="text-xs text-neutral-500">Visible in the customer app</p>
          </div>
          <Toggle
            checked={values.is_active}
            onChange={() => setValues((p) => ({ ...p, is_active: !p.is_active }))}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

// ─── Slide panel wrapper (reuses Orders detail pattern) ───────────────────

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SlidePanel({ open, onClose, title, subtitle, children }: SlidePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Products() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [archiving, setArchiving] = useState<ProductListItem | null>(null);

  // ── Data ─────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductsRepository.listProducts({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        activeOnly: !showArchived ? undefined : undefined,
      });
      setProducts(showArchived ? data : data.filter((p) => p.is_active));
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showArchived]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    CategoriesRepository.listCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // ── Panel helpers ────────────────────────────────────────────────────────

  function openCreate() {
    setFormError(null);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setFormError(null);
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const product = await ProductsRepository.createProduct({
        category_id: values.category_id,
        name: values.name.trim(),
        slug: values.slug.trim(),
        brand: values.brand.trim() || null,
        description: values.description.trim() || null,
        image_url: values.image_url.trim() || null,
        is_active: values.is_active,
      } as ProductInsert);

      const price = parseFloat(values.price);
      if (!isNaN(price) && price > 0) {
        await VariantsRepository.createVariant({
          product_id: product.id,
          variant_name: 'Default',
          price,
          mrp: values.mrp ? parseFloat(values.mrp) : null,
          stock_qty: parseInt(values.stock_qty, 10) || 0,
          is_active: true,
        } as VariantInsert);
      }

      closePanel();
      await fetchProducts();
    } catch (err: any) {
      setFormError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Toggle ───────────────────────────────────────────────────────────────

  async function handleToggle(product: ProductListItem) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p,
      ),
    );
    try {
      await ProductsRepository.toggleProductStatus(product.id, !product.is_active);
    } catch (err) {
      console.error('Toggle failed:', err);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: product.is_active } : p,
        ),
      );
    }
  }

  // ── Archive ──────────────────────────────────────────────────────────────

  async function handleArchive() {
    if (!archiving) return;
    try {
      await ProductsRepository.archiveProduct(archiving.id);
      setArchiving(null);
      toast('success', 'Product archived');
      await fetchProducts();
    } catch (err: any) {
      setArchiving(null);
      toast('error', err?.message ?? 'Failed to archive product');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products Catalog</h1>
          <p className="text-neutral-500 text-sm">
            {loading ? '' : `${products.length} product${products.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-emerald-100"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-neutral-600 font-medium">Show Archived</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider w-12" />
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Brand
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Price
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                  Variants
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                  Stock
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={8} />
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50/60 transition-colors group"
                  >
                    {/* Image thumb */}
                    <td className="px-5 py-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        <ImagePreview
                          url={product.image_url}
                          alt={product.name}
                          className="w-full h-full"
                        />
                      </div>
                    </td>

                    {/* Name + slug */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-neutral-900 leading-snug">
                        {product.name}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        /{product.slug}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                        {product.categories?.name ?? '—'}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-neutral-600">
                        {product.brand ?? <span className="text-neutral-300">—</span>}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {product.min_price != null ? (
                        product.min_price === product.max_price ? (
                          <span className="text-sm font-semibold text-neutral-900">
                            {formatCurrency(product.min_price)}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-neutral-900">
                            {formatCurrency(product.min_price)}
                            <span className="text-xs text-neutral-400 font-normal ml-1">
                              – {formatCurrency(product.max_price!)}
                            </span>
                          </span>
                        )
                      ) : (
                        <span className="text-sm text-neutral-300">—</span>
                      )}
                    </td>

                    {/* Variants */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm font-semibold text-neutral-900">
                        {product.variant_count}
                      </span>
                      {product.active_variants < product.variant_count && (
                        <span className="text-xs text-neutral-400 ml-1">
                          ({product.active_variants} active)
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          product.total_stock === 0
                            ? 'text-red-600'
                            : product.total_stock < 10
                            ? 'text-amber-600'
                            : 'text-neutral-900',
                        )}
                      >
                        {product.total_stock}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">units</span>
                    </td>

                    {/* Status + toggle */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                        <Toggle
                          checked={product.is_active}
                          onChange={() => handleToggle(product)}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          title="View product detail"
                          className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          title="Edit product & variants"
                          className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {product.is_active && (
                          <button
                            onClick={() => setArchiving(product)}
                            title="Archive product"
                            className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={Package}
                      title={
                        search || categoryFilter
                          ? 'No products match your filters'
                          : 'No products yet'
                      }
                      description={
                        search || categoryFilter
                          ? 'Try adjusting your search or category filter.'
                          : 'Add your first product to start building your catalog.'
                      }
                      action={
                        !search && !categoryFilter
                          ? { label: 'Add Product', onClick: openCreate }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product slide panel */}
      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title="Add Product"
      >
        <ProductForm
          key="new"
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closePanel}
          submitting={submitting}
          error={formError}
        />
      </SlidePanel>

      {/* Archive confirmation */}
      <ConfirmDialog
        open={Boolean(archiving)}
        onClose={() => setArchiving(null)}
        onConfirm={handleArchive}
        title="Archive Product?"
        description="This product will be hidden from the storefront. Historical orders will remain preserved."
        confirmLabel="Archive Product"
        variant="warning"
      />
    </div>
  );
}
