'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  UtensilsCrossed,
  Users,
  Truck,
  MapPin,
  Bell,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Heart,
  Building2,
  UserCheck,
  Package,
  ClipboardCheck,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} />, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
  { label: 'Donate Food', href: '/dashboard/donate', icon: <UtensilsCrossed size={20} />, roles: ['donor'] },
  { label: 'My Donations', href: '/dashboard/my-donations', icon: <Package size={20} />, roles: ['donor'] },
  { label: 'Available Food', href: '/dashboard/available-food', icon: <Heart size={20} />, roles: ['ngo'] },
  { label: 'My Requests', href: '/dashboard/my-requests', icon: <ClipboardCheck size={20} />, roles: ['ngo'] },
  { label: 'My Pickups', href: '/dashboard/pickups', icon: <Truck size={20} />, roles: ['volunteer'] },
  { label: 'Assignments', href: '/dashboard/assignments', icon: <ClipboardCheck size={20} />, roles: ['volunteer'] },
  { label: 'Availability', href: '/dashboard/availability', icon: <UserCheck size={20} />, roles: ['volunteer'] },
  { label: 'Live Map', href: '/dashboard/map', icon: <MapPin size={20} />, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
  { label: 'Notifications', href: '/dashboard/notifications', icon: <Bell size={20} />, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
  { label: 'Impact', href: '/dashboard/impact', icon: <BarChart3 size={20} />, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
  
  // Admin-specific
  { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={20} />, roles: ['admin'] },
  { label: 'Verifications', href: '/dashboard/admin/verifications', icon: <ClipboardCheck size={20} />, roles: ['admin'] },
  { label: 'Food Management', href: '/dashboard/admin/food', icon: <UtensilsCrossed size={20} />, roles: ['admin'] },
  { label: 'Volunteers', href: '/dashboard/admin/volunteers', icon: <UserCheck size={20} />, roles: ['admin'] },
  { label: 'NGOs', href: '/dashboard/admin/ngos', icon: <Building2 size={20} />, roles: ['admin'] },
  { label: 'Logistics', href: '/dashboard/admin/logistics', icon: <Truck size={20} />, roles: ['admin'] },
  { label: 'Analytics', href: '/dashboard/admin/analytics', icon: <BarChart3 size={20} />, roles: ['admin'] },
  { label: 'Governance', href: '/dashboard/admin/governance', icon: <Shield size={20} />, roles: ['admin'] },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} />, roles: ['donor', 'ngo', 'volunteer', 'admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = user?.role || 'donor';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-emerald-600 text-white shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 text-white flex flex-col shadow-xl">
          {/* Logo */}
          <div className="p-6 border-b border-emerald-700">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Heart className="text-emerald-300" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg">FoodShare</h1>
                <p className="text-xs text-emerald-300">Redistribution Platform</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-emerald-300 capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-emerald-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-emerald-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-emerald-200 hover:bg-white/10 hover:text-white transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
