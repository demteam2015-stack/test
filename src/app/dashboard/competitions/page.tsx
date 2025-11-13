'use client';

import { competitionsData, type Competition } from '@/lib/data';
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
import { ArrowRight, Trophy, MapPin, Calendar } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="size-8 text-primary" />
          Соревнования
        </h1>
        <p className="text-muted-foreground">
          Исследуйте географию наших побед и предстоящих вызовов.
        </p>
      </div>

      <Card>
        <Tabs defaultValue="upcoming">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Список соревнований</CardTitle>
                <CardDescription>
                  Быстрый доступ к предстоящим событиям и результатам.
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
              <div className="space-y-4">
                {upcoming.map((comp, i) => (
                    <div 
                      key={comp.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors gap-4"
                    >
                        <div className="flex-grow">
                            <p className="font-semibold">{comp.name}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1.5"><Calendar className="size-4" /> {formatDate(comp.date)}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="size-4" /> {comp.location}</div>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 flex-shrink-0">
                             <Badge
                                variant={
                                comp.registrationStatus === 'Зарегистрирован'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={comp.registrationStatus === 'Зарегистрирован' ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50' : ''}
                            >
                                {comp.registrationStatus || 'N/A'}
                            </Badge>
                             <Button size="sm" variant="outline" className="w-full sm:w-auto">
                                Подробнее
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                         </div>
                    </div>
                  ))}
                   {upcoming.length === 0 && (
                     <div className="h-24 text-center flex items-center justify-center">
                        <p>Нет предстоящих соревнований.</p>
                    </div>
                   )}
              </div>
            </TabsContent>
            <TabsContent value="results">
              <div className="space-y-4">
                 {results.map((comp, i) => (
                    <div 
                      key={comp.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors gap-4"
                    >
                        <div className="flex-grow">
                           <p className="font-semibold">{comp.name}</p>
                           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1.5"><Calendar className="size-4" /> {formatDate(comp.date)}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="size-4" /> {comp.location}</div>
                           </div>
                        </div>
                        <div className="font-bold text-primary flex-shrink-0">
                          {comp.result || '-'}
                        </div>
                    </div>
                  ))}
                   {results.length === 0 && (
                     <div className="h-24 text-center flex items-center justify-center">
                        <p>Нет результатов.</p>
                    </div>
                   )}
                </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
