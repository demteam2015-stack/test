
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Plan {
    title: string;
    price: string;
    description: string;
    features: string[];
    isCurrent: boolean;
    isPopular?: boolean;
}

interface Payment {
    invoice: string;
    date: string; // ISO string
    amount: string;
    status: "Оплачено" | "В ожидании" | "Не удалось";
}

const PlanSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24 mt-2" />
            <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="flex-grow">
            <Separator className="my-4" />
            <ul className="space-y-3">
                <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-4/5" /></li>
                <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-3/5" /></li>
                <li className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-4/6" /></li>
            </ul>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

const PaymentRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto rounded-full" /></TableCell>
    </TableRow>
)

export default function PaymentsPage() {
  const firestore = useFirestore();

  const plansQuery = useMemo(() => collection(firestore, 'plans'), [firestore]);
  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useCollection<Plan>(plansQuery);

  // Note: For a real app, this should be a subcollection under a user.
  // e.g., /users/{userId}/payments
  const paymentsQuery = useMemo(() => query(collection(firestore, 'payments'), orderBy('date', 'desc')), [firestore]);
  const { data: paymentHistory, isLoading: isLoadingPayments, error: paymentsError } = useCollection<Payment>(paymentsQuery);

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

      {plansError && <p className="text-destructive">Ошибка загрузки планов: {plansError.message}</p>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {isLoadingPlans ? (
            <>
                <PlanSkeleton />
                <PlanSkeleton />
                <PlanSkeleton />
            </>
        ) : (
            plans?.map(plan => (
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
            ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">История платежей</CardTitle>
          <CardDescription>
            Ваши последние транзакции с командой.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsError && <p className="text-destructive p-4">Ошибка загрузки платежей: {paymentsError.message}</p>}
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
              {isLoadingPayments ? (
                <>
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                    <PaymentRowSkeleton />
                </>
              ) : paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map(payment => (
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

    