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
import { BookUser, Loader, Users as UsersIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// Placeholder. This page will be reimplemented in the next step.

export default function JournalPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'coach';

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
