
'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { SettingsModal } from './settings-modal';
import { PanelLeft, LayoutDashboard, BellRing, KeyRound, Users, Trash2, Server, Gift, Library, Route, Sparkles, ShieldCheck, ShieldAlert, Lock, Send, Fingerprint, DollarSign, Code } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

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


export function Header() {
  const { user, loading, permissions } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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


  const handleLogout = () => {
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Open Drawer</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs p-2 flex flex-col">
             <SheetHeader className="p-2 border-b">
               <SheetTitle className="sr-only">Kuro Menu</SheetTitle>
               <SheetDescription className="sr-only">
                Navigate the dashboard using the links below.
              </SheetDescription>
              <div className="flex items-center gap-2">
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
            </SheetHeader>
            <ScrollArea className="flex-1 mt-4">
              <nav className="grid gap-2 text-lg font-medium pr-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex items-center gap-4">
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : user ? (
              <Badge variant="outline" className="text-base font-semibold">
                {user.saldo > 2000000000 ? '∞' : formatCompactNumber(user.saldo) ?? '0'}
                <span className="ml-2 text-muted-foreground">Saldo</span>
              </Badge>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://picsum.photos/100" alt="@user" data-ai-hint="profile picture"/>
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.fullname || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {user && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen} 
          user={user}
        />
      )}
    </>
  );
}
