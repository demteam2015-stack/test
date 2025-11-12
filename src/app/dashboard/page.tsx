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
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Trophy, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Welcome back, Athlete!
        </h1>
        <p className="text-muted-foreground">
          Here's a summary of your team activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Trainings
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +2 this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+125</div>
            <p className="text-xs text-muted-foreground">
              +10 since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Competition</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">in 12 days</div>
            <p className="text-xs text-muted-foreground">Regional Championship</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
          <CardDescription>
            An overview of recent team events and news.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Morning Practice</TableCell>
                <TableCell>
                  <Badge variant="secondary">Completed</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-20</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Team Meeting</TableCell>
                <TableCell>
                  <Badge variant="secondary">Completed</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-19</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>New Member Onboarding</TableCell>
                <TableCell>
                  <Badge variant="default">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-right">2024-07-22</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
