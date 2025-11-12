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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Lightbulb, ServerCrash } from 'lucide-react';
import { useState } from 'react';

export default function RecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState('');
    const [error, setError] = useState('');

  const handleClick = () => {
    setLoading(true);
    setError('');
    setRecommendations('');
    setTimeout(() => {
        setRecommendations(`
### План тренировок на следующую неделю

**Цель:** Улучшение спринтерских качеств и силовой выносливости.

**Понедельник:**
*   **Разминка:** 15 минут (легкий бег, динамическая растяжка).
*   **Основная часть:**
    *   Интервальный бег: 6x150м с 80% интенсивностью. Отдых между повторениями - 3-4 минуты.
    *   Прыжковые упражнения: 3 серии по 10 прыжков в длину с места.
*   **Заминка:** 10 минут (растяжка основных групп мышц).

**Среда:**
*   **Разминка:** 15 минут.
*   **Основная часть (Силовая тренировка):**
    *   Приседания со штангой: 4 подхода по 8 повторений.
    *   Подтягивания: 3 подхода до отказа.
    *   Жим лежа: 4 подхода по 8-10 повторений.
*   **Заминка:** 10 минут.

**Пятница:**
*   **Разминка:** 15 минут.
*   **Основная часть:**
    *   Техническая работа: бег с барьерами, старты с колодок.
    *   Кросс: 30 минут в легком темпе.
*   **Заминка:** 15 минут.

### Советы по питанию и ментальному здоровью

*   **Питание:** Увеличьте потребление белка (курица, рыба, творог) для восстановления мышц. Не забывайте про сложные углеводы (гречка, овсянка) за 1.5-2 часа до тренировки.
*   **Ментальное здоровье:** Практикуйте 10-минутную медитацию перед сном для снижения стресса и улучшения концентрации. Визуализируйте свои успешные старты.
        `);
        setLoading(false);
    }, 1500);
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            AI Тренер
          </h1>
          <p className="text-muted-foreground">
            Получайте персональные рекомендации по тренировкам.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Генератор рекомендаций</CardTitle>
                <CardDescription>
                    Нажмите на кнопку ниже, чтобы получить персональный план тренировок, сгенерированный с помощью AI.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={handleClick} disabled={loading}>
                    {loading ? 'Генерация...' : 'Получить рекомендации'}
                </Button>
            </CardFooter>
        </Card>

        {error && (
             <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}

        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary"/>
                Ваш персональный план
            </CardTitle>
            <CardDescription>
              Рекомендации появятся здесь после генерации.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
                    <Loader className="h-12 w-12 text-muted-foreground animate-spin" />
                    <h3 className="mt-4 text-lg font-semibold">Генерация плана...</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Пожалуйста, подождите.</p>
                </div>
            ) : recommendations ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4">
                {recommendations}
              </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Ожидание ввода</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Нажмите на кнопку, чтобы сгенерировать рекомендации.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Loader(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    )
}
