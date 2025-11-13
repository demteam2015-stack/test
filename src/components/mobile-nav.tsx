'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award,
  Calendar,
  Home,
  Trophy,
  Users,
  GraduationCap,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Панель', icon: Home, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/team', label: 'Команда', icon: Users, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/schedule', label: 'Расписание', icon: Calendar, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/competitions', label: 'Сорев-я', icon: Trophy, roles: ['admin', 'coach', 'parent', 'athlete']},
  { href: '/dashboard/payments', label: 'Платежи', icon: CreditCard, roles: ['parent', 'athlete']},
  { href: '/dashboard/my-messages', label: 'AI-Коуч', icon: MessageSquare, roles: ['parent', 'athlete']},
  { href: '/dashboard/attestation', label: 'Аттестация', icon: ShieldCheck, roles: ['admin', 'coach']},
  { href: '/dashboard/profile', label: 'Профиль', icon: User, roles: ['admin', 'coach', 'parent', 'athlete']},
];


export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;
  
  const userNavLinks = navLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <div className="grid h-16 items-center" style={{gridTemplateColumns: `repeat(${userNavLinks.length}, 1fr)`}}>
            {userNavLinks.map((link) => {
                const isActive = (pathname.startsWith(link.href) && link.href !== '/dashboard') || pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground h-full',
                        isActive && 'text-primary'
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        <span className="text-xs text-center">{link.label}</span>
                    </Link>
                );
            })}
        </div>
    </div>
  );
}
