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
import { CreditCard, Copy, RefreshCw, Edit, Trash2, Loader, CalendarIcon } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getPayments, updatePayment, type Payment } from '@/lib/payments-api';
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
const DEFAULT_REQUISITES = '+380 XX XXX-XX-XX';
const BASE_AMOUNT_KEY = 'payment_base_amount';
const DEFAULT_BASE_AMOUNT = '1000';

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

        await updatePayment(paymentToEdit.id, paymentData);
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
    const payments = await getPayments();
    setPaymentHistory(payments);
    setIsLoading(false);
  }, []);

  const fetchConfig = useCallback(() => {
    setPaymentRequisites(getConfigValue(REQUISITES_KEY, DEFAULT_REQUISITES));
    setBaseAmount(getConfigValue(BASE_AMOUNT_KEY, DEFAULT_BASE_AMOUNT));
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchConfig();
  }, [fetchPayments, fetchConfig]);

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
    // We need to regenerate the suggested amount in case the base amount was changed
    generateSuggestedAmount();
  }

  const renderAdminOrCoachView = () => (
    <Card>
        <CardHeader>
          <CardTitle className="font-headline">История платежей</CardTitle>
          <CardDescription>
            Просмотр всех транзакций в системе. Администратор может подтверждать получение оплаты здесь.
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
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory && paymentHistory.length > 0 ? (
                  paymentHistory.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoice}</TableCell>
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
                  <CardTitle className="font-headline">История платежей</CardTitle>
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
                           <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                История платежей пока пуста.
                              </TableCell>
                            </TableRow>
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
                <p className="text-sm text-muted-foreground">После совершения перевода, администратор подтвердит оплату, и ваш абонемент будет активирован. Вы увидите обновленный статус в истории платежей.</p>
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
                {renderParentAthleteView()}
            </div>
        </div>
      ) : renderParentAthleteView()}

    </div>
  );
}

    