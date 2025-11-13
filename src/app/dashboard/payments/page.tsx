'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Copy, RefreshCw, Edit, Trash2, Loader, CalendarIcon, PlusCircle, User } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getPayments, updatePayment, addPayment, type Payment } from '@/lib/payments-api';
import { getConfigValue, setConfigValue } from '@/lib/config-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const REQUISITES_KEY = 'payment_requisites';
const DEFAULT_REQUISITES = '';
const BASE_AMOUNT_KEY = 'payment_base_amount';
const DEFAULT_BASE_AMOUNT = '1000';

// --- Utility function to get all users ---
const getAllStoredUsers = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const users: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_id_')) {
            try {
                const storedUser = JSON.parse(localStorage.getItem(key) || '');
                // We only need basic info for the dropdown
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


const RequisitesForm = ({ onUpdate, currentRequisites }: { onUpdate: (newRequisites: string) => void, currentRequisites: string }) => {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requisites, setRequisites] = useState(currentRequisites);
    
    useEffect(() => {
        setRequisites(currentRequisites);
    }, [currentRequisites, isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setConfigValue(REQUISITES_KEY, requisites);
        onUpdate(requisites);
        setIsSaving(false);
        setIsModalOpen(false);
        toast({ title: 'Реквизиты обновлены' });
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Редактировать реквизиты</DialogTitle>
                        <DialogDescription>
                           Обновите информацию, которая будет отображаться для оплаты.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label htmlFor="requisites">Реквизиты (номер телефона, карты и т.д.)</Label>
                            <Input id="requisites" value={requisites} onChange={(e) => setRequisites(e.target.value)} required disabled={isSaving} />
                        </div>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить
                        </Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
};

const AmountForm = ({ onUpdate, currentAmount }: { onUpdate: (newAmount: string) => void, currentAmount: string }) => {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState(currentAmount);
    
    useEffect(() => {
        setAmount(currentAmount);
    }, [currentAmount, isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            toast({ variant: 'destructive', title: 'Неверная сумма' });
            return;
        }

        setIsSaving(true);
        setConfigValue(BASE_AMOUNT_KEY, amount);
        onUpdate(amount);
        setIsSaving(false);
        setIsModalOpen(false);
        toast({ title: 'Базовая сумма обновлена' });
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Редактировать базовую сумму</DialogTitle>
                        <DialogDescription>
                           Установите основную сумму для абонемента (без копеек).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label htmlFor="base-amount">Сумма (руб.)</Label>
                            <Input id="base-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={isSaving} />
                        </div>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить
                        </Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
};


const PaymentForm = ({ onPaymentUpdated, paymentToEdit, children }: { onPaymentUpdated: () => void, paymentToEdit: Payment, children: React.ReactNode }) => {
    const { toast } = useToast();
    const { updateUserBalance } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [date, setDate] = useState<Date | undefined>();
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<Payment['status']>('В ожидании');

    useEffect(() => {
        if (paymentToEdit && isModalOpen) {
            setDate(new Date(paymentToEdit.date));
            setAmount(paymentToEdit.amount);
            setStatus(paymentToEdit.status);
        }
    }, [paymentToEdit, isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !amount || !status) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все поля.' });
            return;
        }

        setIsSaving(true);
        
        const paymentData: Partial<Omit<Payment, 'id'>> = {
            date: date.toISOString(),
            amount,
            status,
        };

        await updatePayment(paymentToEdit.id, paymentData, updateUserBalance);
        toast({ title: "Платёж обновлён" });
        onPaymentUpdated();
        setIsSaving(false);
        setIsModalOpen(false);
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsModalOpen(open);
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Редактировать платёж</DialogTitle>
                        <DialogDescription>
                           Измените данные платежа для счёта {paymentToEdit.invoice}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                             <Label>Пользователь</Label>
                             <Input value={`${paymentToEdit.userName} (${paymentToEdit.userId})`} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Дата платежа</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    disabled={isSaving}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP', { locale: ru}) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        locale={ru}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Сумма</Label>
                          <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={isSaving} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Статус</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as Payment['status'])} disabled={isSaving}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Оплачено">Оплачено</SelectItem>
                                    <SelectItem value="В ожидании">В ожидании</SelectItem>
                                    <SelectItem value="Не удалось">Не удалось</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const CreatePaymentForm = ({ onPaymentCreated }: { onPaymentCreated: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!user || isNaN(parsedAmount) || parsedAmount <= 0) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, введите корректную сумму.' });
            return;
        }

        setIsSaving(true);
        
        const paymentData: Omit<Payment, 'id'> = {
            date: new Date().toISOString(),
            amount: parsedAmount.toFixed(2),
            status: 'В ожидании',
            userId: user.id,
            userName: user.username,
            invoice: `INV-${Date.now()}`
        };

        await addPayment(paymentData);
        toast({ title: "Заявка на оплату создана", description: "Администратор скоро подтвердит ваш платёж." });
        onPaymentCreated();
        setIsSaving(false);
        setIsModalOpen(false);
        setAmount('');
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Я оплатил, создать заявку
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Новая заявка на оплату</DialogTitle>
                        <DialogDescription>
                           Введите точную сумму, которую вы перевели. Это поможет администратору быстрее найти и подтвердить ваш платёж.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-amount">Сумма перевода (руб.)</Label>
                            <Input id="create-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required disabled={isSaving} placeholder="1000.47" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving || !amount}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Создать заявку
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestedAmount, setSuggestedAmount] = useState('1000.00');
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRequisites, setPaymentRequisites] = useState(DEFAULT_REQUISITES);
  const [baseAmount, setBaseAmount] = useState(DEFAULT_BASE_AMOUNT);

  const isManager = user?.role === 'admin' || user?.role === 'coach';

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    // Pass user ID to seed initial data if needed
    const payments = await getPayments(user?.id); 
    setPaymentHistory(payments);
    setIsLoading(false);
  }, [user?.id]);

  const fetchConfig = useCallback(() => {
    setPaymentRequisites(getConfigValue(REQUISITES_KEY, DEFAULT_REQUISITES));
    setBaseAmount(getConfigValue(BASE_AMOUNT_KEY, DEFAULT_BASE_AMOUNT));
  }, []);

  useEffect(() => {
    if (user) {
        fetchPayments();
        fetchConfig();
    }
  }, [user, fetchPayments, fetchConfig]);

  const generateSuggestedAmount = useCallback(() => {
    const randomCents = Math.floor(Math.random() * 99) + 1;
    const finalAmount = `${baseAmount}.${randomCents.toString().padStart(2, '0')}`;
    setSuggestedAmount(finalAmount);
  }, [baseAmount]);

  useEffect(() => {
    generateSuggestedAmount();
  }, [generateSuggestedAmount]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: `"${text}" скопировано в буфер обмена.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  const statusBadgeVariant = (status: Payment['status']) => {
      switch (status) {
          case 'Оплачено':
              return 'secondary';
          case 'В ожидании':
              return 'outline';
          case 'Не удалось':
              return 'destructive';
          default:
              return 'default';
      }
  }

  const handleConfigUpdate = () => {
    fetchConfig();
    generateSuggestedAmount();
  }

  const renderAdminOrCoachView = () => (
    <Card>
        <CardHeader>
          <CardTitle className="font-headline">История платежей</CardTitle>
          <CardDescription>
            Просмотр всех транзакций в системе. Подтвердите получение оплаты здесь.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory && paymentHistory.length > 0 ? (
                  paymentHistory.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.userName || payment.userId}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{payment.amount} руб.</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(payment.status)} className={payment.status === 'Оплачено' ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50' : ''}>
                            {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <PaymentForm onPaymentUpdated={fetchPayments} paymentToEdit={payment}>
                             <Button size="sm" variant="ghost">
                               <Edit className="h-4 w-4" />
                            </Button>
                          </PaymentForm>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      История платежей пуста.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
  );
  
  const renderParentAthleteView = () => (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                  <CardTitle className="font-headline">История моих платежей</CardTitle>
                  <CardDescription>
                    Ваши последние транзакции по абонементам.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoading ? (
                      <div className="flex items-center justify-center h-60">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Счет</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead className="text-right">Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistory.filter(p => p.userId === user?.id).length > 0 ? (
                             paymentHistory.filter(p => p.userId === user?.id).map(payment => (
                                <TableRow key={payment.id}>
                                <TableCell className="font-medium">{payment.invoice}</TableCell>
                                <TableCell>{formatDate(payment.date)}</TableCell>
                                <TableCell>{payment.amount} руб.</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={statusBadgeVariant(payment.status)} className={payment.status === 'Оплачено' ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50' : ''}>
                                        {payment.status}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                             ))
                          ) : (
                           <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                История платежей пока пуста.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                   )}
                </CardContent>
              </Card>
        </div>
        <Card className="lg:col-span-1 border-primary ring-2 ring-primary sticky top-24">
            <CardHeader>
                <CardTitle>Оплата абонемента</CardTitle>
                <CardDescription>
                    Чтобы оплатить или продлить абонемент, выполните перевод по указанным реквизитам. Для быстрой идентификации вашего платежа, пожалуйста, используйте сгенерированную ниже сумму.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Label>Реквизиты для перевода</Label>
                        {isManager && <RequisitesForm onUpdate={setPaymentRequisites} currentRequisites={paymentRequisites} />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-semibold">{paymentRequisites}</p>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(paymentRequisites)} aria-label="Скопировать реквизиты">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <Label>Рекомендуемая сумма для перевода</Label>
                         {isManager && <AmountForm onUpdate={handleConfigUpdate} currentAmount={baseAmount} />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-primary tabular-nums">{suggestedAmount} руб.</p>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(suggestedAmount)} aria-label="Скопировать сумму">
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={generateSuggestedAmount} aria-label="Сгенерировать новую сумму">
                             <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">Нажмите, чтобы скопировать или сгенерировать новую сумму.</p>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">После совершения перевода, создайте заявку на оплату, чтобы администратор мог подтвердить её. Вы увидите обновленный статус в истории платежей.</p>
                <CreatePaymentForm onPaymentCreated={fetchPayments} />
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <CreditCard className="size-8 text-primary" />
          Оплата и абонементы
        </h1>
        <p className="text-muted-foreground">
          Управляйте оплатой абонементов и просматривайте историю платежей.
        </p>
      </div>
      
      {isManager ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                {renderAdminOrCoachView()}
            </div>
            <div className="lg:col-span-1">
                {/* Manager can see the parent view for context */}
                {renderParentAthleteView()}
            </div>
        </div>
      ) : renderParentAthleteView()}

    </div>
  );
}
