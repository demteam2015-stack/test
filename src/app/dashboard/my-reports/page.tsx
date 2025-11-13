'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { BarChart, Loader, Users, TrendingUp, TrendingDown, Wallet, User as UserIcon } from 'lucide-react';
import { getFullJournal } from '@/lib/journal-api';
import { getAthletes, type Athlete } from '@/lib/athletes-api';
import { useAuth } from '@/context/auth-context';
import { AttendanceChart } from '@/components/attendance-chart';
import { getFullName } from '@/lib/utils';

type AttendanceReport = {
  athleteId: string;
  name: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
  attendancePercentage: number;
};

export default function MyReportsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [userAthleteProfile, setUserAthleteProfile] = useState<Athlete | null>(null);

  useEffect(() => {
    const generateReports = async () => {
        if (!user) return;
        setIsLoading(true);

        const journal = await getFullJournal();
        const athletes: Athlete[] = await getAthletes();
        
        if (user.role === 'parent') {
            const childProfile = athletes.find(a => a.parentId === user.email);
            setUserAthleteProfile(childProfile || null);
        }
        
        const attendanceMap = new Map<string, { present: number; absent: number; excused: number }>();

        athletes.forEach(athlete => {
            attendanceMap.set(athlete.id, { present: 0, absent: 0, excused: 0 });
        });

        Object.values(journal).forEach(day => {
            Object.values(day).forEach(event => {
                Object.entries(event).forEach(([athleteId, status]) => {
                    if (attendanceMap.has(athleteId)) {
                        const current = attendanceMap.get(athleteId)!;
                        if (status === 'present') current.present++;
                        if (status === 'absent') current.absent++;
                        if (status === 'excused') current.excused++;
                    }
                });
            });
        });

        const reportData: AttendanceReport[] = athletes.map(athlete => {
            const stats = attendanceMap.get(athlete.id)!;
            const totalTrainingsWithStatus = stats.present + stats.absent + stats.excused;
            const totalAttendance = stats.present + stats.absent;
            return {
                athleteId: athlete.id,
                name: getFullName(athlete.firstName, athlete.lastName),
                ...stats,
                total: totalTrainingsWithStatus,
                attendancePercentage: totalAttendance > 0 ? (stats.present / totalAttendance) * 100 : 0
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
        
        setAttendanceReport(reportData);
        setIsLoading(false);
    };

    generateReports();
  }, [user]);
  
  const userReport = useMemo(() => {
    if (!userAthleteProfile) return null;
    return attendanceReport.find(r => r.athleteId === userAthleteProfile.id);
  }, [userAthleteProfile, attendanceReport]);

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart className="size-8 text-primary"/>
            Отчеты
        </h1>
        <p className="text-muted-foreground">
          Статистика посещаемости вашего ребенка.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5"/>
              Посещаемость: {userAthleteProfile ? getFullName(userAthleteProfile.firstName, userAthleteProfile.lastName) : '...'}
          </CardTitle>
          <CardDescription>
            Персональная статистика посещений тренировок.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-2">
           {userReport ? (
            <>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Посещено</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                    {userReport.present}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Пропущено</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-500">
                                    {userReport.absent}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Уваж. причина</CardTitle>
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-muted-foreground">
                                    {userReport.excused}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Процент посещений</CardTitle>
                                <BarChart className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {`${(userReport.attendancePercentage || 0).toFixed(0)}%`}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div>
                     <AttendanceChart data={userReport} />
                </div>
            </>
           ) : (
             <div className="lg:col-span-2 flex flex-col gap-4 h-40 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground max-w-sm">Не удалось найти профиль спортсмена, привязанный к вашему аккаунту родителя. Убедитесь, что тренер указал ваш email ({user?.email}) в профиле вашего ребенка в разделе "Команда".</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
