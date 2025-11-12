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
import { Calendar as CalendarIcon, PlusCircle, Clock, MapPin, Trash2, Edit } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/auth-context';
import type { TrainingEvent } from '@/lib/schedule-api';
import { getAllEvents, getEventsForDay, createEvent, deleteEvent, updateEvent } from '@/lib/schedule-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const EventForm = ({ onEventCreated, eventToEdit, onEventUpdated }: { onEventCreated: (event: TrainingEvent) => void, eventToEdit: TrainingEvent | null, onEventUpdated: (event: TrainingEvent) => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    
    const isEditMode = !!eventToEdit;

    useEffect(() => {
        if (isEditMode && eventToEdit) {
            setTitle(eventToEdit.title);
            setDate(new Date(eventToEdit.date));
            setStartTime(eventToEdit.startTime);
            setEndTime(eventToEdit.endTime);
            setLocation(eventToEdit.location);
            setNotes(eventToEdit.notes || '');
        }
    }, [eventToEdit, isEditMode]);

    const resetForm = () => {
        setTitle('');
        setDate(undefined);
        setStartTime('');
        setEndTime('');
        setLocation('');
        setNotes('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || !startTime || !endTime) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
            return;
        }

        setIsSaving(true);
        const eventData = {
            title,
            date: date.toISOString(),
            startTime,
            endTime,
            location,
            notes,
            createdBy: user.username,
        };

        if(isEditMode && eventToEdit) {
            const updatedEvent = await updateEvent(eventToEdit.id, eventData);
            if(updatedEvent) {
                onEventUpdated(updatedEvent);
            }
        } else {
            const newEvent = await createEvent(eventData);
            onEventCreated(newEvent);
        }

        setIsSaving(false);
        setIsModalOpen(false);
        resetForm();
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if(!open) {
            resetForm();
        }
    }
    
    const TriggerButton = isEditMode ? (
         <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
        </Button>
    ) : (
         <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить тренировку
        </Button>
    );

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Редактировать тренировку' : 'Новая тренировка'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? 'Измените детали и сохраните.' : 'Заполните детали новой тренировки.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Название</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSaving} />
                        </div>
                        <div className="grid gap-2">
                             <Label htmlFor="date">Дата</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                        disabled={isSaving}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, 'PPP', { locale: ru}) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        locale={ru}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start-time">Начало</Label>
                                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required disabled={isSaving} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-time">Окончание</Label>
                                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required disabled={isSaving} />
                            </div>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="location">Место</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required disabled={isSaving} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Заметки</Label>
                            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSaving} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allEvents, setAllEvents] = useState<TrainingEvent[]>([]);
  const [isClient, setIsClient] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'coach';

  const fetchEvents = () => {
    setAllEvents(getAllEvents());
  };

  useEffect(() => {
    setIsClient(true);
    fetchEvents();
  }, []);

  const dailyEvents = useMemo(() => {
    return getEventsForDay(selectedDate);
  }, [selectedDate, allEvents]);
  
  const eventDays = useMemo(() => {
      return allEvents.map(e => new Date(e.date));
  }, [allEvents]);

  const handleEventChange = (event: TrainingEvent) => {
      fetchEvents();
  }
  
  const handleDelete = async (eventId: string) => {
      await deleteEvent(eventId);
      fetchEvents();
  }

  if (!isClient) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <CalendarIcon className="size-8 text-primary"/>
                    Расписание
                </h1>
                <p className="text-muted-foreground">
                    Просмотр и управление вашим расписанием.
                </p>
            </div>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>
                        События на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </CardTitle>
                    {canManage && <EventForm onEventCreated={handleEventChange} eventToEdit={null} onEventUpdated={handleEventChange}/>}
                </div>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto">
                {dailyEvents.length > 0 ? (
                    <div className="space-y-4">
                        {dailyEvents.map(event => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{event.title}</CardTitle>
                                        {canManage && (
                                            <div className="flex items-center gap-1">
                                                <EventForm onEventCreated={handleEventChange} eventToEdit={event} onEventUpdated={handleEventChange} />
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Это действие необратимо. Тренировка будет удалена из расписания навсегда.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>{event.startTime} - {event.endTime}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                    {event.notes && (
                                        <p className="text-sm bg-muted/50 p-3 rounded-md mt-4">{event.notes}</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                     <p className="text-xs text-muted-foreground">Добавил: {event.createdBy}</p>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <p className="text-muted-foreground">На выбранный день тренировок нет.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        <div className="lg:col-span-1">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                    events: eventDays,
                }}
                modifiersClassNames={{
                    events: 'bg-primary/20 text-primary-foreground font-bold',
                }}
             />
        </div>
      </div>
    </div>
  );
}
