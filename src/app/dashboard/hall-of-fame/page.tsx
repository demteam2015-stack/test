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
    name: 'Olena Demyanenko',
    achievements: '5x National Champion, 2x World Medalist',
    bio: 'A founding member and inspiration to all.',
    imageId: 'athlete-1',
  },
  {
    name: 'Andriy Shevchenko',
    achievements: '3x European Champion, Olympic Finalist',
    bio: 'Known for his powerful technique and sportsmanship.',
    imageId: 'athlete-2',
  },
  {
    name: 'Yana Klochkova',
    achievements: '4x Olympic Gold Medalist',
    bio: 'The "Golden Fish" of Ukrainian sports.',
    imageId: 'athlete-3',
  },
  {
    name: 'Vasyl Lomachenko',
    achievements: '2x Olympic Gold, Multi-weight World Champion',
    bio: 'A master of the craft, renowned for his footwork.',
    imageId: 'athlete-4',
  },
  {
    name: 'Elina Svitolina',
    achievements: 'WTA Finals Champion, Olympic Bronze Medalist',
    bio: 'A formidable force on the court.',
    imageId: 'athlete-6',
  },
   {
    name: 'Serhiy Bubka',
    achievements: 'Olympic Gold, 6x World Champion',
    bio: 'Broke the world record 35 times.',
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
          Hall of Fame
        </h1>
        <p className="text-muted-foreground">
          Celebrating the legends of the Demyanenko Team.
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
                 <Badge variant="secondary">Legend</Badge>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
