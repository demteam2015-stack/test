'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-muted/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-400 to-primary">
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
                 <div className="absolute w-72 h-72 bg-green-400/20 rounded-full filter blur-3xl animate-blob animation-delay-2000 top-10 left-20"></div>
                 <div className="absolute w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl animate-blob animation-delay-4000 bottom-10 right-20"></div>
                 <Logo className="w-48 h-48 text-primary drop-shadow-[0_0px_15px_hsl(var(--primary))]"/>
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