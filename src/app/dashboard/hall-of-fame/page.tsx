'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

// Athlete-specific data that complements the placeholder images
const athleteDetails: {[key: string]: {name: string; achievements: string; bio: string}} = {
    'athlete-1': {
        name: 'Олена Демьяненко',
        achievements: '5-кратная чемпионка страны, 2-кратный призер мира',
        bio: 'Один из основателей и вдохновитель для всех.',
    },
    'athlete-2': {
        name: 'Андрей Шевченко',
        achievements: '3-кратный чемпион Европы, финалист Олимпийских игр',
        bio: 'Известен своей мощной техникой и спортивным духом.',
    },
    'athlete-3': {
        name: 'Яна Клочкова',
        achievements: '4-кратная олимпийская чемпионка',
        bio: '"Золотая рыбка" украинского спорта.',
    },
    'athlete-4': {
        name: 'Василий Ломаченко',
        achievements: '2-кратный олимпийский чемпион, чемпион мира в нескольких весовых категориях',
        bio: 'Мастер своего дела, известный своей работой ног.',
    },
    'athlete-5': {
        name: 'Сергей Бубка',
        achievements: 'Олимпийский чемпион, 6-кратный чемпион мира',
        bio: 'Побил мировой рекорд 35 раз.',
    },
    'athlete-6': {
        name: 'Элина Свитолина',
        achievements: 'Чемпионка финала WTA, бронзовый призер Олимпийских игр',
        bio: 'Грозная сила на корте.',
    }
};


export default function HallOfFamePage() {
  
  // Combine image data with athlete-specific details
  const athletes = useMemo(() => {
    return PlaceHolderImages.filter(img => img && typeof img.id === 'string' && img.id.startsWith('athlete-')).map(imgData => {
        const details = athleteDetails[imgData.id];
        if (!details) return null;
        return {
          ...imgData,
          ...details,
        };
      })
      .filter((athlete): athlete is ImagePlaceholder & {name: string; achievements: string; bio: string} => athlete !== null);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Зал славы
        </h1>
        <p className="text-muted-foreground">
          Чествуем легенд команды Демьяненко.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete, i) => (
            <Card 
              key={athlete.id} 
              className="flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
                <div className="relative">
                    <Image
                      src={athlete.imageUrl}
                      alt={athlete.name}
                      width={300}
                      height={300}
                      data-ai-hint={athlete.imageHint}
                      className="object-cover w-full h-auto"
                    />
                </div>
               <CardHeader>
                <CardTitle className="font-headline">{athlete.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {athlete.achievements}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{athlete.bio}</p>
              </CardContent>
              <CardFooter>
                 <Badge variant="secondary">Легенда</Badge>
              </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
