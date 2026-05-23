import { useState } from 'react';
import { Mail, User, Phone, Lock, Loader } from 'lucide-react';
import { DeliveryService } from '../../services/delivery.service';
import { useToast } from '../ui/Toast';

interface CreateDeliveryUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateDeliveryUserForm({ onSuccess, onCancel }: CreateDeliveryUserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast('error', 'Please fix the errors below');
      return;
    }

    try {
      setLoading(true);
      await DeliveryService.createDeliveryUser({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      toast('success', `Delivery user "${fullName}" created successfully`);
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});

      onSuccess?.();
    } catch (err) {
      console.error('[CreateDeliveryUserForm] Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create delivery user';
      toast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) {
                setErrors({ ...errors, fullName: '' });
              }
            }}
            placeholder="e.g., Raj Kumar"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) {
                setErrors({ ...errors, phone: '' });
              }
            }}
            placeholder="e.g., 9876543210"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            placeholder="e.g., raj@example.com"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors({ ...errors, password: '' });
              }
            }}
            placeholder="At least 8 characters"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: '' });
              }
            }}
            placeholder="Confirm your password"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-neutral-700 bg-white border border-neutral-200 rounded-lg font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-emerald-600 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-neutral-400 transition-colors"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Delivery User'}
        </button>
      </div>
    </form>
  );
}
