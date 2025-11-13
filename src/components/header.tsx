'use client';

import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import MainNav from './main-nav';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
        <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
        </div>
    </header>
  );
}
