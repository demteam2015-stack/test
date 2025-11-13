'use client';

import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import MainNav from './main-nav';
import Link from 'next/link';
import { Logo } from './icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
             <Link href="/dashboard" className="mr-8 flex items-center gap-2">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline hidden sm:inline-block">
                    Команда Демьяненко
                </span>
            </Link>
            <MainNav />
            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <UserNav />
            </div>
        </div>
    </header>
  );
}
