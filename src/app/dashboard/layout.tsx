'use client';

import Header from '@/components/header';
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
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
        </main>
    </div>
  );
}
