'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { ArrowRight, CalendarDays, BarChart, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="sr-only">Центр команды Демьяненко</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login">Войти</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Регистрация</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
           <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] [background-size:16px_16px]"></div>
           <div className="absolute inset-x-0 top-0 h-64 -z-10 bg-gradient-to-b from-background to-transparent"></div>
           <div className="absolute inset-x-0 bottom-0 h-64 -z-10 bg-gradient-to-t from-background to-transparent"></div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                    Достигайте вершин вместе
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Единая платформа для спортсменов, тренеров и родителей. Управляйте расписанием, отслеживайте прогресс и будьте на связи с командой.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Присоединиться к команде
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
               <div className="hidden lg:flex items-center justify-center relative">
                 <div className="absolute w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
                 <div className="absolute w-72 h-72 bg-violet-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 top-10 left-20"></div>
                 <div className="absolute w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 bottom-10 right-20"></div>
                 <Logo className="w-48 h-48 text-primary drop-shadow-[0_0px_25px_hsl(var(--primary)/0.5)]"/>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Ключевые возможности</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Все, что нужно для побед</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Наша платформа предоставляет полный набор инструментов для организации тренировочного процесса и анализа результатов.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <CalendarDays className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Управление расписанием</h3>
                <p className="text-muted-foreground">
                  Создавайте и просматривайте актуальный календарь тренировок, соревнований и других событий команды.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <BarChart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Анализ прогресса</h3>
                <p className="text-muted-foreground">
                  Отслеживайте посещаемость, финансовый баланс и результаты соревнований в удобных отчетах.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Центр общения</h3>
                <p className="text-muted-foreground">
                  Получайте персональные рекомендации и ответы на ваши вопросы от тренера и AI-помощника.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Центр команды Демьяненко. Все права защищены.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Условия использования
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Политика конфиденциальности
          </Link>
        </nav>
      </footer>
    </div>
  )
}
