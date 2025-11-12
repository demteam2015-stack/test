'use client';

import { Button } from '@/components/ui/button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('athlete');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Non-blocking call
      initiateEmailSignUp(auth, email, password);

      // Listen for user creation
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          unsubscribe(); // Stop listening
          const userRef = doc(firestore, 'users', user.uid);
          const userData = {
            id: user.uid,
            email,
            firstName,
            lastName,
            role,
          };
          setDocumentNonBlocking(userRef, userData, { merge: true });
          
          if (role === 'athlete') {
            const athleteRef = doc(firestore, 'athletes', user.uid);
            const athleteData = {
              userId: user.uid,
              dateOfBirth: '', // You can add a field for this
            };
            setDocumentNonBlocking(athleteRef, athleteData, { merge: true });
          } else if (role === 'parent') {
            const parentRef = doc(firestore, 'parents', user.uid);
            const parentData = {
              userId: user.uid,
              athleteUserIds: [], // To be populated later
            };
            setDocumentNonBlocking(parentRef, parentData, { merge: true });
          }

          router.push('/dashboard');
        }
      });

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
    // setLoading(false) is handled by the redirect or error
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт, чтобы начать работу.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Имя</Label>
                <Input
                  id="first-name"
                  placeholder="Иван"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Фамилия</Label>
                <Input
                  id="last-name"
                  placeholder="Иванов"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Роль</Label>
              <RadioGroup
                defaultValue="athlete"
                className="flex gap-4"
                onValueChange={setRole}
                value={role}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="athlete" id="r1" />
                  <Label htmlFor="r1">Спортсмен</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent" id="r2" />
                  <Label htmlFor="r2">Родитель</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Создать аккаунт
            </Button>
            <div className="text-sm text-center">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="underline">
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
