
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
import { format, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Define types to match Firestore documents
interface TeamEvent {
  title: string;
  status: 'Scheduled' | 'Completed';
  date: string; // ISO string
}

interface Competition {
  name: string;
  date: string; // ISO string
}

const StatCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-12 mt-1" />
            <Skeleton className="h-3 w-24 mt-2" />
        </CardContent>
    </Card>
);

const ActivityRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
    </TableRow>
);


export default function DashboardPage() {
  const firestore = useFirestore();

  // --- QUERIES ---
  const now = useMemo(() => new Date(), []);
  const startOfThisWeek = useMemo(() => startOfWeek(now, { weekStartsOn: 1 }), [now]);
  const endOfThisWeek = useMemo(() => endOfWeek(now, { weekStartsOn: 1 }), [now]);

  const upcomingEventsQuery = useMemo(() => 
    query(
      collection(firestore, 'events'), 
      where('date', '>=', now.toISOString())
    ), [firestore, now]
  );
  
  const recentActivityQuery = useMemo(() =>
    query(
      collection(firestore, 'events'),
      orderBy('date', 'desc'),
      limit(5)
    ), [firestore]
  );

  const teamMembersQuery = useMemo(() => collection(firestore, 'teamMembers'), [firestore]);

  const nextCompetitionQuery = useMemo(() => 
    query(
      collection(firestore, 'competitions'),
      where('date', '>=', now.toISOString()),
      orderBy('date', 'asc'),
      limit(1)
    ), [firestore, now]
  );

  // --- HOOKS ---
  const { data: upcomingEvents, isLoading: isLoadingEvents } = useCollection<TeamEvent>(upcomingEventsQuery);
  const { data: recentActivity, isLoading: isLoadingActivity } = useCollection<TeamEvent>(recentActivityQuery);
  const { data: teamMembers, isLoading: isLoadingMembers } = useCollection(teamMembersQuery);
  const { data: nextCompetitionData, isLoading: isLoadingCompetition } = useCollection<Competition>(nextCompetitionQuery);
  
  const nextCompetition = useMemo(() => nextCompetitionData?.[0], [nextCompetitionData]);
  const daysUntilCompetition = useMemo(() => nextCompetition ? differenceInDays(new Date(nextCompetition.date), now) : null, [nextCompetition, now]);
  
  const upcomingThisWeek = useMemo(() => 
    upcomingEvents?.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfThisWeek && eventDate <= endOfThisWeek;
    }).length || 0,
  [upcomingEvents, startOfThisWeek, endOfThisWeek]);

  const isLoading = isLoadingEvents || isLoadingMembers || isLoadingCompetition || isLoadingActivity;
  
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
        {isLoading ? (
            <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </>
        ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Предстоящие тренировки
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
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
                  <div className="text-2xl font-bold">+{teamMembers?.length || 0}</div>
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
            </>
        )}
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
              {isLoading ? (
                <>
                  <ActivityRowSkeleton />
                  <ActivityRowSkeleton />
                  <ActivityRowSkeleton />
                </>
              ) : recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariants[activity.status] || 'default'}>{statusTranslations[activity.status] || activity.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{format(new Date(activity.date), 'd MMMM yyyy', { locale: ru })}</TableCell>
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

    