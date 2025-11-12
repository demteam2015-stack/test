import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check } from "lucide-react";

const plans = [
    {
        title: "Athlete",
        price: "$49",
        description: "For dedicated athletes focused on growth.",
        features: ["Access to all training sessions", "Personalized recommendations", "Competition entry"],
        isCurrent: false,
    },
    {
        title: "Pro Athlete",
        price: "$99",
        description: "For elite athletes competing at the highest level.",
        features: ["All Athlete features", "Priority session booking", "Exclusive content access", "Parent/Guardian account"],
        isCurrent: true,
        isPopular: true,
    },
    {
        title: "Supporter",
        price: "$19",
        description: "For parents and fans who want to stay connected.",
        features: ["View schedules", "Receive notifications", "Access to community hub"],
        isCurrent: false,
    }
]

const paymentHistory = [
    { invoice: "INV-2024-003", date: "2024-07-01", amount: "$99.00", status: "Paid" },
    { invoice: "INV-2024-002", date: "2024-06-01", amount: "$99.00", status: "Paid" },
    { invoice: "INV-2024-001", date: "2024-05-01", amount: "$99.00", status: "Paid" },
]

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Billing & Memberships
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and view payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map(plan => (
            <Card key={plan.title} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader className="relative">
                    {plan.isPopular && <Badge className="absolute top-[-0.75rem] right-4">Popular</Badge>}
                    <CardTitle className="font-headline">{plan.title}</CardTitle>
                    <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Separator className="my-4" />
                    <ul className="space-y-3">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={plan.isCurrent} variant={plan.isCurrent ? 'outline' : 'default'}>
                        {plan.isCurrent ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment History</CardTitle>
          <CardDescription>
            Your recent transactions with the team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map(payment => (
                <TableRow key={payment.invoice}>
                  <TableCell className="font-medium">{payment.invoice}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50">{payment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
