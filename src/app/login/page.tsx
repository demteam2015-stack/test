'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Вход выполнен успешно",
        description: "Добро пожаловать!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: error.message || "Неверный email или пароль.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: FormEvent) => {
      e.preventDefault();
      setIsForgotPasswordLoading(true);
      // Имитируем сетевую задержку
      setTimeout(() => {
          setIsForgotPasswordLoading(false);
          setIsModalOpen(false);
          toast({
              title: "Инструкции отправлены",
              description: `Если аккаунт с email ${forgotPasswordEmail} существует, на него будет отправлено письмо.`,
          });
          setForgotPasswordEmail('');
      }, 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Вход</CardTitle>
          <CardDescription>
            Введите свои данные для входа в аккаунт.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Пароль</Label>
                 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                         <button
                            type="button"
                            className="ml-auto inline-block text-sm underline"
                         >
                            Забыли пароль?
                         </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                         <form onSubmit={handleForgotPasswordSubmit}>
                            <DialogHeader>
                                <DialogTitle>Восстановить пароль</DialogTitle>
                                <DialogDescription>
                                    Введите ваш email, и мы отправим вам инструкции по восстановлению пароля.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="forgot-password-email" className="text-right">
                                        Email
                                    </Label>
                                    <Input
                                        id="forgot-password-email"
                                        type="email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        className="col-span-3"
                                        required
                                        disabled={isForgotPasswordLoading}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isForgotPasswordLoading}>
                                    {isForgotPasswordLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                    Отправить инструкции
                                </Button>
                            </DialogFooter>
                         </form>
                    </DialogContent>
                 </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </CardContent>
        </form>
        <div className="mt-4 text-center text-sm p-6 pt-0">
          Нет аккаунта?{" "}
          <Link href="/signup" className="underline">
            Зарегистрироваться
          </Link>
        </div>
      </Card>
    </div>
  );
}
