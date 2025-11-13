'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { getAthletes, updateAthlete, type Athlete } from '@/lib/athletes-api';
import { Loader, ShieldCheck, User, Check, X, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

export default function AttestationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canManage = user?.role === 'admin' || user?.role === 'coach';

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const allAthletes = await getAthletes();
    setAthletes(allAthletes.filter(a => a.attestationStatus === 'pending'));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (canManage) {
      fetchRequests();
    } else {
        setIsLoading(false);
    }
  }, [canManage, fetchRequests]);

  const handleApprove = async (athlete: Athlete) => {
    if (!athlete.attestationRequestLevel) return;
    await updateAthlete(athlete.id, {
        attestationLevel: athlete.attestationRequestLevel,
        attestationStatus: 'approved',
        attestationRequestLevel: undefined,
        attestationRequestDate: undefined,
    });
    toast({ title: "Заявка одобрена", description: `Уровень ${athlete.attestationRequestLevel} подтвержден для ${athlete.lastName} ${athlete.firstName}.`});
    fetchRequests();
  };

  const handleReject = async (athlete: Athlete) => {
    await updateAthlete(athlete.id, {
        attestationStatus: 'rejected',
    });
    toast({ title: "Заявка отклонена", variant: "destructive"});
    fetchRequests();
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!canManage) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="size-8 text-primary"/>
                    Аттестация
                </h1>
                <p className="text-muted-foreground">
                    У вас нет прав для просмотра этой страницы.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="size-8 text-primary" />
          Аттестация
        </h1>
        <p className="text-muted-foreground">
          Просмотр и управление заявками на подтверждение уровня спортсменов.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заявки на рассмотрении</CardTitle>
          <CardDescription>
            Всего заявок: {athletes.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Спортсмен</TableHead>
                <TableHead>Запрошенный уровень</TableHead>
                <TableHead>Дата заявки</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athletes.length > 0 ? (
                athletes.map(athlete => (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">{`${athlete.lastName} ${athlete.firstName}`}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{athlete.attestationRequestLevel}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(athlete.attestationRequestDate)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {athlete.attestationCertificateUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Сертификат
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Сертификат: {athlete.lastName} {athlete.firstName}</DialogTitle>
                                <DialogDescription>
                                    Запрошенный уровень: {athlete.attestationRequestLevel}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="relative mt-4 max-h-[70vh] overflow-auto">
                                <Image src={athlete.attestationCertificateUrl} alt="Сертификат" width={800} height={600} style={{width: '100%', height: 'auto'}} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleApprove(athlete)} className="text-green-500 hover:text-green-600">
                          <Check />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleReject(athlete)} className="text-red-500 hover:text-red-600">
                          <X />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <User className="h-10 w-10 text-muted-foreground"/>
                        <p>Нет заявок на рассмотрении.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
