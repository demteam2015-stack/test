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

const COACH_PHONE_NUMBER = '+380 XX XXX-XX-XX'; // Placeholder

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

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    const payments = await getPayments();
    setPaymentHistory(payments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const generateSuggestedAmount = () => {
    const randomCents = Math.floor(Math.random() * 99) + 1;
    const baseAmount = 1000;
    const finalAmount = `${baseAmount}.${randomCents.toString().padStart(2, '0')}`;
    setSuggestedAmount(finalAmount);
  };

  useEffect(() => {
    generateSuggestedAmount();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedAmount);
    toast({
      title: 'Скопировано!',
      description: `Сумма ${suggestedAmount} руб. скопирована в буфер обмена.`,
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
                      <TableCell>{payment.amount}</TableCell>
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
                    Чтобы оплатить или продлить абонемент, выполните перевод по номеру телефона тренера. Для быстрой идентификации вашего платежа, пожалуйста, используйте сгенерированную ниже сумму.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label>Номер телефона для перевода</Label>
                    <p className="text-lg font-semibold">{COACH_PHONE_NUMBER}</p>
                </div>
                <div>
                    <Label>Рекомендуемая сумма для перевода</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-primary tabular-nums">{suggestedAmount} руб.</p>
                        <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Скопировать сумму">
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
      
      {user?.role === 'admin' || user?.role === 'coach' ? renderAdminOrCoachView() : renderParentAthleteView()}

    </div>
  );
}
