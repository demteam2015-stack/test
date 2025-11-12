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
import { Calendar as CalendarIcon, PlusCircle, Clock, MapPin, Trash2, Edit, Dumbbell, Trophy, Users, AlertTriangle, Briefcase, Sun } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/auth-context';
import type { TrainingEvent } from '@/lib/schedule-api';
import { getAllEvents, createEvent, deleteEvent, updateEvent, clearAllEvents } from '@/lib/schedule-api';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { startOfDay } from 'date-fns';

const BulkEventForm = ({ selectedDates, onEventsCreated }: { selectedDates: Date[], onEventsCreated: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventType, setEventType] = useState<TrainingEvent['type']>('training');

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('20:00');
    const [location, setLocation] = useState('Стадион "Олимпийский"');
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        // Defaults are set based on eventType inside handleOpenChange
    };
    
    useEffect(() => {
        switch(eventType) {
            case 'training':
                setTitle('Тренировка');
                setLocation('Стадион "Олимпийский"');
                setStartTime('18:00');
                setEndTime('20:00');
                break;
            case 'competition':
                setTitle('Соревнование');
                setLocation('Городской стадион');
                setStartTime('09:00');
                setEndTime('17:00');
                break;
            case 'meeting':
                setTitle('Собрание');
                setLocation('Конференц-зал');
                setStartTime('19:00');
                setEndTime('20:00');
                break;
            case 'holiday':
                 setTitle('Каникулы / Выходной');
                 setLocation('');
                 setStartTime('');
                 setEndTime('');
                 break;
        }
    }, [eventType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title || selectedDates.length === 0) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните название и выберите хотя бы одну дату.' });
            return;
        }
        if (eventType !== 'holiday' && (!startTime || !endTime || !location)) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
            return;
        }


        setIsSaving(true);
        
        const eventPromises = selectedDates.map(date => {
            const eventData: Omit<TrainingEvent, 'id'> = {
                title,
                date: date.toISOString(),
                startTime,
                endTime,
                location,
                notes,
                createdBy: user.username,
                type: eventType,
            };
            return createEvent(eventData);
        });

        await Promise.all(eventPromises);
        
        toast({ title: "События созданы", description: `Добавлено ${selectedDates.length} событий в расписание.` });

        setIsSaving(false);
        setIsModalOpen(false);
        onEventsCreated();
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            resetForm();
        }
    }

    const openModalWithType = (type: TrainingEvent['type']) => {
        setEventType(type);
        setIsModalOpen(true);
    }
    
    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={selectedDates.length === 0}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить расписание ({selectedDates.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openModalWithType('training')}>
                        <Dumbbell className="mr-2 h-4 w-4" />
                        Тренировка
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModalWithType('competition')}>
                        <Trophy className="mr-2 h-4 w-4" />
                        Соревнование
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModalWithType('meeting')}>
                        <Users className="mr-2 h-4 w-4" />
                        Собрание
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => openModalWithType('holiday')}>
                        <Sun className="mr-2 h-4 w-4" />
                        Каникулы/Выходной
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Новое расписание: {
                            {
                                'training': 'Тренировка',
                                'competition': 'Соревнование',
                                'meeting': 'Собрание',
                                'holiday': 'Каникулы/Выходной'
                            }[eventType]
                        }</DialogTitle>
                        <DialogDescription>
                           Заполните детали. События будут созданы для всех {selectedDates.length} выбранных дат.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Название</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSaving} />
                        </div>
                        {eventType !== 'holiday' && (
                            <>
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
                            </>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Заметки</Label>
                            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSaving} placeholder="Дополнительная информация (необязательно)"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving || selectedDates.length === 0}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Создать
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


