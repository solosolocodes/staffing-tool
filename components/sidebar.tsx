'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Assignments', href: '/assignments', icon: UserPlus },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="flex h-16 items-center px-6 bg-gradient-to-r from-[#3C89A9] to-[#4a90b8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
            <TrendingUp className="h-5 w-5 text-[#3C89A9]" />
          </div>
          <div className="text-white">
            <span className="text-xl font-bold tracking-tight">Accesa</span>
            <div className="text-xs opacity-90 font-medium">StaffingPro</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#3C89A9] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#3C89A9]'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-gray-500 group-hover:text-[#3C89A9]"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center shadow-sm">
            <span className="text-sm font-semibold text-white">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}