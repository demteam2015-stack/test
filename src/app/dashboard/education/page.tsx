
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, PlayCircle, HelpCircle, Clock, ListChecks } from 'lucide-react';
import { educationalMaterialsData } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function EducationPage() {

  const getIcon = (type: 'video' | 'quiz') => {
    if (type === 'video') {
      return <PlayCircle className="h-6 w-6 text-primary" />;
    }
    return <HelpCircle className="h-6 w-6 text-primary" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <GraduationCap className="size-8 text-primary" />
          Обучающие материалы
        </h1>
        <p className="text-muted-foreground">
          Видеоуроки, тесты и викторины для повышения вашего мастерства.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {educationalMaterialsData.map((material) => (
            <Card key={material.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="font-headline">{material.title}</CardTitle>
                  {getIcon(material.type)}
                </div>
                <CardDescription>
                  {material.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                  {material.type === 'video' && material.duration && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Продолжительность: {material.duration}</span>
                    </div>
                  )}
                  {material.type === 'quiz' && material.questionCount && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>Вопросов: {material.questionCount}</span>
                    </div>
                  )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <Badge variant={material.type === 'video' ? 'secondary' : 'outline'}>{material.type === 'video' ? 'Видеоурок' : 'Тест'}</Badge>
                 <Button disabled>
                    {material.type === 'video' ? 'Смотреть' : 'Начать'}
                 </Button>
              </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
