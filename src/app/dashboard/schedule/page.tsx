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
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin } from "lucide-react";

const events = [
    { time: '09:00 - 11:00', title: 'Утренние упражнения', location: 'Главная арена', type: 'тренировка' },
    { time: '13:00 - 14:00', title: 'Стратегическая сессия', location: 'Конференц-зал A', type: 'собрание' },
    { time: '16:30 - 18:00', title: 'Силовая и кондиционная подготовка', location: 'Спортзал', type: 'тренировка' },
]

export default function SchedulePage() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Расписание тренировок
        </h1>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Сегодняшние события</CardTitle>
            <CardDescription>Вот запланированные на сегодня события. Вы посещаете 2 из 3.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-border">
                {events.map(event => (
                    <li key={event.title} className="flex items-center space-x-4 p-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{event.title}</p>
                            <p className="truncate text-sm text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {event.time}
                            </p>
                             <p className="truncate text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                            </p>
                        </div>
                        <div>
                           <Badge variant={event.type === 'тренировка' ? 'default' : 'secondary'}>{event.type}</Badge>
                        </div>
                    </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button>Записаться на новое занятие</Button>
          </CardFooter>
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
