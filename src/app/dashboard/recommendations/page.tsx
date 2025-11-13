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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Lightbulb, ServerCrash, Loader } from 'lucide-react';
import { useState, type FormEvent } from 'react';

// Локальный "мозг" тренера
const getLocalCoachResponse = (text: string): string => {
    const lowerCaseText = text.toLowerCase();
    
    // Приоритетные ключевые слова
    if (lowerCaseText.includes('устал') || lowerCaseText.includes('тяжело') || lowerCaseText.includes('не могу')) {
        return `### Я тебя услышал.

Спасибо, что поделился своими ощущениями. Очень важно прислушиваться к своему телу, и я рад, что ты доверяешь мне в этом. Усталость — это сигнал, который мы не можем игнорировать.

**Что происходит:**
Похоже, что накопившаяся нагрузка превышает твою текущую способность к восстановлению. Наша цель — становиться сильнее, а не истощать себя.

**Мой план для тебя:**
Давай скорректируем твой план. Предлагаю на следующей неделе снизить интенсивность и добавить один день на легкую восстановительную активность, например, прогулку или растяжку.

**В заключение:**
Помни, отдых — это такая же важная часть тренировочного процесса, как и сама нагрузка. Правильное восстановление сделает тебя только сильнее.`;
    }
    
    if (lowerCaseText.includes('техника') || lowerCaseText.includes('удар') || lowerCaseText.includes('прием')) {
        return `### Отличный вопрос по технике!

Рад, что ты сфокусирован на деталях — именно в них кроется мастерство.

**На что обратить внимание:**
Точность важнее силы. Сначала отработай движение медленно, до автоматизма. Убедись, что твое тело работает как единое целое: от стоп до кончиков пальцев.

**План действий:**
На следующей тренировке подойди ко мне в начале, и мы выделим 10-15 минут, чтобы разобрать твой вопрос индивидуально. Я покажу тебе ключевые моменты и дам подводящие упражнения.

**В заключение:**
Не стесняйся задавать такие вопросы. Лучше спросить и исправить, чем закреплять ошибку.`;
    }

    if (lowerCaseText.includes('совет') || lowerCaseText.includes('мотивация') || lowerCaseText.includes('помощь')) {
         return `### Спасибо, что обратился.

Ценю твое доверие. Иногда всем нам нужен взгляд со стороны или дополнительный стимул.

**Мой совет:**
Сосредоточься не на конечной цели, а на маленьких шагах, которые ты делаешь каждый день. Каждая тренировка, каждый правильный прием, каждое преодоление себя — это уже победа.

**Что делать:**
Веди дневник тренировок. Записывай не только что ты сделал, но и что почувствовал. Это поможет увидеть твой прогресс, который не всегда очевиден.

**В заключение:**
Путь чемпиона — это марафон, а не спринт. У тебя все получится, я в тебя верю. Продолжай работать!`;
    }
    
    if (lowerCaseText.includes('спасибо') || lowerCaseText.includes('благодарю')) {
        return `### Всегда пожалуйста!

Рад быть полезным. Твоя обратная связь важна для меня и для всей команды. Продолжай в том же духе!`;
    }

    // Ответ по умолчанию
    return `### Спасибо за твое сообщение.

Я внимательно изучил его. Это важная информация для меня. 

**Мои мысли:**
Каждый вопрос и каждое наблюдение помогают нам становиться лучше. Давай обсудим это подробнее на следующей тренировке.

**В заключение:**
Продолжай делиться своими мыслями. Открытый диалог — ключ к успеху.`;
};


export default function RecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedback) return;
    setLoading(true);
    setError('');
    setResponse('');

    // Имитация задержки для "размышлений" AI
    setTimeout(() => {
        try {
            const result = getLocalCoachResponse(feedback);
            setResponse(result);
        } catch (err: any) {
            setError(err.message || "Не удалось получить ответ от тренера.");
        } finally {
            setLoading(false);
        }
    }, 500); // 0.5 секунды задержки
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary"/>
            Чат с тренером
          </h1>
          <p className="text-muted-foreground">
            Задайте вопрос или поделитесь мыслями. Тренер проанализирует и даст совет.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Новое сообщение</CardTitle>
                    <CardDescription>
                        Опишите ваши впечатления, проблемы или задайте вопрос. Тренер проанализирует ваше сообщение и даст развернутый ответ.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="feedback-input">Ваше сообщение</Label>
                        <Textarea 
                            id="feedback-input" 
                            placeholder="Например: 'Тренер, последние тренировки кажутся слишком интенсивными, я не успеваю восстанавливаться.' или 'У меня вопрос по технике выполнения...'." 
                            rows={5}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading || !feedback}>
                        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Анализ...' : 'Отправить тренеру'}
                    </Button>
                </CardFooter>
            </Card>
        </form>

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
                <MessageSquare className="text-primary"/>
                Ответ тренера
            </CardTitle>
            <CardDescription>
              Ответ появится здесь после анализа вашего сообщения.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
                    <Loader className="h-12 w-12 text-muted-foreground animate-spin" />
                    <h3 className="mt-4 text-lg font-semibold">Анализирую ваше сообщение...</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Пожалуйста, подождите.</p>
                </div>
            ) : response ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4">
                <p>{response}</p>
              </div>
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-60">
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Ожидание ввода</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Напишите сообщение тренеру в форме выше.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
