'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { BookUser, Calendar as CalendarIcon, Check, Loader, User, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/auth-context';
import type { TrainingEvent } from '@/lib/schedule-api';
import { getEventsForDay } from '@/lib/schedule-api';
import { teamMembersData, type Athlete } from '@/lib/data';
import { saveAttendance, getAttendanceForDay, type AttendanceStatus } from '@/lib/journal-api';
import { format, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type AttendanceState = {
  [eventId: string]: {
    [athleteId: string]: AttendanceStatus;
  };
};

function AttendanceForm({ event, athletes, initialData, onSave }: { event: TrainingEvent; athletes: Athlete[]; initialData: { [athleteId: string]: AttendanceStatus }; onSave: (records: { athleteId: string; status: AttendanceStatus }[]) => void }) {
  const [attendance, setAttendance] = useState(initialData);

  const handleStatusChange = (athleteId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [athleteId]: status }));
  };

  const handleSave = () => {
    const records = Object.entries(attendance).map(([athleteId, status]) => ({ athleteId, status }));
    onSave(records);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${lastName[0]}${firstName[0]}`;
  }
  
  const formatDateOfBirth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <CardDescription>{event.startTime} - {event.endTime} at {event.location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {athletes.map(athlete => (
          <div key={athlete.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
            <div className='flex items-center gap-3'>
              <Avatar>
                  <AvatarImage src={athlete.photoURL} alt={`${athlete.lastName} ${athlete.firstName}`}/>
                  <AvatarFallback>{getInitials(athlete.firstName, athlete.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{`${athlete.lastName} ${athlete.firstName} ${athlete.middleName}`}</p>
                <p className="text-sm text-muted-foreground">{formatDateOfBirth(athlete.dateOfBirth)}</p>
              </div>
            </div>
            <RadioGroup
              defaultValue={attendance[athlete.id] || 'present'}
              onValueChange={(value) => handleStatusChange(athlete.id, value as AttendanceStatus)}
              className="flex gap-2 sm:gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="present" id={`present-${event.id}-${athlete.id}`} className="text-green-500 border-green-500"/>
                <Label htmlFor={`present-${event.id}-${athlete.id}`} className="cursor-pointer">Присутствовал</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absent" id={`absent-${event.id}-${athlete.id}`} className="text-red-500 border-red-500" />
                <Label htmlFor={`absent-${event.id}-${athlete.id}`} className="cursor-pointer">Отсутствовал</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excused" id={`excused-${event.id}-${athlete.id}`} className="text-yellow-500 border-yellow-500"/>
                <Label htmlFor={`excused-${event.id}-${athlete.id}`} className="cursor-pointer">Уваж. причина</Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Сохранить журнал</Button>
      </CardFooter>
    </Card>
  );
}


export default function JournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceState>({});
  const [isLoading, setIsLoading] = useState(true);

  const canManage = user?.role === 'admin' || user?.role === 'coach';

  const isoDate = useMemo(() => startOfDay(selectedDate).toISOString(), [selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const dailyEvents = getEventsForDay(selectedDate).filter(e => e.type === 'training');
      const savedAttendance = await getAttendanceForDay(isoDate);

      setEvents(dailyEvents);

      const initialAttendance: AttendanceState = {};
      dailyEvents.forEach(event => {
        initialAttendance[event.id] = {};
        teamMembersData.forEach(athlete => {
          initialAttendance[event.id][athlete.id] = savedAttendance?.[event.id]?.[athlete.id] || 'present';
        });
      });
      
      setAttendanceData(initialAttendance);
      setIsLoading(false);
    };

    fetchData();
  }, [selectedDate, isoDate]);

  const handleSaveAttendance = async (eventId: string, records: { athleteId: string; status: AttendanceStatus }[]) => {
    await saveAttendance(isoDate, eventId, records);
    toast({
      title: "Журнал обновлен",
      description: "Данные о посещаемости успешно сохранены.",
    });
    // Optimistically update state
    setAttendanceData(prev => ({
        ...prev,
        [eventId]: records.reduce((acc, rec) => ({...acc, [rec.athleteId]: rec.status}), {})
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <BookUser className="size-8 text-primary"/>
            Журнал посещаемости
        </h1>
        <p className="text-muted-foreground">
          {canManage ? 'Отмечайте присутствие спортсменов на тренировках.' : 'Просмотр посещаемости.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => setSelectedDate(day || new Date())}
                className="rounded-md border"
                locale={ru}
                disabled={isLoading}
             />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">
                Тренировки на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </h2>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : events.length > 0 ? (
                events.map(event => (
                    <AttendanceForm 
                        key={event.id}
                        event={event}
                        athletes={teamMembersData}
                        initialData={attendanceData[event.id] || {}}
                        onSave={(records) => handleSaveAttendance(event.id, records)}
                    />
                ))
            ) : (
                <div className="flex flex-col h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">На выбранный день тренировок не запланировано.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
