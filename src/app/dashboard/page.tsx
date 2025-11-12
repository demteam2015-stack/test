'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarDays, Trophy, Users } from 'lucide-react';
import { differenceInDays, endOfWeek, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { competitionsData, eventsData, teamMembersData } from '@/lib/data';

export default function DashboardPage() {
  const now = useMemo(() => new Date(), []);
  const startOfThisWeek = useMemo(() => startOfWeek(now, { weekStartsOn: 1 }), [now]);
  const endOfThisWeek = useMemo(() => endOfWeek(now, { weekStartsOn: 1 }), [now]);

  const upcomingEvents = useMemo(() => eventsData.filter(event => new Date(event.date) >= now), [now]);
  const teamMembers = teamMembersData;
  const nextCompetition = useMemo(() => competitionsData.filter(c => new Date(c.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0], [now]);
  
  const daysUntilCompetition = useMemo(() => nextCompetition ? differenceInDays(new Date(nextCompetition.date), now) : null, [nextCompetition, now]);
  
  const upcomingThisWeek = useMemo(() => 
    upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfThisWeek && eventDate <= endOfThisWeek;
    }).length,
  [upcomingEvents, startOfThisWeek, endOfThisWeek]);

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
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              +{upcomingThisWeek} на этой неделе
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
            <div className="text-2xl font-bold">+{teamMembers.length}</div>
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
             <div className="text-2xl font-bold">{renderDays(daysUntilCompetition)}</div>
            <p className="text-xs text-muted-foreground">{nextCompetition?.name || 'Нет предстоящих соревнований'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
