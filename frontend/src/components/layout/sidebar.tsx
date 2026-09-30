"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "./workspace-selector";
import { useCurrentUser, useLogout } from "@/hooks";
import { useRouter } from "next/navigation";

// ─── Menus par rôle ───────────────────────────────────────────────────────────

const platformMenu = [
  { name: "Plateforme", href: "/dashboard", icon: Activity },
  { name: "Organisations", href: "/dashboard/organizations", icon: Building2 },
  { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
  { name: "Audit", href: "/dashboard/audit", icon: FileCheck },
];

const clientMainMenu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feedbacks", href: "/dashboard/feedbacks", icon: MessageSquare },
  { name: "Réclamations", href: "/dashboard/reclamations", icon: AlertCircle },
  { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
  { name: "Rapports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const clientOrgMenu = [
  { name: "Établissements", href: "/dashboard/sites", icon: MapPin },
  { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
];

const clientManagementMenu = [
  { name: "Rôles & Permissions", href: "/dashboard/roles", icon: Shield },
  { name: "Audit", href: "/dashboard/audit", icon: FileCheck },
  { name: "Fichiers", href: "/dashboard/files", icon: FileText },
];

// Menus limités pour les agents
const agentMainMenu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feedbacks", href: "/dashboard/feedbacks", icon: MessageSquare },
  { name: "Réclamations", href: "/dashboard/reclamations", icon: AlertCircle },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const logout = useLogout();
  const role = (currentUser as any)?.role as string | undefined;

  const isSuperAdmin = role === "super_admin";
  const isAgent = role === "agent" || role === "client";
  const isAdmin =
    role === "org_admin" ||
    role === "quality_manager" ||
    role === "service_manager";

  const handleLogout = async () => {
    await logout.mutateAsync();
    setMobileOpen(false);
    router.replace("/login");
  };

  const NavLink = ({
    item,
  }: {
    item: { name: string; href: string; icon: any };
  }) => (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-normal transition-all",
        pathname === item.href
          ? "bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700/60"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-[#1a1a1a]/50",
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.name}</span>
    </Link>
  );

  const Section = ({
    label,
    items,
  }: {
    label: string;
    items: typeof clientMainMenu;
  }) => (
    <>
      <p className="px-4 mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </div>
      <div className="h-px bg-slate-200 dark:bg-slate-800/40 mx-4" />
    </>
  );

  const SidebarContent = () => (
    <>
      <div className="p-4">
        <WorkspaceSelector />
      </div>

      <nav className="flex-1 space-y-4 px-3 pb-4 overflow-y-auto scrollbar-thin">
        {/* ── Super Admin : vue plateforme ── */}
        {isSuperAdmin && (
          <>
            <Section label="Administration" items={platformMenu} />
          </>
        )}

        {/* ── Client : vue complète (org_admin, managers) ── */}
        {(isAdmin || (!isSuperAdmin && !isAgent)) && (
          <>
            <Section label="Main Menu" items={clientMainMenu} />
            <Section label="Organisation" items={clientOrgMenu} />
            <Section label="Management" items={clientManagementMenu} />
          </>
        )}

        {/* ── Agent : vue limitée ── */}
        {isAgent && (
          <>
            <Section label="Menu" items={agentMainMenu} />
          </>
        )}

        {/* Paramètres — tous les rôles */}
        <p className="px-4 mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Paramètres
        </p>
        <div className="space-y-1">
          <NavLink
            item={{
              name: "Paramètres",
              href: "/dashboard/settings",
              icon: Settings,
            }}
          />
        </div>
      </nav>

      <div className="border-t border-slate-200/70 dark:border-slate-800/60 p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-normal text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>{logout.isPending ? "Déconnexion..." : "Se déconnecter"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-full w-[280px] flex-col bg-slate-50/50 dark:bg-[#0f0f0f] border-r border-slate-200/50 dark:border-slate-800/60">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[280px] flex flex-col bg-slate-50 dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-slate-800/60 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/40">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Menu
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#222222] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

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
