'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Loader, Users, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { getJournal, type Journal, type AttendanceStatus } from '@/lib/journal-api';
import { getAthletes, type Athlete } from '@/lib/athletes-api';
import { getPayments, type Payment } from '@/lib/payments-api';
import { useAuth } from '@/context/auth-context';

type AttendanceReport = {
  athleteId: string;
  name: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [financialReport, setFinancialReport] = useState({ income: 0, expenses: 0, net: 0 });

  const canView = user?.role === 'admin' || user?.role === 'coach';

  const generateReports = useCallback(async () => {
    setIsLoading(true);

    // --- Generate Attendance Report ---
    const journal: Journal = await getJournal();
    const athletes: Athlete[] = await getAthletes();
    const attendanceMap = new Map<string, { present: number; absent: number; excused: number }>();

    athletes.forEach(athlete => {
        attendanceMap.set(athlete.id, { present: 0, absent: 0, excused: 0 });
    });

    Object.values(journal).forEach(day => {
        Object.values(day).forEach(event => {
            Object.entries(event).forEach(([athleteId, status]) => {
                if (attendanceMap.has(athleteId)) {
                    const current = attendanceMap.get(athleteId)!;
                    if (status === 'present') current.present++;
                    if (status === 'absent') current.absent++;
                    if (status === 'excused') current.excused++;
                }
            });
        });
    });

    const reportData: AttendanceReport[] = athletes.map(athlete => {
        const stats = attendanceMap.get(athlete.id)!;
        const total = stats.present + stats.absent + stats.excused;
        return {
            athleteId: athlete.id,
            name: `${athlete.lastName} ${athlete.firstName}`,
            ...stats,
            total,
        };
    }).sort((a,b) => a.name.localeCompare(b.name));
    setAttendanceReport(reportData);

    // --- Generate Financial Report ---
    const payments: Payment[] = await getPayments();
    let income = 0;
    let expenses = 0;

    payments.forEach(payment => {
        const amount = parseFloat(payment.amount);
        if (isNaN(amount)) return;

        if (payment.status === 'Оплачено') {
            if (amount > 0) {
                income += amount;
            } else {
                expenses += Math.abs(amount); // Expenses are stored as negative
            }
        }
    });

    setFinancialReport({ income, expenses, net: income - expenses });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (canView) {
      generateReports();
    }
  }, [canView, generateReports]);

  if (!canView) {
    return (
       <div className="flex flex-col gap-8">
          <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                  <BarChart className="size-8 text-primary"/>
                  Отчеты
              </h1>
              <p className="text-muted-foreground">
                  У вас нет прав для просмотра этой страницы.
              </p>
          </div>
       </div>
    );
  }

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <BarChart className="size-8 text-primary"/>
            Отчеты
        </h1>
        <p className="text-muted-foreground">
          Анализ посещаемости и финансовых потоков.
        </p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance">
            <Users className="mr-2 size-4" />
            Посещаемость
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Wallet className="mr-2 size-4" />
            Финансы
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по посещаемости</CardTitle>
              <CardDescription>
                Сводная статистика посещений тренировок по каждому спортсмену.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Спортсмен</TableHead>
                    <TableHead className="text-center">Присутствовал</TableHead>
                    <TableHead className="text-center">Отсутствовал</TableHead>
                    <TableHead className="text-center">Уваж. причина</TableHead>
                    <TableHead className="text-center">Процент посещений</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceReport.length > 0 ? (
                    attendanceReport.map((row) => (
                      <TableRow key={row.athleteId}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-center">{row.present}</TableCell>
                        <TableCell className="text-center">{row.absent}</TableCell>
                        <TableCell className="text-center">{row.excused}</TableCell>
                        <TableCell className="text-center font-bold">
                            {row.present > 0 ? `${((row.present / (row.present + row.absent)) * 100).toFixed(0)}%` : '0%'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Данных для отчета пока нет.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial">
           <Card>
            <CardHeader>
              <CardTitle>Финансовый отчет</CardTitle>
              <CardDescription>
                Общая сводка по доходам (пополнения) и расходам (списания за тренировки).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">
                                {financialReport.income.toFixed(2)} руб.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Сумма всех подтвержденных пополнений.
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Общий расход</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">
                               {financialReport.expenses.toFixed(2)} руб.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Сумма списаний за тренировки.
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Итого</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${financialReport.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                {financialReport.net.toFixed(2)} руб.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Доходы минус расходы.
                            </p>
                        </CardContent>
                    </Card>
                </div>
                 <p className="text-sm text-muted-foreground pt-4 border-t">
                    В отчет включаются только платежи со статусом "Оплачено". Списания за тренировки также учитываются как расходы.
                </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
