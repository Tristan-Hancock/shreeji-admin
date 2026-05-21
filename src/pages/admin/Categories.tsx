import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Grid3X3, AlertCircle } from 'lucide-react';
import { CategoriesRepository } from '../../repositories/categories.repository';
import type { CategoryWithCount } from '../../types/catalog';
import { cn, generateSlug } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import ImagePreview from '../../components/ui/ImagePreview';
import ImageUpload from '../../components/ui/ImageUpload';
import { StorageService } from '../../services/storage.service';
import { useToast } from '../../components/ui/Toast';

// ─── Toggle switch (shared between form and cards) ────────────────────────

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

// ─── Category form ────────────────────────────────────────────────────────

interface CategoryFormValues {
  name: string;
  slug: string;
  image_url: string;
  is_active: boolean;
}

const BLANK_FORM: CategoryFormValues = {
  name: '',
  slug: '',
  image_url: '',
  is_active: true,
};

interface CategoryFormProps {
  initial?: Partial<CategoryFormValues>;
  onSubmit: (v: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}

function CategoryForm({ initial, onSubmit, onCancel, submitting, error }: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>({ ...BLANK_FORM, ...initial });
  // Track whether the slug was manually edited so auto-gen stops
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));

  function handleNameChange(name: string) {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugLocked ? prev.slug : generateSlug(name),
    }));
  }

  function handleSlugChange(raw: string) {
    setSlugLocked(true);
    setValues((prev) => ({ ...prev, slug: raw }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Dairy & Eggs"
          required
          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-shadow"
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
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="dairy-eggs"
            required
            className="w-full pl-7 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm font-mono transition-shadow"
          />
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">
          Auto-generated from name — edit to customise.
        </p>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Image{' '}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <ImageUpload
          value={values.image_url || null}
          onChange={(url) => setValues((p) => ({ ...p, image_url: url ?? '' }))}
          onUpload={StorageService.uploadCategoryImage}
          aspectRatio="16/9"
        />
      </div>

      {/* Active toggle */}
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
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
          {submitting ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}

// ─── Category card ────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: CategoryWithCount;
  onEdit: (c: CategoryWithCount) => void;
  onToggle: (c: CategoryWithCount) => void;
  onDelete: (c: CategoryWithCount) => void;
}

function CategoryCard({ category, onEdit, onToggle, onDelete }: CategoryCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border overflow-hidden transition-all group hover:shadow-md',
        category.is_active ? 'border-neutral-200' : 'border-neutral-100 opacity-70',
      )}
    >
      {/* Image */}
      <div className="aspect-[16/9] bg-neutral-100 relative overflow-hidden">
        <ImagePreview
          url={category.image_url}
          alt={category.name}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {/* Status toggle — positioned top-right over image */}
        <div className="absolute top-2.5 right-2.5">
          <Toggle checked={category.is_active} onChange={() => onToggle(category)} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-neutral-900 leading-snug truncate">{category.name}</h3>
          <StatusBadge status={category.is_active ? 'active' : 'inactive'} />
        </div>
        <p className="text-xs text-neutral-400 font-mono mb-3 truncate">/{category.slug}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {category.product_count}{' '}
            {category.product_count === 1 ? 'product' : 'products'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(category)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-emerald-600 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoriesRepository.listCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Modal helpers ───────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(category: CategoryWithCount) {
    setEditing(category);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setFormError(null);
  }

  // ── Form submit ─────────────────────────────────────────────────────────

  async function handleSubmit(values: CategoryFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        image_url: values.image_url.trim() || null,
        is_active: values.is_active,
      };

      if (editing) {
        await CategoriesRepository.updateCategory(editing.id, payload);
      } else {
        await CategoriesRepository.createCategory(payload);
      }

      closeModal();
      await fetchCategories();
    } catch (err: any) {
      setFormError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Toggle ──────────────────────────────────────────────────────────────

  async function handleToggle(category: CategoryWithCount) {
    // Optimistic local update
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, is_active: !c.is_active } : c,
      ),
    );
    try {
      await CategoriesRepository.toggleCategoryStatus(category.id, !category.is_active);
    } catch (err) {
      console.error('Toggle failed:', err);
      // Revert on error
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, is_active: category.is_active } : c,
        ),
      );
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleting) return;
    try {
      await CategoriesRepository.deleteCategory(deleting.id);
      setDeleting(null);
      toast('success', 'Category deleted');
      await fetchCategories();
    } catch (err: any) {
      setDeleting(null);
      const msg = err?.message ?? 'Failed to delete category';
      toast('error', msg);
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.includes(search.toLowerCase()),
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
          <p className="text-neutral-500 text-sm">
            {loading ? '' : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-emerald-100"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Grid3X3}
          title={search ? 'No categories match your search' : 'No categories yet'}
          description={
            search
              ? 'Try a different keyword.'
              : 'Create your first category to start organising your catalog.'
          }
          action={!search ? { label: 'Add Category', onClick: openCreate } : undefined}
        />
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <CategoryForm
          key={editing?.id ?? 'new'}
          initial={
            editing
              ? {
                  name: editing.name,
                  slug: editing.slug,
                  image_url: editing.image_url ?? '',
                  is_active: editing.is_active,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
          error={formError}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        description="This will permanently remove the category if no products are attached. This action cannot be undone."
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  );
}
