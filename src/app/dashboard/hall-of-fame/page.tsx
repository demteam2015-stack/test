import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Award, Medal, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const athletes = [
  {
    name: 'Олена Демьяненко',
    achievements: '5-кратная чемпионка страны, 2-кратный призер мира',
    bio: 'Один из основателей и вдохновитель для всех.',
    imageId: 'athlete-1',
  },
  {
    name: 'Андрей Шевченко',
    achievements: '3-кратный чемпион Европы, финалист Олимпийских игр',
    bio: 'Известен своей мощной техникой и спортивным духом.',
    imageId: 'athlete-2',
  },
  {
    name: 'Яна Клочкова',
    achievements: '4-кратная олимпийская чемпионка',
    bio: '"Золотая рыбка" украинского спорта.',
    imageId: 'athlete-3',
  },
  {
    name: 'Василий Ломаченко',
    achievements: '2-кратный олимпийский чемпион, чемпион мира в нескольких весовых категориях',
    bio: 'Мастер своего дела, известный своей работой ног.',
    imageId: 'athlete-4',
  },
  {
    name: 'Элина Свитолина',
    achievements: 'Чемпионка финала WTA, бронзовый призер Олимпийских игр',
    bio: 'Грозная сила на корте.',
    imageId: 'athlete-6',
  },
   {
    name: 'Сергей Бубка',
    achievements: 'Олимпийский чемпион, 6-кратный чемпион мира',
    bio: 'Побил мировой рекорд 35 раз.',
    imageId: 'athlete-5'
   }
];

export default function HallOfFamePage() {
  const getImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
  };

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
        {athletes.map((athlete) => {
          const imgData = getImage(athlete.imageId);
          return (
            <Card key={athlete.name} className="flex flex-col overflow-hidden">
              {imgData && (
                <div className="aspect-square relative">
                    <Image
                      src={imgData.imageUrl}
                      alt={athlete.name}
                      fill
                      className="object-cover"
                      data-ai-hint={imgData.imageHint}
                    />
                </div>
              )}
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
          );
        })}
      </div>
    </div>
  );
}
