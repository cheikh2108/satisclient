'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  AlertCircle,
  QrCode,
  FileText,
  Bell,
  Building2,
  Users,
  MapPin,
  Shield,
  Settings,
  Menu,
  X,
  BarChart3,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSelector } from './workspace-selector';

const mainMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare },
  { name: 'Réclamations', href: '/dashboard/reclamations', icon: AlertCircle },
  { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
  { name: 'Rapports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

const organizations = [
  { name: 'Organisations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'Sites', href: '/dashboard/sites', icon: MapPin },
  { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
];

const management = [
  { name: 'Rôles & Permissions', href: '/dashboard/roles', icon: Shield },
  { name: 'Audit', href: '/dashboard/audit', icon: FileCheck },
  { name: 'Fichiers', href: '/dashboard/files', icon: FileText },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({ item, isActive }: { item: typeof mainMenu[0]; isActive: boolean }) => (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-normal transition-all',
        isActive
          ? 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-[#1a1a1a]/50'
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.name}</span>
    </Link>
  );

  const SidebarContent = () => (
    <>
      {/* Workspace Selector */}
      <div className="p-4">
        <WorkspaceSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 px-3 pb-4 overflow-y-auto scrollbar-thin">
        {/* Main Menu */}
        <p className="px-4 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Main Menu
        </p>
        <div className="space-y-1">
          {mainMenu.map((item) => (
            <NavLink key={item.name} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800/40 mx-4" />

        <p className="px-4 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Organisation
        </p>
        <div className="space-y-1">
          {organizations.map((item) => (
            <NavLink key={item.name} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800/40 mx-4" />

        <p className="px-4 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Management
        </p>
        <div className="space-y-1">
          {management.map((item) => (
            <NavLink key={item.name} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800/40 mx-4" />

        <p className="px-4 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Paramètres
        </p>
        <div className="space-y-1">
          <NavLink
            item={{ name: 'Paramètres', href: '/dashboard/settings', icon: Settings }}
            isActive={pathname === '/dashboard/settings'}
          />
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Toujours ouvert */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-full w-[280px] flex-col bg-slate-50/50 dark:bg-[#0f0f0f] border-r border-slate-200/50 dark:border-slate-800/60">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-[280px] flex flex-col bg-slate-50 dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-slate-800/60 transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/40">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#222222] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile/Tablet Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-[18px] left-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:bg-slate-50 dark:hover:bg-[#222222] hover:border-slate-300 dark:hover:border-slate-600/80 active:scale-[0.97] transition-all lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px] text-slate-700 dark:text-slate-200" />
      </button>
    </>
  );
}
