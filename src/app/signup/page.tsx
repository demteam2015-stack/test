'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader, CalendarIcon, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";


export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleNameChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[а-яА-ЯёЁ]*$/.test(value)) {
        setter(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!dateOfBirth) {
        toast({
            variant: "destructive",
            title: "Ошибка регистрации",
            description: "Пожалуйста, укажите дату рождения.",
        });
        setIsLoading(false);
        return;
    }

    try {
      await signup({ firstName, lastName, username, email, password, dateOfBirth: dateOfBirth.toISOString() });
      toast({
        title: "Регистрация прошла успешно",
        description: "Теперь вы можете войти в систему.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: error.message || "Не удалось создать аккаунт.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте свой аккаунт, чтобы начать.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Имя</Label>
                <Input id="first-name" placeholder="Иван" required value={firstName} onChange={handleNameChange(setFirstName)} disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Фамилия</Label>
                <Input id="last-name" placeholder="Иванов" required value={lastName} onChange={handleNameChange(setLastName)} disabled={isLoading} />
              </div>
            </div>
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
            <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="username">Имя пользователя (логин)</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="ivan_ivanov"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Дата рождения</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateOfBirth && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, 'PPP', { locale: ru}) : <span>Выберите дату</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            initialFocus
                            locale={ru}
                            captionLayout="dropdown-buttons"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
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
              Создать аккаунт
            </Button>
          </CardContent>
        </form>
        <div className="mt-4 text-center text-sm p-6 pt-0">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="underline">
            Войти
          </Link>
        </div>
      </Card>
    </div>
  );
}