const EventForm = ({ onEventCreated, eventToEdit, onEventUpdated, children }: { onEventCreated: (event: TrainingEvent) => void, eventToEdit: TrainingEvent | null, onEventUpdated: (event: TrainingEvent) => void, children: React.ReactNode }) => {
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
    const [eventType, setEventType] = useState<TrainingEvent['type']>('training');
    
    const isEditMode = !!eventToEdit;

    useEffect(() => {
        if (isEditMode && eventToEdit && isModalOpen) {
            setTitle(eventToEdit.title);
            setDate(new Date(eventToEdit.date));
            setStartTime(eventToEdit.startTime);
            setEndTime(eventToEdit.endTime);
            setLocation(eventToEdit.location);
            setNotes(eventToEdit.notes || '');
            setEventType(eventToEdit.type)
        }
    }, [eventToEdit, isEditMode, isModalOpen]);

    const resetForm = () => {
        setTitle('');
        setDate(undefined);
        setStartTime('');
        setEndTime('');
        setLocation('');
        setNotes('');
        setEventType('training');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || !title) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
            return;
        }
        if (eventType !== 'holiday' && (!startTime || !endTime || !location)) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
            return;
        }


        setIsSaving(true);
        const eventData: Omit<TrainingEvent, 'id'> = {
            title,
            date: date.toISOString(),
            startTime,
            endTime,
            location,
            notes,
            createdBy: user.username,
            type: eventType,
        };

        if(isEditMode && eventToEdit) {
            const updatedEvent = await updateEvent(eventToEdit.id, eventData);
            if(updatedEvent) {
                onEventUpdated(updatedEvent);
                toast({ title: "Событие обновлено", description: "Данные события успешно изменены." });
            }
        } else {
            const newEvent = await createEvent(eventData);
            onEventCreated(newEvent);
            toast({ title: "Событие создано", description: `Событие "${newEvent.title}" было добавлено в расписание.` });
        }

        setIsSaving(false);
        setIsModalOpen(false);
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            resetForm();
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Редактировать событие' : 'Новое событие'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? 'Измените детали и сохраните.' : 'Заполните данные о новом событии.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label>Тип события</Label>
                            {/* In edit mode, type cannot be changed for simplicity */}
                             <Input value={{
                                'training': 'Тренировка',
                                'competition': 'Соревнование',
                                'meeting': 'Собрание',
                                'holiday': 'Каникулы/Выходной'
                            }[eventType]} disabled />
                        </div>
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
                        {eventType !== 'holiday' && (
                            <>
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
                            </>
                        )}
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
  const { toast } = useToast();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
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
    const dayStart = startOfDay(viewDate);
    return allEvents
        .filter(event => startOfDay(new Date(event.date)).getTime() === dayStart.getTime())
        .sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [viewDate, allEvents]);
  
  const eventDays = useMemo(() => {
      return allEvents.map(e => new Date(e.date));
  }, [allEvents]);

  const handleEventsChange = () => {
      fetchEvents();
      setSelectedDates([]);
  }
  
  const handleDelete = async (eventId: string) => {
      await deleteEvent(eventId);
      fetchEvents();
      toast({ title: "Событие удалено" });
  }

  const handleClearAll = async () => {
      await clearAllEvents();
      fetchEvents();
      toast({ title: "Расписание очищено", description: "Все события были удалены." });
  }

  const EventIcon = ({ type }: { type: TrainingEvent['type'] }) => {
    switch (type) {
      case 'training':
        return <Dumbbell className="h-5 w-5 text-muted-foreground" />;
      case 'competition':
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
      case 'meeting':
        return <Users className="h-5 w-5 text-muted-foreground" />;
      case 'holiday':
        return <Sun className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Briefcase className="h-5 w-5 text-muted-foreground" />;
    }
  };

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
                    {canManage ? 'Выберите дни в календаре и добавьте расписание.' : 'Просматривайте расписание команды.'}
                </p>
            </div>
            {canManage && (
                <div className="flex flex-col sm:flex-row gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={allEvents.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Очистить все
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены, что хотите очистить все расписание?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Это действие необратимо. Все созданные события будут удалены навсегда.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">Да, удалить все</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <BulkEventForm selectedDates={selectedDates || []} onEventsCreated={handleEventsChange}/>
                </div>
            )}
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
             <Calendar
                mode={canManage ? "multiple" : "single"}
                min={1}
                selected={canManage ? selectedDates : viewDate}
                onSelect={canManage ? setSelectedDates : (day) => setViewDate(day || new Date())}
                onDayClick={(day) => setViewDate(day)}
                className="rounded-md border"
                modifiers={{
                    events: eventDays,
                }}
                modifiersClassNames={{
                    events: 'bg-primary/20 text-primary-foreground font-bold',
                }}
                locale={ru}
             />
        </div>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>
                    События на {format(viewDate, 'd MMMM yyyy', { locale: ru })}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto">
                {dailyEvents.length > 0 ? (
                    <div className="space-y-4">
                        {dailyEvents.map(event => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <EventIcon type={event.type} />
                                            <CardTitle className="text-lg">{event.title}</CardTitle>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center gap-1">
                                                <EventForm 
                                                    onEventCreated={handleEventsChange} 
                                                    eventToEdit={event} 
                                                    onEventUpdated={handleEventsChange}
                                                >
                                                     <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </EventForm>
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
                                                            Это действие необратимо. Событие будет удалено из расписания навсегда.
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
                                { (event.type !== 'holiday' || event.notes) &&
                                <CardContent>
                                    {event.type !== 'holiday' && (
                                    <>
                                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>{event.startTime} - {event.endTime}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </>
                                    )}
                                    {event.notes && (
                                        <p className="text-sm bg-muted/50 p-3 rounded-md mt-4">{event.notes}</p>
                                    )}
                                </CardContent>
                                }
                                <CardFooter>
                                     <p className="text-xs text-muted-foreground">Добавил: {event.createdBy}</p>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <p className="text-muted-foreground">На выбранный день событий нет.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
