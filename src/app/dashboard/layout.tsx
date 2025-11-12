import Header from '@/components/header';
import MainNav from '@/components/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
