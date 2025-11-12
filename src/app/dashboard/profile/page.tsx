'use client';

import { useUserProfile } from '@/firebase';
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
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, type FormEvent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, User } from 'lucide-react';
import type { UserProfile } from '@/firebase/auth/use-user-profile';


const ProfileSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-60" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-36" />
    </CardFooter>
  </Card>
);


export default function ProfilePage() {
  const { data: userProfile, isLoading, error } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Use a more specific type for formData
  const [formData, setFormData] = useState<Pick<UserProfile, 'firstName' | 'lastName'>>({
    firstName: '',
    lastName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile || !firestore) return;

    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', userProfile.id);

    // Only include fields that are meant to be updated
    const updatedData: Partial<UserProfile> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    setDocumentNonBlocking(userDocRef, updatedData, { merge: true });

    // Optimistic UI update: show toast immediately and reset state.
    // The non-blocking call will eventually sync with Firestore.
    // In case of an error, the global error handler will catch it.
    setTimeout(() => {
        toast({
            title: 'Профиль обновлен',
            description: 'Ваши данные были успешно сохранены.',
        });
        setIsSaving(false);
    }, 500); // Small delay to give a feeling of processing
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

       {isLoading && (
         <ProfileSkeleton />
       )}

       {error && (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle>Ошибка</CardTitle>
                <CardDescription className="text-destructive">
                    Не удалось загрузить ваш профиль. Пожалуйста, попробуйте обновить страницу.
                    <br />
                    <code className="text-xs">{error.message}</code>
                </CardDescription>
            </CardHeader>
        </Card>
       )}

      {!isLoading && !error && userProfile && (
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
                  value={userProfile.email || ''}
                  disabled
                  aria-readonly
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Input
                  value={roleTranslations[userProfile.role] || userProfile.role}
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
      )}
    </div>
  );
}
