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
import { MessageSquare, Lightbulb, ServerCrash, Loader, BrainCircuit, Inbox } from 'lucide-react';
import { useState, type FormEvent, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { createMessage, getMessages, type Message } from '@/lib/messages-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Локальный "мозг" тренера (ответы для спортсменов/родителей)
const getLocalCoachResponse = (text: string): string => {
    const lowerCaseText = text.toLowerCase();
    
    if (lowerCaseText.includes('устал') || lowerCaseText.includes('тяжело') || lowerCaseText.includes('не могу')) {
        return `Я тебя услышал. Спасибо, что поделился. Отдых — это такая же важная часть тренировочного процесса, как и сама нагрузка. Давай на следующей неделе немного снизим интенсивность. Твой сигнал важен.`;
    }
    if (lowerCaseText.includes('техника') || lowerCaseText.includes('удар') || lowerCaseText.includes('прием')) {
        return `Отличный вопрос! Рад, что ты сфокусирован на деталях. На следующей тренировке подойди ко мне, и мы выделим время, чтобы разобрать твой вопрос индивидуально.`;
    }
    if (lowerCaseText.includes('совет') || lowerCaseText.includes('мотивация') || lowerCaseText.includes('помощь')) {
         return `Спасибо, что обратился. Сосредоточься не на конечной цели, а на маленьких шагах, которые ты делаешь каждый день. Каждая тренировка — это уже победа. Я в тебя верю.`;
    }
    if (lowerCaseText.includes('спасибо') || lowerCaseText.includes('благодарю')) {
        return `Всегда пожалуйста! Рад быть полезным. Продолжай в том же духе!`;
    }
    return `Спасибо за твое сообщение. Я внимательно изучил его. Это важная информация. Давай обсудим это подробнее на следующей тренировке.`;
};

// --- Компоненты для разных ролей ---

const AthleteParentView = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!feedback || !user) return;

        setLoading(true);
        setError('');
        setResponse('');

        try {
            await createMessage({
                senderId: user.id,
                senderName: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
                senderRole: user.role,
                text: feedback,
                date: new Date().toISOString()
            });

            toast({
                title: "Сообщение отправлено",
                description: "Тренер получил ваше сообщение и скоро его рассмотрит.",
            });
            
            const result = getLocalCoachResponse(feedback);
            setResponse(result);
            setFeedback('');

        } catch (err: any) {
            setError(err.message || "Не удалось отправить сообщение.");
             toast({
                variant: 'destructive',
                title: "Ошибка",
                description: "Не удалось отправить сообщение.",
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Чат с тренером</CardTitle>
                        <CardDescription>
                            Опишите ваши впечатления, проблемы или задайте вопрос. Тренер получит ваше сообщение и даст развернутый ответ.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="feedback-input">Ваше сообщение</Label>
                            <Textarea 
                                id="feedback-input" 
                                placeholder="Например: 'Тренер, последние тренировки кажутся слишком интенсивными, я не успеваю восстанавливаться.' или 'У меня вопрос по технике выполнения...'"
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
                            {loading ? 'Отправка...' : 'Отправить тренеру'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            {error && (
                <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="text-primary"/>
                        Мгновенный ответ ассистента
                    </CardTitle>
                    <CardDescription>
                        Это автоматический ответ для быстрой помощи. Тренер уже получил ваше основное сообщение.
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[150px]">
                     {loading ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-40">
                            <Loader className="h-10 w-10 text-muted-foreground animate-spin" />
                            <p className="mt-2 text-sm text-muted-foreground">Анализирую...</p>
                        </div>
                    ) : response ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4">
                           <p>{response}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center h-40">
                            <Lightbulb className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Ответ ассистента появится здесь.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const CoachAdminView = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        const allMessages = await getMessages();
        setMessages(allMessages);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[1][0]}`;
        }
        return name.substring(0, 2);
    };

    const roleTranslations: { [key: string]: string } = {
        athlete: 'Спортсмен',
        coach: 'Тренер',
        parent: 'Родитель',
        admin: 'Администратор',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Inbox className="h-6 w-6"/>
                    Входящие сообщения
                </CardTitle>
                <CardDescription>
                    Здесь отображаются сообщения от спортсменов и родителей. Всего: {messages.length}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-60">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : messages.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {messages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${msg.senderId}`} />
                                    <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">
                                            {msg.senderName} <span className="text-xs font-normal text-muted-foreground">({roleTranslations[msg.senderRole] || msg.senderRole})</span>
                                        </p>
                                        <time className="text-xs text-muted-foreground">
                                            {format(new Date(msg.date), 'd MMM yyyy, HH:mm', { locale: ru })}
                                        </time>
                                    </div>
                                    <p className="mt-2 text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Входящих сообщений нет</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Как только кто-то отправит сообщение, оно появится здесь.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function RecommendationsPage() {
    const { user } = useAuth();
    const isManager = user?.role === 'admin' || user?.role === 'coach';

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary"/>
                    {isManager ? 'Сообщения от участников' : 'Чат с тренером'}
                </h1>
                <p className="text-muted-foreground">
                    {isManager ? 'Просмотр обратной связи от спортсменов и родителей.' : 'Задайте вопрос или поделитесь мыслями. Тренер получит ваше сообщение.'}
                </p>
            </div>
            {isManager ? <CoachAdminView /> : <AthleteParentView />}
        </div>
    );
}