'use client';

import Header from '@/components/header';
import MainNav from '@/components/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    // This case handles the final state where loading is false and user is still null.
    // The useEffect above will trigger the redirect, but this is a safeguard.
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 bg-muted/30 dark:bg-transparent min-h-[calc(100vh-3.5rem)]">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
