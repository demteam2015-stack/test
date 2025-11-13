'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Check, CheckCheck, Loader, Inbox } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getMessagesForUser, type MessageWithReadStatus } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithReadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const userMessages = await getMessagesForUser(user.id);
    setMessages(userMessages);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Mail className="h-8 w-8 text-primary"/>
                Мои отправленные сообщения
            </h1>
            <p className="text-muted-foreground">
                История ваших обращений к тренеру и их статус.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>История обращений</CardTitle>
                <CardDescription>
                    Всего отправлено: {messages.length}
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
                            <div key={msg.id} className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                                <div className="flex items-baseline justify-between">
                                    <time className="text-xs text-muted-foreground">
                                        {format(new Date(msg.date), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                    </time>
                                    {msg.isRead ? (
                                        <div className="flex items-center gap-1 text-xs text-blue-400">
                                            <CheckCheck size={16} />
                                            <span>прочитано</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Check size={16} />
                                            <span>отправлено</span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-60 items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Вы еще не отправляли сообщений</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Перейдите в раздел "Новое сообщение", чтобы задать вопрос тренеру.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
