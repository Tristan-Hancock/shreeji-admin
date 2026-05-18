import { 
  Building2, 
  Bell, 
  ShieldCheck, 
  MessageCircle,
  Smartphone,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { profile } = useAuth();

  const sections = [
    {
      title: "Store Configuration",
      items: [
        { icon: Building2, label: "Store Details", desc: "Name, address, and VAT info", path: "#" },
        { icon: MessageCircle, label: "WhatsApp Setup", desc: "Configure automated notification numbers", path: "#" },
        { icon: Smartphone, label: "App Appearance", desc: "Logos, colors and theme settings", path: "#" },
      ]
    },
    {
      title: "Communications",
      items: [
        { icon: Bell, label: "Push Notifications", desc: "Manage operational alerts for staff", path: "#" },
        { icon: ShieldCheck, label: "Security & Roles", desc: "Manage admin and delivery boy permissions", path: "#" },
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-500">Configure your grocery platform preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.full_name}</h2>
            <p className="text-sm text-neutral-500">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {profile?.role} Account
            </span>
          </div>
        </div>
        <button className="px-4 py-2 border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all">
          Edit Profile
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 italic">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{section.title}</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {section.items.map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-all text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-neutral-50 rounded-xl text-neutral-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900">{item.label}</h4>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
