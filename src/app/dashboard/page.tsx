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
import { CalendarDays, Trophy, Users, Loader2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface Event {
  title: string;
  status: 'Completed' | 'Scheduled';
  date: { seconds: number };
}

interface Competition {
  name: string;
  date: { seconds: number };
}

export default function DashboardPage() {
  const firestore = useFirestore();

  const eventsQuery = useMemo(() => 
    query(collection(firestore, 'events'), orderBy('date', 'desc'), limit(5)), 
    [firestore]
  );
  
  const upcomingEventsQuery = useMemo(() => 
    query(collection(firestore, 'events'), where('date', '>=', new Date()), where('status', '==', 'Scheduled')), 
    [firestore]
  );

  const teamMembersQuery = useMemo(() => 
    collection(firestore, 'teamMembers'), 
    [firestore]
  );
  
  const upcomingCompetitionQuery = useMemo(() => 
    query(collection(firestore, 'competitions'), where('date', '>=', new Date()), orderBy('date', 'asc'), limit(1)),
    [firestore]
  );

  const { data: recentActivity, isLoading: isLoadingActivity } = useCollection<Event>(eventsQuery);
  const { data: upcomingEvents, isLoading: isLoadingUpcomingEvents } = useCollection<Event>(upcomingEventsQuery);
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useCollection(teamMembersQuery);
  const { data: nextCompetition, isLoading: isLoadingCompetition } = useCollection<Competition>(upcomingCompetitionQuery);

  const upcomingPracticesThisWeek = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.date.seconds * 1000);
    const today = new Date();
    const endOfWeek = addDays(today, 7);
    return eventDate >= today && eventDate <= endOfWeek;
  }).length || 0;

  const nextCompetitionData = nextCompetition?.[0];
  const daysUntilCompetition = nextCompetitionData
    ? differenceInDays(new Date(nextCompetitionData.date.seconds * 1000), new Date())
    : null;

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
            {isLoadingUpcomingEvents ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              +{upcomingPracticesThisWeek} на этой неделе
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
            {isLoadingTeamMembers ? <Skeleton className="h-8 w-1/3 mt-1" /> : <div className="text-2xl font-bold">+{teamMembers?.length || 0}</div>}
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
             {isLoadingCompetition ? <Skeleton className="h-8 w-1/2 mt-1" /> : <div className="text-2xl font-bold">{renderDays(daysUntilCompetition)}</div>}
            <p className="text-xs text-muted-foreground">{nextCompetitionData?.name || 'Нет предстоящих соревнований'}</p>
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
              {isLoadingActivity ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariants[activity.status] || 'default'}>{statusTranslations[activity.status] || activity.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{format(new Date(activity.date.seconds * 1000), 'd MMMM yyyy', { locale: ru })}</TableCell>
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
