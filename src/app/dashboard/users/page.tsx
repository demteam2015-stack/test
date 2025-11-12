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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Users, KeyRound, MailWarning } from 'lucide-react';
import type { UserProfile } from '@/lib/data';
import { getPendingResetRequests, deleteResetRequest, type ResetRequest } from '@/lib/reset-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const getAllStoredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];
  const users: UserProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_id_')) {
      try {
        const storedUser = JSON.parse(localStorage.getItem(key) || '');
        users.push({
            id: storedUser.id,
            email: storedUser.email,
            username: storedUser.username,
            firstName: 'N/A',
            lastName: 'N/A',
            role: 'athlete'
        });
      } catch (e) {
        console.error(`Failed to parse user data for key ${key}:`, e);
      }
    }
  }
  return users.sort((a,b) => a.username.localeCompare(b.username));
};

export default function UsersPage() {
  const { user, loading, adminResetPassword } = useAuth();
  const router = useRouter();
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  
  const [usersPage, setUsersPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{emailText: string} | null>(null);

  const fetchAllData = () => {
    setAllUsers(getAllStoredUsers());
    setResetRequests(getPendingResetRequests().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
    if(user?.role === 'admin') {
      fetchAllData();
    }
  }, [user, loading, router]);
  
  const totalUsersPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);
  const totalRequestsPages = Math.ceil(resetRequests.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
      return allUsers.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE)
  }, [allUsers, usersPage]);

  const paginatedRequests = useMemo(() => {
      return resetRequests.slice((requestsPage - 1) * ITEMS_PER_PAGE, requestsPage * ITEMS_PER_PAGE)
  }, [resetRequests, requestsPage]);

  const handleResetClick = (request: ResetRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    setResetResult(null);
    setNewPassword('');
  }

  const handleConfirmReset = async () => {
    if (!selectedRequest || !newPassword) return;

    setIsResetting(true);
    const emailText = await adminResetPassword(selectedRequest.email, newPassword);
    
    await deleteResetRequest(selectedRequest.id);
    
    setResetResult({ emailText });
    setIsResetting(false);
    fetchAllData();
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setResetResult(null);
    setNewPassword('');
  }


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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Users className="size-8 text-primary"/>
            Управление пользователями
        </h1>
        <p className="text-muted-foreground">
          Просмотр аккаунтов и обработка запросов на сброс пароля.
        </p>
      </div>

      <Tabs defaultValue="users-list">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users-list">
            <Users className="mr-2 size-4" />
            Список пользователей
          </TabsTrigger>
          <TabsTrigger value="reset-requests">
            <MailWarning className="mr-2 size-4" />
            Запросы на сброс
            {resetRequests.length > 0 && <Badge className="ml-2">{resetRequests.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users-list">
          <Card>
            <CardHeader>
              <CardTitle>Все пользователи</CardTitle>
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
                    Страница {usersPage} из {totalUsersPages}
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="outline"
                        onClick={() => setUsersPage(p => p - 1)}
                        disabled={usersPage === 1}
                    >
                        Назад
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => setUsersPage(p => p + 1)}
                        disabled={usersPage >= totalUsersPages}
                    >
                        Вперед
                    </Button>
                </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reset-requests">
          <Card>
            <CardHeader>
              <CardTitle>Запросы на сброс пароля</CardTitle>
              <CardDescription>
                Пользователи, запросившие сброс пароля. Всего запросов: {resetRequests.length}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата запроса</TableHead>
                    <TableHead>Имя пользователя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(new Date(r.date), 'd MMMM yyyy, HH:mm', { locale: ru })}</TableCell>
                        <TableCell className="font-medium">{r.username}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleResetClick(r)}>
                            <KeyRound className="mr-2 size-4" />
                            Сбросить пароль
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Нет активных запросов на сброс.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {resetRequests.length > 0 && (
              <CardFooter className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                      Страница {requestsPage} из {totalRequestsPages}
                  </span>
                  <div className="flex gap-2">
                      <Button 
                          variant="outline"
                          onClick={() => setRequestsPage(p => p - 1)}
                          disabled={requestsPage === 1}
                      >
                          Назад
                      </Button>
                      <Button 
                          variant="outline"
                          onClick={() => setRequestsPage(p => p + 1)}
                          disabled={requestsPage >= totalRequestsPages}
                      >
                          Вперед
                      </Button>
                  </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
            {!resetResult ? (
              <>
                <DialogHeader>
                    <DialogTitle>Сброс пароля для {selectedRequest?.username}</DialogTitle>
                    <DialogDescription>
                        Придумайте новый временный пароль. Старый аккаунт и все данные пользователя будут безвозвратно удалены. Будет создан новый аккаунт с этим же email/логином.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">Новый временный пароль</Label>
                        <Input
                            id="new-password"
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isResetting}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseModal} disabled={isResetting}>Отмена</Button>
                    <Button onClick={handleConfirmReset} disabled={!newPassword || isResetting}>
                        {isResetting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Сбросить и сгенерировать письмо
                    </Button>
                </DialogFooter>
              </>
            ) : (
                <>
                <DialogHeader>
                    <DialogTitle>Пароль сброшен. Отправьте письмо.</DialogTitle>
                    <DialogDescription>
                        Скопируйте текст ниже и вручную отправьте его пользователю на email: {selectedRequest?.email}.
                    </DialogDescription>
                </DialogHeader>
                 <div className="my-4 text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {resetResult.emailText}
                 </div>
                 <DialogFooter>
                     <Button onClick={handleCloseModal}>Закрыть</Button>
                 </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}