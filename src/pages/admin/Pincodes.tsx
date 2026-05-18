import { useEffect, useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Edit2, 
  Check, 
  X,
  IndianRupee,
  ShoppingBag
} from 'lucide-react';
import { PincodeRepository } from '../../repositories';
import { cn, formatCurrency } from '../../lib/utils';

export default function Pincodes() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    pincode: '',
    delivery_fee: 0,
    min_order_value: 0,
    is_active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await PincodeRepository.getAll();
      setPincodes(data);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (pincode: string) => {
    try {
      await PincodeRepository.update(pincode, {
        delivery_fee: editForm.delivery_fee,
        min_order_value: editForm.min_order_value,
        is_active: editForm.is_active
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating pincode:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Serviceable Pincodes</h1>
          <p className="text-neutral-500">Manage delivery areas and fees</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100">
          <Plus className="w-5 h-5" /> Add Pincode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-400">Loading areas...</div>
        ) : pincodes.length > 0 ? (
          pincodes.map((item) => (
            <div key={item.pincode} className={cn(
              "bg-white rounded-2xl border p-5 transition-all",
              item.is_active ? "border-neutral-200" : "border-neutral-100 opacity-75"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xl font-black text-neutral-900">{item.pincode}</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingId(item.pincode);
                    setEditForm(item);
                  }}
                  className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {editingId === item.pincode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Del. Fee</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                      value={editForm.delivery_fee}
                      onChange={(e) => setEditForm({...editForm, delivery_fee: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Min Order</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                      value={editForm.min_order_value}
                      onChange={(e) => setEditForm({...editForm, min_order_value: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdate(item.pincode)}
                      className="flex-1 bg-emerald-600 text-white p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="bg-neutral-100 text-neutral-600 p-2 rounded-lg text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Delivery Fee</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(item.delivery_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Min Order</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(item.min_order_value)}</span>
                  </div>
                  <div className={cn(
                    "w-full py-1.5 rounded-lg text-[10px] font-black uppercase text-center tracking-widest",
                    item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  )}>
                    {item.is_active ? 'Active Area' : 'Inactive'}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-400">No service areas added</div>
        )}
      </div>
    </div>
  );
}
