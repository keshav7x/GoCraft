import {
  BookOpen,
  Code2,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your daily learning HQ",
  },
  {
    label: "Learn",
    href: "/modules",
    icon: BookOpen,
    description: "Interactive Go curriculum",
  },
  {
    label: "Problems",
    href: "/dashboard/problems",
    icon: Code2,
    description: "Practice challenges",
  },
  {
    label: "Friends",
    href: "/dashboard/friends",
    icon: Users,
    description: "Learn together",
  },
  {
    label: "Marketplace",
    href: "/dashboard/marketplace",
    icon: ShoppingBag,
    description: "Spend XP on rewards",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Preferences and account",
  },
];

export function findNavItem(pathname: string): NavItem {
  const matches = NAV_ITEMS.filter((item) =>
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  // Prefer the most specific match (longest href).
  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? (NAV_ITEMS[0] as NavItem);
}
