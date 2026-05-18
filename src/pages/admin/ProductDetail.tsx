import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Check,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Package,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductsRepository } from '../../repositories/products.repository';
import { VariantsRepository } from '../../repositories/variants.repository';
import type { ProductWithVariants, ProductVariant, VariantInsert, VariantUpdate } from '../../types/catalog';
import { UNIT_TYPES } from '../../types/catalog';
import { cn, formatCurrency } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import ImagePreview from '../../components/ui/ImagePreview';
import { Skeleton, TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

// ─── Toggle ───────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none',
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

// ─── Variant form ─────────────────────────────────────────────────────────

interface VariantFormValues {
  variant_name: string;
  sku: string;
  unit_value: string;
  unit_type: string;
  price: string;
  mrp: string;
  stock_qty: string;
  is_active: boolean;
}

const BLANK_VARIANT: VariantFormValues = {
  variant_name: '',
  sku: '',
  unit_value: '',
  unit_type: '',
  price: '',
  mrp: '',
  stock_qty: '0',
  is_active: true,
};

function variantToForm(v: ProductVariant): VariantFormValues {
  return {
    variant_name: v.variant_name,
    sku: v.sku ?? '',
    unit_value: v.unit_value ?? '',
    unit_type: v.unit_type ?? '',
    price: String(v.price),
    mrp: v.mrp != null ? String(v.mrp) : '',
    stock_qty: String(v.stock_qty),
    is_active: v.is_active,
  };
}

interface VariantFormProps {
  initial?: VariantFormValues;
  onSubmit: (v: VariantFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}

function VariantForm({ initial, onSubmit, onCancel, submitting, error }: VariantFormProps) {
  const [values, setValues] = useState<VariantFormValues>(initial ?? BLANK_VARIANT);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  const field =
    'w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-shadow';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Details */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Variant Details
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Variant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.variant_name}
              onChange={(e) => setValues((p) => ({ ...p, variant_name: e.target.value }))}
              placeholder="e.g. 250ml, Large, 1kg"
              required
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              SKU <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={values.sku}
              onChange={(e) => setValues((p) => ({ ...p, sku: e.target.value }))}
              placeholder="e.g. CC-250"
              className={cn(field, 'font-mono')}
            />
          </div>
        </div>
      </div>

      {/* Sizing */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Sizing
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Unit Value
            </label>
            <input
              type="text"
              value={values.unit_value}
              onChange={(e) => setValues((p) => ({ ...p, unit_value: e.target.value }))}
              placeholder="e.g. 250"
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Unit Type
            </label>
            <div className="relative">
              <select
                value={values.unit_type}
                onChange={(e) => setValues((p) => ({ ...p, unit_type: e.target.value }))}
                className={cn(field, 'appearance-none pr-8 cursor-pointer')}
              >
                <option value="">Select…</option>
                {UNIT_TYPES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Pricing
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Selling Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => setValues((p) => ({ ...p, price: e.target.value }))}
              placeholder="0.00"
              required
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
      </div>

      {/* Inventory */}
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Inventory
        </p>
        <div>
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
      </div>

      {/* Visibility */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Active</p>
          <p className="text-xs text-neutral-500">Orderable by customers</p>
        </div>
        <Toggle
          checked={values.is_active}
          onChange={() => setValues((p) => ({ ...p, is_active: !p.is_active }))}
        />
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
          {submitting ? 'Saving…' : 'Save Variant'}
        </button>
      </div>
    </form>
  );
}

// ─── Slide panel ──────────────────────────────────────────────────────────

function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

// ─── Inline stock editor ──────────────────────────────────────────────────

interface StockEditorProps {
  variantId: string;
  current: number;
  onSave: (variantId: string, qty: number) => Promise<void>;
}

function StockEditor({ variantId, current, onSave }: StockEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave(variantId, value);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(current);
          setEditing(true);
        }}
        className={cn(
          'flex items-center gap-1.5 text-sm font-bold group/stock',
          current === 0
            ? 'text-red-600'
            : current < 10
            ? 'text-amber-600'
            : 'text-neutral-900',
        )}
        title="Click to edit stock"
      >
        {current}
        {current < 10 && <AlertTriangle className="w-3.5 h-3.5" />}
        <Edit2 className="w-3 h-3 opacity-0 group-hover/stock:opacity-60 transition-opacity ml-0.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value, 10) || 0)}
        autoFocus
        className="w-20 px-2 py-1 border border-emerald-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <button
        onClick={save}
        disabled={saving}
        className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ProductsRepository.getProduct(id);
      setProduct(data);
    } catch (err: any) {
      if (err?.code === 'PGRST116') setNotFound(true);
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ── Variant panel helpers ─────────────────────────────────────────────────

  function openAddVariant() {
    setEditingVariant(null);
    setVariantError(null);
    setPanelOpen(true);
  }

  function openEditVariant(v: ProductVariant) {
    setEditingVariant(v);
    setVariantError(null);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingVariant(null);
    setVariantError(null);
  }

  // ── Variant submit ────────────────────────────────────────────────────────

  async function handleVariantSubmit(values: VariantFormValues) {
    if (!product) return;
    setSubmitting(true);
    setVariantError(null);
    try {
      const payload = {
        product_id: product.id,
        variant_name: values.variant_name.trim(),
        sku: values.sku.trim() || null,
        unit_value: values.unit_value.trim() || null,
        unit_type: values.unit_type || null,
        price: parseFloat(values.price),
        mrp: values.mrp ? parseFloat(values.mrp) : null,
        stock_qty: parseInt(values.stock_qty, 10) || 0,
        is_active: values.is_active,
      };

      if (editingVariant) {
        const updated = await VariantsRepository.updateVariant(editingVariant.id, payload as VariantUpdate);
        setProduct((p) =>
          p
            ? {
                ...p,
                product_variants: p.product_variants.map((v) =>
                  v.id === editingVariant.id ? updated : v,
                ),
              }
            : p,
        );
      } else {
        const created = await VariantsRepository.createVariant(payload as VariantInsert);
        setProduct((p) =>
          p
            ? { ...p, product_variants: [...p.product_variants, created] }
            : p,
        );
      }

      closePanel();
    } catch (err: any) {
      setVariantError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Stock update ──────────────────────────────────────────────────────────

  async function handleStockUpdate(variantId: string, qty: number) {
    const updated = await VariantsRepository.updateVariantStock(variantId, qty);
    setProduct((p) =>
      p
        ? {
            ...p,
            product_variants: p.product_variants.map((v) =>
              v.id === variantId ? updated : v,
            ),
          }
        : p,
    );
  }

  // ── Variant toggle ────────────────────────────────────────────────────────

  async function handleVariantToggle(variant: ProductVariant) {
    // Optimistic update
    setProduct((p) =>
      p
        ? {
            ...p,
            product_variants: p.product_variants.map((v) =>
              v.id === variant.id ? { ...v, is_active: !v.is_active } : v,
            ),
          }
        : p,
    );
    try {
      await VariantsRepository.toggleVariantStatus(variant.id, !variant.is_active);
    } catch (err) {
      console.error('Variant toggle failed:', err);
      setProduct((p) =>
        p
          ? {
              ...p,
              product_variants: p.product_variants.map((v) =>
                v.id === variant.id ? { ...v, is_active: variant.is_active } : v,
              ),
            }
          : p,
      );
    }
  }

  // ── Product status toggle ─────────────────────────────────────────────────

  async function handleProductToggle() {
    if (!product) return;
    const next = !product.is_active;
    setProduct((p) => (p ? { ...p, is_active: next } : p));
    try {
      await ProductsRepository.toggleProductStatus(product.id, next);
    } catch (err) {
      console.error('Product toggle failed:', err);
      setProduct((p) => (p ? { ...p, is_active: !next } : p));
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may have been removed or the URL is incorrect."
          action={{ label: 'Back to Products', onClick: () => navigate('/admin/products') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Products
      </button>

      {/* Product info card */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex gap-6">
            <Skeleton className="w-32 h-32 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ) : product ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Image */}
            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
              <ImagePreview
                url={product.image_url}
                alt={product.name}
                className="w-full h-full"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">{product.name}</h1>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {product.categories?.name ?? 'Uncategorised'}
                    {product.brand && (
                      <span className="text-neutral-400"> · {product.brand}</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-400 font-mono mt-1">/{product.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                  <Toggle checked={product.is_active} onChange={handleProductToggle} />
                </div>
              </div>

              {product.description && (
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Quick stats */}
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { label: 'Variants', value: product.product_variants.length },
                  {
                    label: 'Total Stock',
                    value: product.product_variants.reduce((s, v) => s + v.stock_qty, 0),
                  },
                  {
                    label: 'Active Variants',
                    value: product.product_variants.filter((v) => v.is_active).length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg font-black text-neutral-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Variants section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Variants</h2>
          <button
            onClick={openAddVariant}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-emerald-100"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                    SKU
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                    Unit
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                    MRP
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
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
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={8} />
                  ))
                ) : product && product.product_variants.length > 0 ? (
                  product.product_variants.map((variant) => (
                    <tr
                      key={variant.id}
                      className="hover:bg-neutral-50/60 transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-neutral-900">
                          {variant.variant_name}
                        </p>
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs font-mono text-neutral-500">
                          {variant.sku ?? <span className="text-neutral-300">—</span>}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-neutral-600">
                          {variant.unit_value && variant.unit_type
                            ? `${variant.unit_value} ${variant.unit_type}`
                            : variant.unit_value || variant.unit_type || (
                                <span className="text-neutral-300">—</span>
                              )}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-neutral-900">
                          {formatCurrency(variant.price)}
                        </span>
                      </td>

                      {/* MRP */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-neutral-500 line-through">
                          {variant.mrp != null ? (
                            formatCurrency(variant.mrp)
                          ) : (
                            <span className="no-underline text-neutral-300">—</span>
                          )}
                        </span>
                      </td>

                      {/* Stock (inline editable) */}
                      <td className="px-5 py-4">
                        <StockEditor
                          variantId={variant.id}
                          current={variant.stock_qty}
                          onSave={handleStockUpdate}
                        />
                      </td>

                      {/* Status + toggle */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={variant.is_active ? 'active' : 'inactive'} />
                          <Toggle
                            checked={variant.is_active}
                            onChange={() => handleVariantToggle(variant)}
                          />
                        </div>
                      </td>

                      {/* Edit */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => openEditVariant(variant)}
                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit variant"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={Package}
                        title="No variants yet"
                        description="Add your first variant (size, weight, etc.) to make this product orderable."
                        action={{ label: 'Add Variant', onClick: openAddVariant }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit variant slide panel */}
      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        subtitle={product?.name}
      >
        <VariantForm
          key={editingVariant?.id ?? 'new'}
          initial={editingVariant ? variantToForm(editingVariant) : undefined}
          onSubmit={handleVariantSubmit}
          onCancel={closePanel}
          submitting={submitting}
          error={variantError}
        />
      </SlidePanel>
    </div>
  );
}
