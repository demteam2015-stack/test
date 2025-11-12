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
import { useState, type FormEvent } from 'react';
import { Loader, User } from 'lucide-react';
import { userProfileData, type UserProfile } from '@/lib/data';


export default function ProfilePage() {
  const { toast } = useToast();

  const [formData, setFormData] = useState<Pick<UserProfile, 'firstName' | 'lastName'>>({
    firstName: userProfileData.firstName,
    lastName: userProfileData.lastName,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // In a real app, you would save this data.
    // Here, we just simulate a save.
    console.log("Saving data:", formData);

    setTimeout(() => {
        toast({
            title: 'Профиль обновлен',
            description: 'Ваши данные были успешно сохранены (симуляция).',
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
          Просмотр и управление вашими личными данными.
        </p>
      </div>

      <form onSubmit={handleSave}>
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
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userProfileData.email || ''}
                disabled
                aria-readonly
              />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Input
                value={roleTranslations[userProfileData.role] || userProfileData.role}
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
    </div>
  );
}
