'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, Users } from 'lucide-react';
import type { UserProfile } from '@/lib/data';

const ITEMS_PER_PAGE = 10;

// Helper to get all users from localStorage. This should be used with caution.
const getAllStoredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];
  const users: UserProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_id_')) {
      try {
        const storedUser = JSON.parse(localStorage.getItem(key) || '');
        // We can't decrypt the profile here, so we get what we can
        users.push({
            id: storedUser.id,
            email: storedUser.email,
            username: storedUser.username,
            // These fields are inside the encrypted part, so we can't show them.
            // We set default values.
            firstName: 'N/A',
            lastName: 'N/A',
            role: 'athlete'
        });
      } catch (e) {
        console.error(`Failed to parse user data for key ${key}:`, e);
      }
    }
  }
  return users;
};


export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
    if(user?.role === 'admin') {
        // This is a client-side only operation
        setAllUsers(getAllStoredUsers());
    }
  }, [user, loading, router]);
  
  const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);
  
  const paginatedUsers = useMemo(() => {
      return allUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }, [allUsers, page]);


  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user.role !== 'admin') {
      return null;
  }

  const roleTranslations: { [key: string]: string } = {
    athlete: 'Спортсмен',
    coach: 'Тренер',
    parent: 'Родитель',
    admin: 'Администратор',
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Users className="size-8 text-primary"/>
            Управление пользователями
        </h1>
        <p className="text-muted-foreground">
          Просмотр и управление аккаунтами пользователей.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Всего зарегистрировано {allUsers.length} аккаунтов.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя пользователя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>ID пользователя</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Пользователи не найдены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
                Страница {page} из {totalPages}
            </span>
            <div className="flex gap-2">
                <Button 
                    variant="outline"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                >
                    Назад
                </Button>
                <Button 
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                >
                    Вперед
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
