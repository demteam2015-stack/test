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
import { getFeedback, type FeedbackInput } from '@/ai/flows/feedback-flow';

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

    try {
        const input: FeedbackInput = { feedbackText: feedback };
        const result = await getFeedback(input);
        setResponse(result.analysis);
    } catch (err: any) {
        setError(err.message || "Не удалось получить ответ от AI.");
    } finally {
        setLoading(false);
    }
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
            Задайте вопрос или поделитесь мыслями. Тренер (AI) проанализирует и даст совет.
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
                {response}
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
