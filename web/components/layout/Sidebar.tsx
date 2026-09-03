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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
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
      section: 'Account',
      items: [
        { href: '/account', icon: User, label: 'Profile & Security' },
      ],
    },
  ];

  const adminSection: NavSection = {
    section: 'Admin',
    items: [
      { href: '/admin', icon: Activity, label: 'Overview' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/jobs', icon: Database, label: 'Job Monitor' },
    ],
  };

  const sections = user?.role === 'admin' ? [...navSections, adminSection] : navSections;

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-rzp-primary flex flex-col z-50 select-none border-r border-white/6 shadow-lg">
      {/* Brand Header */}
      <div className="h-[60px] flex items-center px-4 border-b border-white/6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon size={30} />
          <span className="font-heading font-bold text-sm text-white tracking-tight">
            CuraVeris
          </span>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div className="p-3 border-b border-white/6">
        <Link
          href="/bills/upload"
          className="w-full h-[36px] px-3 bg-rzp-blue hover:bg-rzp-blue-dark text-white rounded font-body font-medium text-xs flex items-center justify-center gap-2 transition-colors duration-120 shadow-xs active:scale-[0.99]"
        >
          <PlusCircle size={15} strokeWidth={2} />
          <span>Check a Bill</span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
        {sections.map((group) => (
          <div key={group.section}>
            <p className="px-3 pt-2 pb-1 font-body font-semibold text-2xs text-white/35 uppercase tracking-wider">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between h-[36px] px-3 rounded text-sm font-medium transition-all duration-120 group',
                      active
                        ? 'bg-rzp-blue/20 text-white font-semibold border-l-2 border-rzp-blue'
                        : 'text-white/60 hover:bg-white/6 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        strokeWidth={active ? 2 : 1.75}
                        className={active ? 'text-white' : 'text-white/50 group-hover:text-white'}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
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
      <div className="flex-shrink-0 border-t border-white/6 p-2.5 bg-black/10">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-white/6 transition-colors">
          <Link href="/account" className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {user?.full_name || 'Patient'}
              </p>
              <p className="text-2xs text-white/40 truncate">
                {user?.email || 'patient@curaveris.ai'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };


