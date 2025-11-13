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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useState, type FormEvent, useEffect, useMemo, useRef } from 'react';
import { Loader, User, Trophy, Share2, Camera, GraduationCap, Star, LogOut, BadgeCheck, ShieldCheck, Upload, FileClock, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { competitionsData } from '@/lib/data';
import type { Competition } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFullName, getInitials, getAvatarUrl } from '@/lib/utils';
import { getCompletedCourses, type CompletedCourse } from '@/lib/education-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAthletes, updateAthlete, attestationLevels, type AttestationLevel, type Athlete } from '@/lib/athletes-api';
import Image from 'next/image';

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
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Attestation state
  const [athleteProfile, setAthleteProfile] = useState<Athlete | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AttestationLevel | ''>('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect handles fetching all necessary data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      
      const fetchInitialData = async () => {
        setLoading(true);
        const courses = await getCompletedCourses(user.id);
        setCompletedCourses(courses);

        const allAthletes = await getAthletes();
        let profile: Athlete | undefined;

        if (user.role === 'athlete') {
            profile = allAthletes.find(a => 
                getFullName(a.firstName, a.lastName) === getFullName(user.firstName, user.lastName)
            );
        } else if (user.role === 'parent') {
            profile = allAthletes.find(a => a.parentId === user.email);
        } else if (user.role === 'admin' || user.role === 'coach') {
            // Find a profile that matches the admin/coach name to allow them to test
             profile = allAthletes.find(a => 
                getFullName(a.firstName, a.lastName) === getFullName(user.firstName, user.lastName)
            );
        }

        if (profile) {
            setAthleteProfile(profile);
            setCertificatePreview(profile.attestationCertificateUrl || null);
        }
        setLoading(false);
      };

      fetchInitialData();
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
    // Allow only Russian letters
    if (/^[а-яА-ЯёЁ]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    // This part is a mock since user data is encrypted.
    // In a real app, this would call an `updateUser` function.
    toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные были успешно сохранены (симуляция).',
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }
  
  const handleCertificateButtonClick = () => {
    certificateInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'certificate') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if(type === 'avatar') {
            // Mock update, as we can't really change encrypted data here
            toast({ title: 'Аватар обновлен (симуляция)!' });
        } else {
            setCertificateFile(file);
            setCertificatePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  const handleAttestationSubmit = async () => {
    if (!selectedLevel || !certificatePreview || !athleteProfile) {
        toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Пожалуйста, выберите уровень и загрузите сертификат. Убедитесь, что ваш профиль спортсмена существует."
        });
        return;
    }
    setIsSubmitting(true);
    await updateAthlete(athleteProfile.id, {
        attestationRequestLevel: selectedLevel,
        attestationCertificateUrl: certificatePreview,
        attestationStatus: 'pending',
        attestationRequestDate: new Date().toISOString(),
    });
    // Refresh athlete profile state
    setAthleteProfile(prev => prev ? {...prev, attestationStatus: 'pending', attestationRequestLevel: selectedLevel, attestationCertificateUrl: certificatePreview } : null);
    setIsSubmitting(false);
    toast({
        title: "Заявка отправлена",
        description: "Ваша заявка на аттестацию отправлена на рассмотрение тренеру."
    });
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
  
  const statusInfo = {
      pending: { text: "На рассмотрении", icon: <FileClock className="h-4 w-4 text-yellow-500" />, color: "text-yellow-500" },
      approved: { text: "Подтверждено", icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "text-green-500" },
      rejected: { text: "Отклонено", icon: <XCircle className="h-4 w-4 text-red-500" />, color: "text-red-500" },
      none: { text: "Нет заявки", icon: <></>, color: ""},
  }[athleteProfile?.attestationStatus || 'none'];

  const RoleIcon = ({ role }: { role: string }) => {
    switch (role) {
        case 'admin': return <BadgeCheck className="h-5 w-5 text-primary" />;
        case 'coach': return <ShieldCheck className="h-5 w-5 text-blue-500" />;
        case 'parent': return <Shield className="h-5 w-5 text-green-500" />;
        case 'athlete': return <User className="h-5 w-5 text-orange-500" />;
        default: return null;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="size-8 text-primary"/>
            Мой путь чемпиона
        </h1>
        <p className="text-muted-foreground">
          Ваша личная информация и хроника спортивных достижений.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8 sticky top-24">
        <form onSubmit={handleSave}>
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
                            onChange={(e) => handleFileChange(e, 'avatar')}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold flex items-center justify-center gap-2">
                           {getFullName(user.firstName, user.lastName)}
                           <RoleIcon role={user.role} />
                        </p>
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
                <Button type="submit" disabled={true} className="w-full" variant="outline">
                Сохранить изменения (Отключено)
                </Button>
            </CardFooter>
            </Card>
        </form>

        {(user.role === 'athlete' || user.role === 'parent') && (
            <Card>
                <CardHeader>
                    <CardTitle>Аттестация</CardTitle>
                    <CardDescription>Подайте заявку на подтверждение вашего уровня (кю/дан).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!athleteProfile && !loading && (
                        <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5"/>
                            <div>
                                <p className="font-bold">Профиль спортсмена не найден</p>
                                <p className="text-sm">Чтобы подать заявку, убедитесь, что тренер добавил вас в "Команду".</p>
                            </div>
                        </div>
                    )}
                    {athleteProfile?.attestationStatus === 'approved' && (
                         <div className="p-4 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-3">
                            <CheckCircle className="h-5 w-5"/>
                            <div>
                                <p className="font-bold">Ваш уровень подтвержден!</p>
                                <p className="text-sm">Текущий уровень: {athleteProfile.attestationLevel}</p>
                            </div>
                        </div>
                    )}
                     {athleteProfile?.attestationStatus === 'pending' && (
                         <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center gap-3">
                            <FileClock className="h-5 w-5"/>
                            <div>
                                <p className="font-bold">Заявка на рассмотрении</p>
                                <p className="text-sm">Запрошенный уровень: {athleteProfile.attestationRequestLevel}</p>
                            </div>
                        </div>
                    )}

                    {athleteProfile && athleteProfile.attestationStatus !== 'pending' && athleteProfile.attestationStatus !== 'approved' && (
                        <>
                         <div className="grid gap-2">
                            <Label htmlFor="attestation-level">Выберите ваш текущий уровень</Label>
                            <Select onValueChange={(v) => setSelectedLevel(v as AttestationLevel)} value={selectedLevel} disabled={isSubmitting}>
                                <SelectTrigger id="attestation-level">
                                    <SelectValue placeholder="Выберите кю/дан" />
                                </SelectTrigger>
                                <SelectContent>
                                    {attestationLevels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Сертификат</Label>
                            {certificatePreview ? (
                                <div className="relative">
                                    <Image src={certificatePreview} alt="Превью сертификата" width={300} height={200} className="rounded-md border"/>
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setCertificateFile(null); setCertificatePreview(null); }}>
                                        <XCircle className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={handleCertificateButtonClick} disabled={isSubmitting}>
                                    <Upload className="mr-2"/> Загрузить файл
                                </Button>
                            )}
                            <input
                                type="file"
                                ref={certificateInputRef}
                                onChange={(e) => handleFileChange(e, 'certificate')}
                                className="hidden"
                                accept="image/png, image/jpeg"
                            />
                        </div>
                        </>
                    )}

                </CardContent>
                {athleteProfile && athleteProfile?.attestationStatus !== 'pending' && athleteProfile?.attestationStatus !== 'approved' && (
                    <CardFooter>
                        <Button className="w-full" onClick={handleAttestationSubmit} disabled={!selectedLevel || !certificatePreview || isSubmitting}>
                             {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                             Отправить на проверку
                        </Button>
                    </CardFooter>
                )}
            </Card>
        )}


        <Card>
          <CardHeader>
            <CardTitle>Опасная зона</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены, что хотите выйти?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие завершит вашу текущую сессию на этом устройстве. Вы сможете снова войти в систему, используя свой пароль.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={logout}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Да, выйти
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        </div>
        
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
