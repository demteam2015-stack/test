import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";

const upcoming = [
    { name: 'Regional Championship', date: '2024-08-15', location: 'Kyiv, Ukraine', status: 'Registered' },
    { name: 'National Cup', date: '2024-09-05', location: 'Lviv, Ukraine', status: 'Not Registered' },
    { name: 'International Open', date: '2024-10-20', location: 'Warsaw, Poland', status: 'Pending' },
];

const results = [
    { name: 'City Tournament', date: '2024-06-10', location: 'Odesa, Ukraine', result: '1st Place' },
    { name: 'Spring Invitational', date: '2024-04-22', location: 'Kharkiv, Ukraine', result: '3rd Place' },
    { name: 'Winter Classic', date: '2024-02-18', location: 'Dnipro, Ukraine', result: '2nd Place' },
]

export default function CompetitionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Competitions
        </h1>
        <p className="text-muted-foreground">
          Manage competition registrations and view results.
        </p>
      </div>

      <Card>
        <Tabs defaultValue="upcoming">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Competition Center</CardTitle>
                    <CardDescription>Your gateway to competitive events.</CardDescription>
                </div>
                 <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="upcoming">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competition</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((comp) => (
                    <TableRow key={comp.name}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{comp.date}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell>
                        <Badge variant={comp.status === 'Registered' ? 'default' : 'outline'}>
                            {comp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="results">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competition</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((comp) => (
                    <TableRow key={comp.name}>
                      <TableCell className="font-medium">{comp.name}</TableCell>
                      <TableCell>{comp.date}</TableCell>
                      <TableCell>{comp.location}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{comp.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
