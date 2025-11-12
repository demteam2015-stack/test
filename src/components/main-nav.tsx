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
  Users,
  ShieldCheck,
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
import { useAuth } from '@/context/auth-context';

const baseLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home },
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar },
  { href: '/dashboard/recommendations', label: 'AI Тренер', icon: BrainCircuit },
  { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard },
  { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy },
  { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award },
];

const adminLinks = [
  { href: '/dashboard/users', label: 'Пользователи', icon: Users },
  { href: '/dashboard/admin-panel', label: 'Админ-панель', icon: ShieldCheck },
];

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const allLinks = user?.role === 'admin' ? [...baseLinks, ...adminLinks] : baseLinks;

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
          {allLinks.map((link) => (
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
