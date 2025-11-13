'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, type FormEvent, useEffect, useMemo, useRef } from 'react';
import { Loader, User, Award, Trophy, Share2, Camera, GraduationCap, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { competitionsData } from '@/lib/data';
import type { Competition } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFullName, getInitials, getAvatarUrl } from '@/lib/utils';
import { getCompletedCourses, type CompletedCourse } from '@/lib/education-api';

// New Timeline Component
const TimelineItem = ({ icon, date, title, description, children }: { icon: React.ReactNode, date: string, title: string, description?: string, children?: React.ReactNode }) => {
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <li className="mb-10 ms-6">
            <span className="absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-4 ring-background">
                {icon}
            </span>
            <div className="ml-4">
                <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">{formatDate(date)}</time>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
                {children}
            </div>
        </li>
    );
};


export default function ProfilePage() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      getCompletedCourses(user.id).then(courses => {
        setCompletedCourses(courses);
        setLoading(false);
      });
    }
  }, [user]);
  
  const timelineEvents = useMemo(() => {
      if (!user) return [];
      
      const competitionEvents = competitionsData
        .filter(c => c.status === 'Завершенный' && c.result)
        .map(c => ({
            type: 'competition' as const,
            date: c.date,
            title: `Соревнование: ${c.name}`,
            description: `Результат: ${c.result}`,
            id: c.id,
            original: c,
        }));
      
      const courseEvents = completedCourses.map(c => ({
            type: 'education' as const,
            date: c.completionDate,
            title: `Курс пройден: ${c.courseTitle}`,
            id: c.courseId,
        }));

      const registrationEvent = user.dateOfBirth ? [{
          type: 'registration' as const,
          date: new Date(new Date(user.dateOfBirth).setFullYear(new Date(user.dateOfBirth).getFullYear() + 7)).toISOString(), // Dummy registration date
          title: "Присоединился к команде",
          description: "Начало спортивного пути в Центре Демьяненко.",
          id: 'registration'
      }] : [];
      
      return [...competitionEvents, ...courseEvents, ...registrationEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, completedCourses]);

  if (!user) {
      return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
        updateUser(formData);
        toast({
            title: 'Профиль обновлен',
            description: 'Ваши данные были успешно сохранены.',
        });
        setIsSaving(false);
    }, 1000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({ photoURL: base64String });
         toast({
            title: 'Аватар обновлен!',
        });
      };
      reader.readAsDataURL(file);
    }
  }
  
  const handleShare = async (achievement: Competition) => {
    const text = `Отличное достижение! ${user?.firstName} ${user?.lastName} показал(а) результат "${achievement.result}" на соревновании "${achievement.name}"! #командаДемьяненко`;
    const shareData = {
        title: 'Мое достижение!',
        text: text,
        url: window.location.href,
    };
    
    try {
        await navigator.share(shareData);
    } catch (err) {
        // This is not a critical error. It can happen if the user cancels the share dialog
        // or if the browser does not fully support the API.
        // We fall back to copying to the clipboard.
        navigator.clipboard.writeText(text);
        toast({
          title: 'Скопировано в буфер обмена!',
          description: 'Вы можете вставить этот текст в любую социальную сеть.',
        });
    }
  };


  const roleTranslations: { [key: string]: string } = {
    athlete: 'Спортсмен',
    coach: 'Тренер',
    parent: 'Родитель',
    admin: 'Администратор',
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <User className="size-8 text-primary"/>
            Мой путь чемпиона
        </h1>
        <p className="text-muted-foreground">
          Ваша личная информация и хроника спортивных достижений.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleSave} className="lg:col-span-1 space-y-8 sticky top-24">
            <Card>
            <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                Эта информация отображается в вашем профиле.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={user.photoURL ?? getAvatarUrl(user.id, user.username)}
                                alt={getFullName(user.firstName, user.lastName)}
                            />
                            <AvatarFallback className="text-3xl">
                                {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{getFullName(user.firstName, user.lastName)}</p>
                        <p className="text-sm text-muted-foreground">{user.username} ({user.email})</p>
                        <Badge variant="outline" className="mt-2">{roleTranslations[user.role] || user.role}</Badge>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        />
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить изменения
                </Button>
            </CardFooter>
            </Card>
        </form>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Хроника достижений</CardTitle>
                    <CardDescription>Ваш путь в команде от начала и до сегодняшнего дня.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-60">
                           <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : timelineEvents.length > 0 ? (
                        <ol className="relative border-s border-border">
                            {timelineEvents.map(event => (
                                <TimelineItem 
                                    key={event.id}
                                    date={event.date}
                                    title={event.title}
                                    description={event.description}
                                    icon={
                                        event.type === 'competition' ? <Trophy className="size-4" /> :
                                        event.type === 'education' ? <GraduationCap className="size-4" /> :
                                        <Star className="size-4" />
                                    }
                                >
                                {event.type === 'competition' && (
                                     <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => handleShare(event.original as Competition)}
                                        aria-label="Поделиться достижением"
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Поделиться
                                    </Button>
                                )}
                                </TimelineItem>
                            ))}
                        </ol>
                    ) : (
                         <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                            <p className="text-muted-foreground">У вас пока нет записанных достижений.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
