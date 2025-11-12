'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { CalendarDays, Trophy, Users, MailWarning, ArrowRight, BookUser, BrainCircuit, CreditCard, Banknote } from 'lucide-react';
import { differenceInDays, endOfWeek, startOfWeek } from 'date-fns';
import { useMemo, useEffect, useState } from 'react';
import { competitionsData } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { getPendingResetRequests } from '@/lib/reset-api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAthletes } from '@/lib/athletes-api';
import { getAllEvents } from '@/lib/schedule-api';

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
  return users;
};

// --- Role-specific Dashboards ---

function AdminDashboard() {
    const [totalUsers, setTotalUsers] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);

    useEffect(() => {
        setTotalUsers(getAllStoredUsers().length);
        setPendingRequests(getPendingResetRequests().length);
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                Панель администратора
                </h1>
                <p className="text-muted-foreground">
                Обзор системы и управление пользователями.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Всего пользователей
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                        Зарегистрированных аккаунтов в системе.
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Запросы на сброс пароля
                        </CardTitle>
                        <MailWarning className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                        Ожидают вашего действия.
                        </p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                        <Link href="/dashboard/users">
                            Перейти к управлению пользователями
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function CoachDashboard() {
  const [teamSize, setTeamSize] = useState(0);

  useEffect(() => {
    getAthletes().then(athletes => setTeamSize(athletes.length));
  }, []);

  return (
      <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Панель тренера
            </h1>
            <p className="text-muted-foreground">
                Управляйте командой, расписанием и посещаемостью.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Состав команды
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{teamSize} спортсменов</div>
                <p className="text-xs text-muted-foreground">
                Активные участники в вашей команде.
                </p>
            </CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Основные инструменты</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard/team">
                        <Users className="mr-2 h-4 w-4" />
                        Управление командой
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard/journal">
                        <BookUser className="mr-2 h-4 w-4" />
                        Открыть журнал
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard/schedule">
                         <CalendarDays className="mr-2 h-4 w-4" />
                        Редактировать расписание
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}


function ParentDashboard({ user }: { user: UserProfile }) {
  return (
      <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Панель родителя
            </h1>
            <p className="text-muted-foreground">
                Управляйте финансами и будьте в курсе событий.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Мой баланс
                    </CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {user?.balance !== undefined ? `${user.balance.toFixed(2)} руб.` : '0.00 руб.'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Средства для оплаты тренировок.
                    </p>
                </CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/payments">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Пополнить баланс и история
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}

function AthleteDashboard() {
  const now = useMemo(() => new Date(), []);
  
  const weeklyEventsCount = useMemo(() => {
    const allEvents = getAllEvents();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    }).length;
  }, [now]);

  const nextCompetition = useMemo(() => competitionsData.filter(c => new Date(c.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0], [now]);
  
  const daysUntilCompetition = useMemo(() => nextCompetition ? differenceInDays(new Date(nextCompetition.date), now) : null, [nextCompetition, now]);

  const renderDays = (days: number | null) => {
    if (days === null) return 'Нет данных';
    if (days < 0) return 'Прошло';
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    const lastDigit = days % 10;
    if (days > 10 && days < 20) return `через ${days} дней`;
    if (lastDigit === 1) return `через ${days} день`;
    if (lastDigit > 1 && lastDigit < 5) return `через ${days} дня`;
    return `через ${days} дней`;
  }
  
  return (
      <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Панель спортсмена
            </h1>
            <p className="text-muted-foreground">
                Сводка вашей предстоящей активности.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Тренировки на этой неделе
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{weeklyEventsCount}</div>
                <p className="text-xs text-muted-foreground">
                    Запланировано в расписании.
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Следующее соревнование</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{renderDays(daysUntilCompetition)}</div>
                <p className="text-xs text-muted-foreground">{nextCompetition?.name || 'Нет предстоящих соревнований'}</p>
            </CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                 <Button asChild>
                    <Link href="/dashboard/recommendations">
                       <BrainCircuit className="mr-2 h-4 w-4" />
                        Рекомендации AI-тренера
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/dashboard/schedule">
                       <CalendarDays className="mr-2 h-4 w-4" />
                        Посмотреть расписание
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}

// --- Main Page Component ---

export default function DashboardPage() {
    const { user } = useAuth();
    
    if (!user) return null;

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'coach':
            return <CoachDashboard />;
        case 'parent':
            return <ParentDashboard user={user} />;
        case 'athlete':
            return <AthleteDashboard />;
        default:
            return <AthleteDashboard />; // Fallback to the most basic view
    }
}
