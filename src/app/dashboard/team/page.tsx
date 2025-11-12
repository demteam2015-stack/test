'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Users, PlusCircle, Trash2, Edit, Loader, CalendarIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAthletes, addAthlete, updateAthlete, deleteAthlete, type Athlete } from '@/lib/athletes-api';
import { useAuth } from '@/context/auth-context';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';


const AthleteForm = ({ onAthleteAdded, onAthleteUpdated, athleteToEdit, children }: { onAthleteAdded: () => void, onAthleteUpdated: () => void, athleteToEdit: Athlete | null, children: React.ReactNode }) => {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();

    const isEditMode = !!athleteToEdit;

    useEffect(() => {
        if (isEditMode && athleteToEdit && isModalOpen) {
            setFirstName(athleteToEdit.firstName);
            setLastName(athleteToEdit.lastName);
            setMiddleName(athleteToEdit.middleName || '');
            setDateOfBirth(athleteToEdit.dateOfBirth ? new Date(athleteToEdit.dateOfBirth) : undefined);
        }
    }, [athleteToEdit, isEditMode, isModalOpen]);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setMiddleName('');
        setDateOfBirth(undefined);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !dateOfBirth) {
            toast({ variant: 'destructive', title: 'Ошибка', description: 'Пожалуйста, заполните все обязательные поля.' });
            return;
        }

        setIsSaving(true);
        const athleteData: Omit<Athlete, 'id'> = {
            firstName,
            lastName,
            middleName,
            dateOfBirth: dateOfBirth.toISOString(),
        };

        if(isEditMode && athleteToEdit) {
            await updateAthlete(athleteToEdit.id, athleteData);
            toast({ title: "Данные спортсмена обновлены" });
            onAthleteUpdated();
        } else {
            await addAthlete(athleteData);
            toast({ title: "Спортсмен добавлен", description: `${lastName} ${firstName} добавлен в команду.` });
            onAthleteAdded();
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
                        <DialogTitle>{isEditMode ? 'Редактировать профиль' : 'Новый спортсмен'}</DialogTitle>
                        <DialogDescription>
                           {isEditMode ? 'Измените данные и сохраните.' : 'Заполните данные о новом спортсмене.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Фамилия</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isSaving} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">Имя</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSaving} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="middleName">Отчество (необязательно)</Label>
                            <Input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} disabled={isSaving} />
                        </div>
                         <div className="grid gap-2">
                            <Label>Дата рождения</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateOfBirth && "text-muted-foreground"
                                    )}
                                    disabled={isSaving}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateOfBirth ? format(dateOfBirth, 'PPP', { locale: ru}) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={dateOfBirth}
                                    onSelect={setDateOfBirth}
                                    initialFocus
                                    locale={ru}
                                    captionLayout="dropdown-buttons"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Отмена</Button></DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Сохранить' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function TeamPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null);

    const canManage = user?.role === 'admin' || user?.role === 'coach';

    const fetchAthletes = useCallback(async () => {
        setIsLoading(true);
        const data = await getAthletes();
        setAthletes(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAthletes();
    }, [fetchAthletes]);

    const handleDelete = async (athlete: Athlete) => {
        await deleteAthlete(athlete.id);
        toast({ title: "Спортсмен удален", description: `${athlete.lastName} ${athlete.firstName} удален из команды.` });
        fetchAthletes();
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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                        <Users className="size-8 text-primary"/>
                        Состав команды
                    </h1>
                    <p className="text-muted-foreground">
                        {canManage ? 'Управляйте списком спортсменов вашей команды.' : 'Просмотр состава команды.'}
                    </p>
                </div>
                 {canManage && (
                    <AthleteForm onAthleteAdded={fetchAthletes} onAthleteUpdated={fetchAthletes} athleteToEdit={null}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить спортсмена
                        </Button>
                    </AthleteForm>
                 )}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Список спортсменов</CardTitle>
                    <CardDescription>Всего в команде: {athletes.length}</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                     ) : athletes.length > 0 ? (
                        <div className="space-y-4">
                        {athletes.map(athlete => (
                          <div key={athlete.id} className="relative group flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
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
                            
                            {canManage && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AthleteForm onAthleteAdded={fetchAthletes} onAthleteUpdated={fetchAthletes} athleteToEdit={athlete}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </AthleteForm>
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
                                                    Это действие необратимо. Спортсмен будет удален из команды.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(athlete)} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                          </div>
                        ))}
                      </div>
                     ) : (
                        <div className="flex flex-col h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">В команде пока нет спортсменов.</p>
                             {canManage && (
                                <AthleteForm onAthleteAdded={fetchAthletes} onAthleteUpdated={fetchAthletes} athleteToEdit={null}>
                                    <Button className="mt-4">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Добавить первого спортсмена
                                    </Button>
                                </AthleteForm>
                             )}
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}