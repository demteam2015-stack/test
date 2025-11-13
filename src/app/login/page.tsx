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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createResetRequest } from "@/lib/reset-api";


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { login, checkUserExists } = useAuth();
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

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsForgotPasswordLoading(true);

      const userExists = checkUserExists({email: forgotPasswordEmail, username: forgotPasswordUsername});
      if (!userExists) {
           toast({
              variant: "destructive",
              title: "Пользователь не найден",
              description: `Аккаунт с указанными данными не существует.`,
          });
          setIsForgotPasswordLoading(false);
          return;
      }
      
      await createResetRequest(forgotPasswordEmail, forgotPasswordUsername);
      
      setIsForgotPasswordLoading(false);
      setIsModalOpen(false);
      setForgotPasswordEmail('');
      setForgotPasswordUsername('');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
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
                    <DialogContent className="sm:max-w-md">
                         <form onSubmit={handleForgotPasswordSubmit}>
                            <DialogHeader>
                                <DialogTitle>Запрос на сброс пароля</DialogTitle>
                                <DialogDescription>
                                    Введите email и имя пользователя. Ваш запрос будет отправлен администратору на рассмотрение.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="forgot-password-email">
                                        Email
                                    </Label>
                                    <Input
                                        id="forgot-password-email"
                                        type="email"
                                        placeholder="Ваш email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        required
                                        disabled={isForgotPasswordLoading}
                                    />
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="forgot-password-username">
                                        Имя пользователя (логин)
                                    </Label>
                                    <Input
                                        id="forgot-password-username"
                                        type="text"
                                        placeholder="Ваш логин"
                                        value={forgotPasswordUsername}
                                        onChange={(e) => setForgotPasswordUsername(e.target.value)}
                                        required
                                        disabled={isForgotPasswordLoading}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isForgotPasswordLoading} className="w-full">
                                    {isForgotPasswordLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                    Отправить запрос администратору
                                </Button>
                            </DialogFooter>
                         </form>
                    </DialogContent>
                 </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    disabled={isLoading}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
