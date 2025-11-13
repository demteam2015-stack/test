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
import { ArrowRight, Trophy, Globe as GlobeIcon, MapPin, Calendar } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Globe = dynamic(() => import('@/components/globe'), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

export default function CompetitionsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  
  const globePoints = useMemo(() => {
    return competitionsData.map(c => ({
        lat: c.coordinates.lat,
        lng: c.coordinates.lng,
        label: c.name,
        result: c.result || c.status,
    }))
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <Trophy className="size-8 text-primary" />
          Карта Достижений
        </h1>
        <p className="text-muted-foreground">
          Исследуйте географию наших побед и предстоящих вызовов.
        </p>
      </div>

       <Card className="overflow-hidden">
        <CardHeader>
           <div className="flex items-center gap-3">
              <GlobeIcon className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Интерактивный глобус</CardTitle>
           </div>
          <CardDescription>Вращайте глобус, чтобы увидеть места соревнований. Наведите на маркер для деталей.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-[400px] w-full rounded-lg border bg-muted/20 relative">
             {isClient && <Globe pointsData={globePoints} />}
           </div>
        </CardContent>
      </Card>


      <Card>
        <Tabs defaultValue="upcoming">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="font-headline">Список соревнований</CardTitle>
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
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors gap-4 animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
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
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors gap-4 animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
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
