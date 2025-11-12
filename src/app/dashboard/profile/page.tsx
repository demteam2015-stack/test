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
import { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Loader, User, Award, Trophy } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { competitionsData } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);
  
  const achievements = useMemo(() => {
      if (!user) return [];
      // This is a simplified logic. In a real app, you'd check against a user's specific participation records.
      // Here, we just assume the user participated in all completed competitions.
      return competitionsData.filter(c => c.status === 'Завершенный');
  }, [user]);

  if (!user) {
      return null; // Or a loading spinner
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
            Мой профиль
        </h1>
        <p className="text-muted-foreground">
          Просмотр и управление вашими личными данными и достижениями.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleSave} className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                Эта информация будет видна другим участникам команды.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                <Label htmlFor="email">Email (для входа)</Label>
                <Input
                    id="email"
                    name="email"
                    value={user.email || ''}
                    disabled
                    aria-readonly
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя (логин)</Label>
                <Input
                    id="username"
                    name="username"
                    value={user.username || ''}
                    disabled
                    aria-readonly
                />
                </div>
                <div className="space-y-2">
                <Label>Роль</Label>
                <Input
                    value={roleTranslations[user.role] || user.role}
                    disabled
                    aria-readonly
                />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить изменения
                </Button>
            </CardFooter>
            </Card>
        </form>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="text-yellow-500" />
                    Мои достижения
                </CardTitle>
                <CardDescription>
                    Ваши награды за участие в соревнованиях.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {achievements.length > 0 ? (
                    achievements.map(comp => (
                        <div key={comp.id} className="flex items-start gap-4 p-3 rounded-md border bg-muted/30">
                            <Trophy className="h-8 w-8 mt-1 text-yellow-500" />
                            <div>
                                <p className="font-semibold">{comp.name}</p>
                                <p className="text-sm text-muted-foreground">{comp.result ? `Результат: ${comp.result}`: 'Участие'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <p className="text-muted-foreground">У вас пока нет достижений.</p>
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
