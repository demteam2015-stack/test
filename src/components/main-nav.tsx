'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  Calendar,
  CreditCard,
  Home,
  Trophy,
  BrainCircuit,
  BookUser,
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

const navLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home },
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar },
  { href: '/dashboard/journal', label: 'Журнал', icon: BookUser },
  { href: '/dashboard/recommendations', label: 'AI Тренер', icon: BrainCircuit },
  { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard },
  { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy },
  { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Центр команды</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label, side:'right', align: 'center'}}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <p className="px-3 text-xs text-muted-foreground">
          © Команда Демьяненко
        </p>
      </SidebarFooter>
    </>
  );
}
