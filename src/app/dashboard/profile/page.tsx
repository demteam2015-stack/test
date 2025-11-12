'use client';

import { useUserProfile, UserProfile } from '@/firebase/auth/use-user-profile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, type FormEvent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';

export default function ProfilePage() {
  const { data: userProfile, isLoading, error } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', userProfile.id);

    const updatedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    setDocumentNonBlocking(userDocRef, updatedData, { merge: true });

    // We can't await the non-blocking call, so we optimistically show the toast
    // and reset the saving state after a short delay.
    setTimeout(() => {
        toast({
            title: 'Профиль обновлен',
            description: 'Ваши данные были успешно сохранены.',
        });
        setIsSaving(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div>Ошибка загрузки профиля: {error.message}</div>;
  }

  if (!userProfile) {
    return <div>Профиль не найден.</div>;
  }
  
  const roleTranslations: { [key: string]: string } = {
    athlete: 'Спортсмен',
    coach: 'Тренер',
    parent: 'Родитель',
    admin: 'Администратор',
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                disabled
              />
            </div>
             <div className="space-y-2">
              <Label>Роль</Label>
              <Input
                value={roleTranslations[userProfile.role]}
                disabled
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
