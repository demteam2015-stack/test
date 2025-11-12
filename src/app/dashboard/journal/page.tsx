'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { BookUser, Loader, Users as UsersIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { getAthletes, type Athlete } from '@/lib/athletes-api';
import { saveAttendance, getAttendanceForDay, type AttendanceStatus } from '@/lib/journal-api';

const TRAINING_COST = 100; // Стоимость одной тренировки для списания

export default function JournalPage() {
  const { user, deductFromBalance } = useAuth();
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const journalDateKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const journalEventId = 'general_attendance';

  const [attendance, setAttendance] = useState<{[athleteId: string]: AttendanceStatus}>({});
  const [initialAttendance, setInitialAttendance] = useState<{[athleteId: string]: AttendanceStatus}>({});

  const canManage = user?.role === 'admin' || user?.role === 'coach';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const athletesData = await getAthletes();
    setAthletes(athletesData);
    
    if (athletesData.length > 0) {
      const savedAttendance = await getAttendanceForDay(journalDateKey);
      let currentAttendance: {[athleteId: string]: AttendanceStatus} = {};
      
      if (savedAttendance && savedAttendance[journalEventId]) {
        currentAttendance = savedAttendance[journalEventId];
      } else {
        athletesData.forEach(a => {
            currentAttendance[a.id] = 'present';
        });
      }
      setAttendance(currentAttendance);
      setInitialAttendance(JSON.parse(JSON.stringify(currentAttendance))); // Deep copy for comparison
    }
    
    setIsLoading(false);
  }, [journalDateKey]);

  useEffect(() => {
    if (canManage) {
        fetchData();
    }
  }, [canManage, fetchData]);

  const handleStatusChange = (athleteId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
        ...prev,
        [athleteId]: status
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    const records = Object.entries(attendance).map(([athleteId, status]) => ({
      athleteId,
      status
    }));

    await saveAttendance(journalDateKey, journalEventId, records);
    
    // --- Logic for balance deduction ---
    const deductionPromises: Promise<any>[] = [];
    for (const athleteId in attendance) {
      const newStatus = attendance[athleteId];
      const oldStatus = initialAttendance[athleteId];
      
      // Deduct if athlete was marked present, and they weren't present before
      if (newStatus === 'present' && oldStatus !== 'present') {
        const athlete = athletes.find(a => a.id === athleteId);
        if (athlete?.parentId) {
            deductionPromises.push(deductFromBalance(athlete.parentId, TRAINING_COST, `Списание за тренировку ${athlete.firstName} ${athlete.lastName}`));
        }
      }
    }
    
    await Promise.all(deductionPromises);

    setInitialAttendance(JSON.parse(JSON.stringify(attendance))); // Update initial state
    setIsSaving(false);
    toast({
        title: "Журнал сохранен",
        description: `Данные о посещаемости за ${journalDateKey} обновлены. Баланс родителей скорректирован.`
    });
  }
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${lastName[0] || ''}${firstName[0] || ''}`;
  }

  const formatDateOfBirth = (dateString: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  }

  if (!canManage) {
      return (
         <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <BookUser className="size-8 text-primary"/>
                    Журнал посещаемости
                </h1>
                <p className="text-muted-foreground">
                    У вас нет прав для просмотра этой страницы.
                </p>
            </div>
         </div>
      );
  }
  
  if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  if (athletes.length === 0) {
      return (
         <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <BookUser className="size-8 text-primary"/>
                    Журнал посещаемости
                </h1>
                <p className="text-muted-foreground">
                    Отмечайте присутствие спортсменов на тренировках.
                </p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <UsersIcon className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Сначала заполните состав команды</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Перейдите в раздел "Команда", чтобы добавить спортсменов.</p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/team">
                                Перейти к команде
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <BookUser className="size-8 text-primary"/>
            Журнал посещаемости
        </h1>
        <p className="text-muted-foreground">
          Отметьте присутствующих спортсменов и сохраните данные.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Общая посещаемость</CardTitle>
            <CardDescription>Список всех спортсменов в команде.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {athletes.map(athlete => (
                 <div key={athlete.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors gap-4">
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={athlete.photoURL} alt={`${athlete.lastName} ${athlete.firstName}`}/>
                            <AvatarFallback>{getInitials(athlete.firstName, athlete.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="font-semibold">{`${athlete.lastName} ${athlete.firstName} ${athlete.middleName || ''}`.trim()}</p>
                        <p className="text-sm text-muted-foreground">
                            Дата рождения: {formatDateOfBirth(athlete.dateOfBirth)}
                        </p>
                        </div>
                    </div>
                    <RadioGroup 
                        value={attendance[athlete.id] || 'present'}
                        onValueChange={(value) => handleStatusChange(athlete.id, value as AttendanceStatus)}
                        className="flex gap-2 sm:gap-4"
                        disabled={isSaving}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id={`present-${athlete.id}`} />
                            <Label htmlFor={`present-${athlete.id}`}>Присутствовал</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id={`absent-${athlete.id}`} />
                            <Label htmlFor={`absent-${athlete.id}`}>Отсутствовал</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="excused" id={`excused-${athlete.id}`} />
                            <Label htmlFor={`excused-${athlete.id}`}>Уваж. причина</Label>
                        </div>
                    </RadioGroup>
                 </div>
            ))}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить журнал
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
