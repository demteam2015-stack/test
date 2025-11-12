'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function SchedulePage() {

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <CalendarIcon className="size-8 text-primary"/>
                Расписание
            </h1>
            <p className="text-muted-foreground">
                Просмотр и управление вашим расписанием.
            </p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Расписание тренировок</CardTitle>
          <CardDescription>
            Этот раздел находится в разработке.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">Скоро здесь появится ваше расписание.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
