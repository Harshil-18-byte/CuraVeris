'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  Bell,
  User,
  ShieldAlert,
  Scale,
  Bot,
  PlusCircle,
  LogOut,
  Activity,
  Users,
  Database,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { api } from '@/lib/api';
import { LogoIcon } from '@/components/ui/Logo';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isMobileNavOpen, closeMobileNav } = useUIStore();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/') return pathname === '/';
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  const navSections: NavSection[] = [
    {
      section: 'Main',
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/bills', icon: FileText, label: 'My Bills' },
        { href: '/frm', icon: ShieldAlert, label: 'Financial Risk' },
        { href: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
      ],
    },
    {
      section: 'Tools & Reference',
      items: [
        { href: '/#price-checker', icon: Scale, label: 'Price Caps (NPPA)' },
        { href: '/dashboard', icon: Bot, label: 'Advisory Copilot' },
      ],
    },
    {
      section: 'Account & Security',
      items: [
        { href: '/account', icon: User, label: 'Profile & DPDP Rights' },
      ],
    },
  ];

  const adminSection: NavSection = {
    section: 'Admin Portal',
    items: [
      { href: '/admin', icon: Activity, label: 'Overview' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/jobs', icon: Database, label: 'Job Monitor' },
    ],
  };

  const sections = user?.role === 'admin' ? [...navSections, adminSection] : navSections;

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-white text-[#202128] select-none border-r border-black/[0.05] backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="h-[68px] flex items-center justify-between px-6 border-b border-black/[0.05] flex-shrink-0">
        <Link
          href="/"
          onClick={() => isMobile && closeMobileNav()}
          className="flex items-center gap-3"
        >
          <LogoIcon size={32} />
          <span className="font-heading font-extrabold text-base text-[#202128] tracking-tight">
            CuraVeris
          </span>
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={closeMobileNav}
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-black/[0.04] transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Primary Action Pill Button */}
      <div className="p-4 border-b border-black/[0.05]">
        <Link
          href="/bills/upload"
          onClick={() => isMobile && closeMobileNav()}
          className="w-full h-11 px-4 bg-[#202128] hover:bg-[#121317] text-white rounded-full font-body font-bold text-xs flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_4px_14px_rgba(32,33,40,0.15)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle size={16} strokeWidth={2.2} />
          <span>Check a Hospital Bill</span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {sections.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-1.5 font-body font-bold text-[10px] text-[#202128]/40 uppercase tracking-wider">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => isMobile && closeMobileNav()}
                    className={cn(
                      'flex items-center justify-between h-10 px-3.5 rounded-full text-xs font-semibold transition-all duration-150 group',
                      active
                        ? 'bg-[#DBF1F4] text-[#202128] font-bold shadow-xs'
                        : 'text-[#202128]/70 hover:bg-[#EDF0FB] hover:text-[#202128]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.2 : 1.75}
                        className={active ? 'text-[#43A8B2]' : 'text-[#202128]/50 group-hover:text-[#202128]'}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Row Footer */}
      <div className="flex-shrink-0 border-t border-black/[0.05] p-3 bg-[#F5F7FB]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-black/[0.04] shadow-xs">
          <Link
            href="/account"
            onClick={() => isMobile && closeMobileNav()}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="w-8 h-8 rounded-full bg-[#202128] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#202128] truncate">
                {user?.full_name || 'Patient'}
              </p>
              <p className="text-[10px] text-[#202128]/50 truncate">
                {user?.email || 'patient@curaveris.ai'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 text-neutral-400 hover:text-red-500 rounded-full hover:bg-black/[0.04] transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] flex-col z-40 shadow-sm">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
