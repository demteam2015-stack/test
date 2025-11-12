'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Check, CreditCard } from "lucide-react";
import { plansData, paymentHistoryData } from "@/lib/data";
import type { Plan, Payment } from "@/lib/data";

export default function PaymentsPage() {

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <CreditCard className="size-8 text-primary" />
          Оплата и членство
        </h1>
        <p className="text-muted-foreground">
          Управляйте своей подпиской и просматривайте историю платежей.
        </p>
      </div>

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
            Ваши последние транзакции с командой.
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
    </div>
  );
}
