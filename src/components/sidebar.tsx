'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Award,
  Calendar,
  Home,
  Trophy,
  Users,
  GraduationCap,
  Settings,
  User,
  Shield,
  CheckBadge,
} from 'lucide-react';
import { Logo } from './icons';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/profile', label: 'Профиль', icon: User, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/competitions', label: 'Соревнования', icon: Trophy, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/education', label: 'Обучение', icon: GraduationCap, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/hall-of-fame', label: 'Зал славы', icon: Award, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/reports', label: 'Отчеты', icon: Shield, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/attestation', label: 'Аттестация', icon: CheckBadge, roles: ['admin', 'coach']},
];


export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden border-r bg-background md:flex md:flex-col">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Logo className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Команда Демьяненко</span>
        </Link>
        <TooltipProvider>
            {navLinks.map((link) => {
                // Special routing for reports page based on role
                let finalHref = link.href;
                if (link.href === '/dashboard/reports' && user.role === 'parent') {
                    finalHref = '/dashboard/my-reports';
                }

                if (!link.roles.includes(user.role)) {
                    return null;
                }

                // A bit of a hack to group related routes under one icon
                const isActive = (pathname.startsWith(link.href) && link.href !== '/dashboard') || pathname === finalHref;

                return (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={finalHref}
                            className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                            isActive && 'bg-accent text-accent-foreground'
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{link.label}</TooltipContent>
                    </Tooltip>
                );
            })}
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Настройки</span>
                </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Настройки</TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
