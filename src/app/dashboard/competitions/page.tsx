import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";

const upcoming = [
    { name: 'Региональный чемпионат', date: '2024-08-15', location: 'Киев, Украина', status: 'Зарегистрирован' },
    { name: 'Национальный кубок', date: '2024-09-05', location: 'Львов, Украина', status: 'Не зарегистрирован' },
    { name: 'Международный открытый турнир', date: '2024-10-20', location: 'Варшава, Польша', status: 'В ожидании' },
];

const results = [
    { name: 'Городской турнир', date: '2024-06-10', location: 'Одесса, Украина', result: '1-е место' },
    { name: 'Весенний пригласительный', date: '2024-04-22', location: 'Харьков, Украина', result: '3-е место' },
    { name: 'Зимняя классика', date: '2024-02-18', location: 'Днепр, Украина', result: '2-е место' },
]

export default function CompetitionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Соревнования
        </h1>
        <p className="text-muted-foreground">
          Управляйте регистрациями на соревнования и просматривайте результаты.
        </p>
      </div>

      <Card>
        <Tabs defaultValue="upcoming">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Центр соревнований</CardTitle>
                    <CardDescription>Ваш портал в мир соревновательных событий.</CardDescription>
                </div>
                 <TabsList>
                    <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
                    <TabsTrigger value="results">Результаты</TabsTrigger>
                </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="upcoming">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Соревнование</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Место</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((comp) => (
                    <TableRow key={comp.name}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{comp.date}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell>
                        <Badge variant={comp.status === 'Зарегистрирован' ? 'default' : 'outline'}>
                            {comp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Подробнее
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="results">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Соревнование</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Место</TableHead>
                    <TableHead className="text-right">Результат</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((comp) => (
                    <TableRow key={comp.name}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{comp.date}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{comp.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
