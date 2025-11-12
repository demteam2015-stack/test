'use client';

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
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Trophy, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Static data to replace Firestore calls
const staticStats = {
  upcomingPractices: 5,
  upcomingThisWeek: 2,
  activeMembers: 28,
  daysUntilCompetition: 12,
  nextCompetitionName: 'Региональный чемпионат',
};

const recentActivity = [
  { id: '1', title: 'Вечерняя тренировка по технике', status: 'Completed', date: new Date('2024-07-28T18:00:00') },
  { id: '2', title: 'Утренняя силовая тренировка', status: 'Completed', date: new Date('2024-07-28T09:00:00') },
  { id: '3', title: 'Собрание команды', status: 'Completed', date: new Date('2024-07-27T19:00:00') },
  { id: '4', title: 'Открытый ковер', status: 'Scheduled', date: new Date('2024-07-29T17:00:00') },
  { id: '5', title: 'Тренировка по выносливости', status: 'Scheduled', date: new Date('2024-07-30T09:00:00') },
].sort((a, b) => b.date.getTime() - a.date.getTime());


export default function DashboardPage() {
  const renderDays = (days: number | null) => {
    if (days === null) return 'N/A';
    if (days === 0) return 'сегодня';
    if (days === 1) return 'завтра';
    const lastDigit = days % 10;
    if (days > 10 && days < 20) return `через ${days} дней`;
    if (lastDigit === 1) return `через ${days} день`;
    if (lastDigit > 1 && lastDigit < 5) return `через ${days} дня`;
    return `через ${days} дней`;
  }

  const badgeVariants: { [key: string]: 'default' | 'secondary' } = {
    Scheduled: 'default',
    Completed: 'secondary',
  };
  const statusTranslations: { [key: string]: string } = {
      Scheduled: 'Запланировано',
      Completed: 'Завершено'
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          С возвращением, атлет!
        </h1>
        <p className="text-muted-foreground">
          Вот сводка активности вашей команды.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Предстоящие тренировки
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staticStats.upcomingPractices}</div>
            <p className="text-xs text-muted-foreground">
              +{staticStats.upcomingThisWeek} на этой неделе
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные участники
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{staticStats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              Участников в команде
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Следующее соревнование</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{renderDays(staticStats.daysUntilCompetition)}</div>
            <p className="text-xs text-muted-foreground">{staticStats.nextCompetitionName}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Недавняя активность</CardTitle>
          <CardDescription>
            Обзор последних событий и новостей команды.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Событие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariants[activity.status] || 'default'}>{statusTranslations[activity.status] || activity.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{format(activity.date, 'd MMMM yyyy', { locale: ru })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Нет недавней активности.
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
