
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BellRing,
  Settings,
  KeyRound,
  Users,
  Trash2,
  Server,
  Gift,
  Library,
  Route,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Send,
  Fingerprint,
  DollarSign,
  Code,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

const allMenuItems = [
  {
    id: 'dashboard',
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    level: [1, 2, 3, 4], // All users
  },
  {
    id: 'alerts',
    href: "/alerts",
    icon: BellRing,
    label: "Alerts",
    level: [1], // Main Admin only
  },
  {
    id: 'keys',
    href: "/keys",
    icon: KeyRound,
    label: "Keys",
    level: [1, 2, 3, 4],
  },
   {
    id: 'key-status',
    href: "/key-status",
    icon: ShieldAlert,
    label: "Key Status",
    level: [1, 2, 3, 4], // All but free users
  },
  {
    id: 'management',
    href: "/management",
    icon: Users,
    label: "Management",
    level: [1, 2], // Main and Reseller Admins
  },
   {
    id: "key-pricing",
    href: "/key-pricing",
    icon: DollarSign,
    label: "Key Pricing",
    level: [1], // Main Admin only
  },
  {
    id: 'bulk-actions',
    href: "/bulk-actions",
    icon: Trash2,
    label: "Bulk Actions",
    level: [1, 2], // Main and Reseller Admins
  },
  {
    id: 'server-settings',
    href: "/server-settings",
    icon: Server,
    label: "Server Settings",
    level: [1], // Main Admin only
  },
   {
    id: 'permissions',
    icon: Fingerprint,
    label: "Permissions",
    href: "/permissions",
    level: [1], // Main Admin only
  },
  {
    id: 'referrals',
    href: "/referrals",
    icon: Gift,
    label: "Referrals",
    level: [1, 2], // Main and Reseller Admins
  },
  {
    id: 'telegram-bot',
    href: "/telegram-bot",
    icon: Send,
    label: "Telegram Bot",
    level: [1, 2, 3],
  },
  {
    id: 'online-lib',
    href: "/online-lib",
    icon: Library,
    label: "Online Lib",
    level: [1], // Main Admin only
  },
  {
    id: 'online-bypass',
    href: "/online-bypass",
    icon: Route,
    label: "Online Bypass",
    level: [1], // Main Admin only
  },
  {
    id: 'api',
    href: "/api",
    icon: Sparkles,
    label: "API",
    level: [1], // Main Admin only
  },
  {
    id: 'encrypted-api',
    href: "/encrypted-api",
    icon: Lock,
    label: "Encrypted API",
    level: [1], // Main Admin only
  },
  {
    id: 'free-api',
    href: "/free-api",
    icon: Code,
    label: "Free API",
    level: [4], // Free users only
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, permissions } = useAuth();
  
  const menuItems = allMenuItems.filter(item => {
    if (!user) return false;
    
    // Check if the user's level is in the item's allowed levels
    if (!item.level.includes(user.level)) return false;

    // For Reseller Admins, also check against their specific permissions from the database
    if (user.level === 2) {
      // These are core pages for Resellers, always show them
      if (['dashboard', 'keys', 'key-status', 'telegram-bot'].includes(item.id)) return true;
      // For other pages, respect the permissions toggle
      return permissions[item.id];
    }
    
    // For all other user levels, just the level check is enough
    return true;
  });


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24"
            className="h-8 w-8 text-primary"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <h1 className="text-xl font-bold">Kuro</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <ScrollArea className="h-full pr-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
