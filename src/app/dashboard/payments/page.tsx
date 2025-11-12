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
        title: "Атлет",
        price: "$49",
        description: "Для преданных атлетов, нацеленных на рост.",
        features: ["Доступ ко всем тренировкам", "Персональные рекомендации", "Участие в соревнованиях"],
        isCurrent: false,
    },
    {
        title: "Про Атлет",
        price: "$99",
        description: "Для элитных атлетов, соревнующихся на высшем уровне.",
        features: ["Все функции 'Атлета'", "Приоритетное бронирование занятий", "Эксклюзивный доступ к контенту", "Аккаунт родителя/опекуна"],
        isCurrent: true,
        isPopular: true,
    },
    {
        title: "Болельщик",
        price: "$19",
        description: "Для родителей и фанатов, которые хотят оставаться на связи.",
        features: ["Просмотр расписаний", "Получение уведомлений", "Доступ к сообществу"],
        isCurrent: false,
    }
]

const paymentHistory = [
    { invoice: "INV-2024-003", date: "2024-07-01", amount: "$99.00", status: "Оплачено" },
    { invoice: "INV-2024-002", date: "2024-06-01", amount: "$99.00", status: "Оплачено" },
    { invoice: "INV-2024-001", date: "2024-05-01", amount: "$99.00", status: "Оплачено" },
]

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Оплата и членство
        </h1>
        <p className="text-muted-foreground">
          Управляйте своей подпиской и просматривайте историю платежей.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map(plan => (
            <Card key={plan.title} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader className="relative">
                    {plan.isPopular && <Badge className="absolute top-[-0.75rem] right-4">Популярный</Badge>}
                    <CardTitle className="font-headline">{plan.title}</CardTitle>
                    <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/месяц</span></p>
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
                        {plan.isCurrent ? 'Текущий план' : 'Выбрать план'}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">История платежей</CardTitle>
          <CardDescription>
            Ваши последние транзакции с командой.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Счет</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="text-right">Статус</TableHead>
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
