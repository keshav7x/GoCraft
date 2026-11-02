"use client";

import {
  BarChart3,
  BookOpen,
  FolderKanban,
  Images,
  LayoutDashboard,
  LibraryBig,
  type LucideIcon,
  Settings,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  exact?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Curriculum health at a glance",
    exact: true,
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: LibraryBig,
    description: "Modules, lessons and drafts",
  },
  {
    label: "Modules",
    href: "/admin/modules",
    icon: FolderKanban,
    description: "Manage learning modules",
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    icon: BookOpen,
    description: "All lessons across modules",
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: Images,
    description: "Images and visual assets",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Learner engagement metrics",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Learner accounts and progress",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Admin workspace preferences",
  },
];

export function findAdminNavItem(pathname: string): AdminNavItem {
  const matches = ADMIN_NAV_ITEMS.filter((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return (
    matches.sort((a, b) => b.href.length - a.href.length)[0] ?? ADMIN_NAV_ITEMS[0]!
  );
}
