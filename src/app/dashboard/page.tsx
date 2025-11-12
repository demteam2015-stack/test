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

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +2 на этой неделе
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
            <div className="text-2xl font-bold">+125</div>
            <p className="text-xs text-muted-foreground">
              +10 с прошлого месяца
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Следующее соревнование</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">через 12 дней</div>
            <p className="text-xs text-muted-foreground">Региональный чемпионат</p>
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
              <TableRow>
                <TableCell>Утренняя тренировка</TableCell>
                <TableCell>
                  <Badge variant="secondary">Завершено</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-20</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Собрание команды</TableCell>
                <TableCell>
                  <Badge variant="secondary">Завершено</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-19</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Прием нового участника</TableCell>
                <TableCell>
                  <Badge variant="default">Запланировано</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-22</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
