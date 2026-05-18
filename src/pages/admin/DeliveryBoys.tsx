import { useEffect, useState } from 'react';
import {
  Plus,
  Phone,
  Star,
  MoreVertical,
  Activity
} from 'lucide-react';
import { DeliveryRepository } from '../../repositories';
import { cn } from '../../lib/utils';

export default function DeliveryBoys() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await DeliveryRepository.getDeliveryBoys();
        setStaff(data);
      } catch (error) {
        console.error('Error fetching delivery staff:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Delivery Staff</h1>
          <p className="text-neutral-500">Manage your delivery fleet</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100">
          <Plus className="w-5 h-5" /> Onboard Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-400">Loading fleet...</div>
        ) : staff.length > 0 ? (
          staff.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-lg text-neutral-600 border-2 border-white shadow-sm">
                    {person.full_name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">{person.full_name || 'Staff User'}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" /> Currently Active
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-neutral-50 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium">+91 {person.phone || '9988776655'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Delivered</span>
                    <span className="text-lg font-black text-neutral-900">42</span>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Rating</span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-black text-neutral-900">4.8</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors">
                  Assign Order
                </button>
                <button className="px-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) )
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-400">No delivery staff added yet</div>
        )}
      </div>
    </div>
  );
}
