'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useMemo } from "react";
import { eventsData } from "@/lib/data";
import type { Event } from "@/lib/data";

export default function SchedulePage() {
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const events = useMemo(() => {
    return eventsData
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= todayStart && eventDate <= todayEnd
        })
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [todayStart, todayEnd]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
  }

  const badgeVariants: { [key: string]: 'default' | 'secondary' } = {
    'тренировка': 'default',
    'собрание': 'secondary',
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Расписание тренировок
        </h1>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Сегодняшние события</CardTitle>
            <CardDescription>
                {`Вот запланированные на сегодня события. Всего: ${events.length}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-border">
                {events && events.length > 0 ? (
                    events.map(event => (
                        <li key={event.id} className="flex items-center space-x-4 p-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{event.title}</p>
                                <p className="truncate text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(event.date)}
                                </p>
                                 <p className="truncate text-sm text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {event.location || 'Не указано'}
                                </p>
                            </div>
                            <div>
                               <Badge variant={badgeVariants[event.type] || 'default'}>{event.type}</Badge>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-muted-foreground h-48 flex items-center justify-center">
                        На сегодня событий не запланировано.
                    </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={new Date()}
              className="w-full"
            />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="text-base">Ваша посещаемость</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">92%</span>
                <span className="text-sm text-muted-foreground">в этом месяце</span>
            </div>
             <p className="text-xs text-muted-foreground mt-1">Отличная работа! Постоянство - ключ к успеху.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
