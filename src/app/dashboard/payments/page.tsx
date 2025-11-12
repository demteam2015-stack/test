'use client';

import { useState, useEffect } from 'react';
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
import { Check, CreditCard, Copy, RefreshCw, Banknote } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { plansData, paymentHistoryData } from "@/lib/data";
import type { Payment } from "@/lib/data";

const COACH_PHONE_NUMBER = '+380 XX XXX-XX-XX'; // Placeholder

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestedAmount, setSuggestedAmount] = useState('1000.00');

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
      description: `Сумма ${suggestedAmount} UAH скопирована в буфер обмена.`,
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
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plansData.map(plan => (
            <Card key={plan.id} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader className="relative">
                    {plan.isPopular && <Badge className="absolute top-[-0.75rem] right-4">Популярный</Badge>}
                    <CardTitle className="font-headline">{plan.title}</CardTitle>
                    <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/месяц</span></p>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Separator className="my-4" />
                    <ul className="space-y-3">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={plan.isCurrent} variant={plan.isCurrent ? 'outline' : 'default'}>
                        {plan.isCurrent ? 'Текущий план' : 'Выбрать план'}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">История платежей</CardTitle>
          <CardDescription>
            Просмотр всех транзакций в системе.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {paymentHistoryData && paymentHistoryData.length > 0 ? (
                paymentHistoryData.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.invoice}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
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
                    История платежей пуста.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
  
  const renderParentAthleteView = () => (
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Banknote />
                        Мой баланс
                    </CardTitle>
                    <CardDescription>Ваш текущий счет в команде.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">
                        {user?.balance !== undefined ? `${user.balance.toFixed(2)} UAH` : 'Загрузка...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Средства списываются автоматически после каждой отмеченной тренировки.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="font-headline">История платежей</CardTitle>
                  <CardDescription>
                    Ваши последние транзакции.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
        </div>
        <Card className="lg:col-span-1 border-primary ring-2 ring-primary">
            <CardHeader>
                <CardTitle>Пополнить баланс</CardTitle>
                <CardDescription>
                    Чтобы пополнить баланс, выполните перевод по номеру телефона тренера. Для быстрой идентификации вашего платежа, пожалуйста, используйте сгенерированную ниже сумму.
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
                        <p className="text-2xl font-bold text-primary tabular-nums">{suggestedAmount} UAH</p>
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
                <p className="text-sm text-muted-foreground">После совершения перевода, администратор зачислит средства на ваш баланс в течение рабочего дня. Вы увидите обновленный баланс на этой странице.</p>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <CreditCard className="size-8 text-primary" />
          Оплата и членство
        </h1>
        <p className="text-muted-foreground">
          Управляйте своим счетом и просматривайте историю платежей.
        </p>
      </div>
      
      {user?.role === 'admin' || user?.role === 'coach' ? renderAdminOrCoachView() : renderParentAthleteView()}

    </div>
  );
}
