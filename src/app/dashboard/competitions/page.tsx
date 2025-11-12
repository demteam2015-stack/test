'use client';

import { competitionsData } from '@/lib/data';
import type { Competition } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ArrowRight, Trophy } from 'lucide-react';
import { useMemo } from 'react';

export default function CompetitionsPage() {
  const upcoming = useMemo(
    () =>
      competitionsData
        .filter((c) => c.status === 'Предстоящий')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [],
    []
  );

  const results = useMemo(
    () =>
      competitionsData
        .filter((c) => c.status === 'Завершенный')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [],
    []
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <Trophy className="size-8 text-primary" />
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
                <CardDescription>
                  Ваш портал в мир соревновательных событий.
                </CardDescription>
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
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{formatDate(comp.date)}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            comp.registrationStatus === 'Зарегистрирован'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {comp.registrationStatus || 'N/A'}
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
                   {upcoming.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Нет предстоящих соревнований.
                        </TableCell>
                    </TableRow>
                   )}
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
                      <TableRow key={comp.id}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{formatDate(comp.date)}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                          {comp.result || '-'}
                      </TableCell>
                      </TableRow>
                  ))}
                   {results.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Нет результатов.
                        </TableCell>
                    </TableRow>
                   )}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
