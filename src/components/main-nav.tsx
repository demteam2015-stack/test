'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  BrainCircuit,
  Calendar,
  CreditCard,
  Home,
  Trophy,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/recommendations', label: 'AI Coach', icon: BrainCircuit },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/competitions', label: 'Competitions', icon: Trophy },
  { href: '/dashboard/hall-of-fame', label: 'Hall of Fame', icon: Award },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Team Hub</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  asChild
                  tooltip={{ children: link.label, side:'right', align: 'center'}}
                >
                  <a>
                    <link.icon />
                    <span>{link.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <p className="px-3 text-xs text-muted-foreground">
          © Demyanenko Team
        </p>
      </SidebarFooter>
    </>
  );
}
