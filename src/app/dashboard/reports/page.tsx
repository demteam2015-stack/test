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
import { BarChart, Loader, Users, TrendingUp, TrendingDown, Wallet, User as UserIcon } from 'lucide-react';
import { getFullJournal } from '@/lib/journal-api';
import { getAthletes, type Athlete } from '@/lib/athletes-api';
import { getPayments, type Payment } from '@/lib/payments-api';
import { useAuth } from '@/context/auth-context';
import { AttendanceChart } from '@/components/attendance-chart';

type AttendanceReport = {
  athleteId: string;
  name: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  attendancePercentage: number;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [financialReport, setFinancialReport] = useState({ income: 0, expenses: 0, net: 0 });
  const [userAthleteProfile, setUserAthleteProfile] = useState<Athlete | null>(null);

  const isManager = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    const generateReports = async () => {
        if (!user) return;
        setIsLoading(true);

        const journal = await getFullJournal();
        const athletes: Athlete[] = await getAthletes();
        const payments: Payment[] = await getPayments();
        
        // --- Find athlete profile for current user if they are an athlete ---
        if (user?.role === 'athlete' || user?.role === 'parent') {
            // Simple link by name for this simulation. In a real app, use IDs.
            const currentUserAthlete = athletes.find(a => 
                a.firstName === user.firstName && a.lastName === user.lastName
            );
            setUserAthleteProfile(currentUserAthlete || null);
        }
        
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
            const totalTrainingsWithStatus = stats.present + stats.absent + stats.excused;
            const totalAttendance = stats.present + stats.absent;
            return {
                athleteId: athlete.id,
                name: `${athlete.lastName} ${athlete.firstName}`,
                ...stats,
                total: totalTrainingsWithStatus,
                // Calculate percentage based on attended vs missed (excused not counted against)
                attendancePercentage: totalAttendance > 0 ? (stats.present / totalAttendance) * 100 : 0
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
        
        setAttendanceReport(reportData);

        // --- Generate Financial Report (only for managers) ---
        if(isManager) {
            let income = 0;
            let expenses = 0;

            payments.forEach(payment => {
                const amount = parseFloat(payment.amount);
                if (isNaN(amount)) return;

                if (payment.status === 'Оплачено') {
                    // Use amount directly, positive is income, negative is expense
                    if (amount > 0) {
                        income += amount;
                    } else {
                        expenses += Math.abs(amount);
                    }
                }
            });

            // The logic for expenses from `deductFromBalance` creates negative payments.
            // We'll calculate expenses based on these negative payments.
            const allExpenses = payments
                .filter(p => p.status === 'Оплачено' && parseFloat(p.amount) < 0)
                .reduce((acc, p) => acc + Math.abs(parseFloat(p.amount)), 0);

            setFinancialReport({ income, expenses: allExpenses, net: income - allExpenses });
        }

        setIsLoading(false);
    };

    generateReports();
  }, [user, isManager]);
  
  const userReport = useMemo(() => {
    if (!userAthleteProfile) return null;
    return attendanceReport.find(r => r.athleteId === userAthleteProfile.id);
  }, [userAthleteProfile, attendanceReport]);

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderManagerView = () => (
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
                            {`${(row.attendancePercentage || 0).toFixed(0)}%`}
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
  );
  
  const renderAthleteView = () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="size-5"/>Моя посещаемость</CardTitle>
          <CardDescription>
            Ваша персональная статистика посещений тренировок.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-2">
           {userReport ? (
            <>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Посещено</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {userReport.present}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Пропущено</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">
                                    {userReport.absent}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Уваж. причина</CardTitle>
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-muted-foreground">
                                    {userReport.excused}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Процент посещений</CardTitle>
                                <BarChart className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {`${(userReport.attendancePercentage || 0).toFixed(0)}%`}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div>
                     <AttendanceChart data={userReport} />
                </div>
            </>
           ) : (
             <div className="lg:col-span-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <p className="text-muted-foreground">Данных о вашей посещаемости пока нет.</p>
            </div>
           )}
        </CardContent>
      </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <BarChart className="size-8 text-primary"/>
            Отчеты
        </h1>
        <p className="text-muted-foreground">
          {isManager ? 'Анализ посещаемости и финансовых потоков.' : 'Ваша персональная статистика.'}
        </p>
      </div>

      {isManager ? renderManagerView() : renderAthleteView()}
    </div>
  );
}
