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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, Users, KeyRound, MailWarning, Banknote } from 'lucide-react';
import type { UserProfile } from '@/context/auth-context';
import { getPendingResetRequests, deleteResetRequest, type ResetRequest } from '@/lib/reset-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
            firstName: 'N/A', // This is encrypted
            lastName: 'N/A', // This is encrypted
            role: 'athlete' // This is encrypted, defaulting to athlete
        });
      } catch (e) {
        console.error(`Failed to parse user data for key ${key}:`, e);
      }
    }
  }
  return users.sort((a,b) => a.username.localeCompare(b.username));
};


const BalanceModal = ({ user, isOpen, onClose, onBalanceUpdated }: { user: UserProfile | null, isOpen: boolean, onClose: () => void, onBalanceUpdated: () => void }) => {
    const { toast } = useToast();
    const { updateUserBalance, adminGetUserProfile } = useAuth();
    const [amount, setAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (user) {
                const fullUser = await adminGetUserProfile(user.id);
                setCurrentUser(fullUser);
            }
        };
        if (isOpen) {
            fetchUser();
        }
    }, [user, isOpen, adminGetUserProfile]);

    const handleSave = async () => {
        if (!currentUser || !amount) return;
        const topUpAmount = parseFloat(amount);
        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            toast({ variant: 'destructive', title: 'Неверная сумма'});
            return;
        }

        setIsSaving(true);
        await updateUserBalance(currentUser.id, topUpAmount, 'add');
        toast({ title: 'Баланс пополнен' });
        setIsSaving(false);
        setAmount('');
        onBalanceUpdated();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Управление балансом: {currentUser?.username}</DialogTitle>
                    <DialogDescription>
                        Текущий баланс: {currentUser?.balance?.toFixed(2) ?? '0.00'} руб. Введите сумму для зачисления.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Сумма пополнения (руб.)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="1000.47"
                            disabled={isSaving}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving || !amount}>
                        {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Зачислить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function UsersPage() {
  const { user, loading, adminResetPassword } = useAuth();
  const router = useRouter();
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  
  const [usersPage, setUsersPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<UserProfile | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{emailText: string} | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchAllData = useCallback(() => {
    setIsDataLoading(true);
    setAllUsers(getAllStoredUsers());
    setResetRequests(getPendingResetRequests().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsDataLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
    if(user?.role === 'admin') {
      fetchAllData();
    }
  }, [user, loading, router, fetchAllData]);
  
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
    setIsResetModalOpen(true);
    setResetResult(null);
    setNewPassword('');
  }
  
  const handleBalanceClick = (user: UserProfile) => {
    setSelectedUserForBalance(user);
    setIsBalanceModalOpen(true);
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
  
  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedRequest(null);
    setResetResult(null);
    setNewPassword('');
  }


  if (loading || !user || isDataLoading) {
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
          Просмотр аккаунтов, управление балансом и сброс паролей.
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
              <CardTitle className="font-headline">Все пользователи</CardTitle>
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
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleBalanceClick(u)}>
                                <Banknote className="mr-2 size-4" />
                                Баланс
                            </Button>
                        </TableCell>
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
            {allUsers.length > ITEMS_PER_PAGE && (
              <CardFooter className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                      Страница {usersPage} из {totalUsersPages}
                  </span>
                  <div className="flex gap-2">
                      <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => p - 1)}
                          disabled={usersPage === 1}
                      >
                          Назад
                      </Button>
                      <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => p + 1)}
                          disabled={usersPage >= totalUsersPages}
                      >
                          Вперед
                      </Button>
                  </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="reset-requests">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Запросы на сброс пароля</CardTitle>
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
            {resetRequests.length > ITEMS_PER_PAGE && (
              <CardFooter className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                      Страница {requestsPage} из {totalRequestsPages}
                  </span>
                  <div className="flex gap-2">
                      <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setRequestsPage(p => p - 1)}
                          disabled={requestsPage === 1}
                      >
                          Назад
                      </Button>
                      <Button 
                          variant="outline"
                          size="sm"
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
      <Dialog open={isResetModalOpen} onOpenChange={handleCloseResetModal}>
        <DialogContent className="sm:max-w-lg">
            {!resetResult ? (
              <>
                <DialogHeader>
                    <DialogTitle className="font-headline">Сброс пароля для {selectedRequest?.username}</DialogTitle>
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
                    <Button variant="outline" onClick={handleCloseResetModal} disabled={isResetting}>Отмена</Button>
                    <Button onClick={handleConfirmReset} disabled={!newPassword || isResetting}>
                        {isResetting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Сбросить и сгенерировать письмо
                    </Button>
                </DialogFooter>
              </>
            ) : (
                <>
                <DialogHeader>
                    <DialogTitle className="font-headline">Пароль сброшен. Отправьте письмо.</DialogTitle>
                    <DialogDescription>
                        Скопируйте текст ниже и вручную отправьте его пользователю на email: {selectedRequest?.email}.
                    </DialogDescription>
                </DialogHeader>
                 <div className="my-4 text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {resetResult.emailText}
                 </div>
                 <DialogFooter>
                     <Button onClick={handleCloseResetModal}>Закрыть</Button>
                 </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
      <BalanceModal 
        user={selectedUserForBalance}
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onBalanceUpdated={fetchAllData}
      />
    </div>
  );
}

    