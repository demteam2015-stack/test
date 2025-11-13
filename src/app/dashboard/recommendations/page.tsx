'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Inbox, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getMessageThreadsForUser, markThreadAsRead, createMessage, type Message } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Assume a single coach for simplicity
const COACH_ID = 'admin_lexazver';
const COACH_NAME = 'Тренер';

// --- Components for different roles ---

const AthleteParentView = () => {
    // This view is now deprecated and functionality is moved to my-messages page.
    // We can show a simple message or redirect.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Новое сообщение</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Чтобы отправить новое сообщение или просмотреть историю, пожалуйста, перейдите в раздел "Мои сообщения".</p>
            </CardContent>
            <CardFooter>
                 <Button asChild>
                    <a href="/dashboard/my-messages">Перейти в Мои сообщения</a>
                 </Button>
            </CardFooter>
        </Card>
    )
};

const CoachAdminView = () => {
    const { user } = useAuth();
    const [threads, setThreads] = useState<Record<string, Message[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const fetchThreads = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        // In coach's view, their ID is the recipient ID for all threads
        const coachThreads = await getMessageThreadsForUser(user.id);
        setThreads(coachThreads);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeThreadId, threads]);

    const handleThreadSelect = async (threadId: string) => {
        setActiveThreadId(threadId);
        if(user) {
            await markThreadAsRead(threadId, user.id);
            fetchThreads(); // Refresh to update unread count
        }
    };

    const handleReply = async () => {
        if (!replyText || !user || !activeThreadId) return;

        const currentThread = threads[activeThreadId];
        if (!currentThread || currentThread.length === 0) return;

        // Find the other person in the conversation
        const otherParticipant = currentThread.find(m => m.senderId !== user.id);
        if (!otherParticipant) {
            console.error("Could not find recipient for the reply.");
            return;
        }

        setIsSending(true);

        const newMessage: Omit<Message, 'id'|'isRead'> = {
            senderId: user.id,
            senderName: COACH_NAME,
            senderRole: user.role,
            recipientId: otherParticipant.senderId,
            threadId: activeThreadId,
            text: replyText,
            date: new Date().toISOString(),
        };

        await createMessage(newMessage);
        setReplyText('');
        setIsSending(false);
        fetchThreads();
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
            return `${parts[0][0]}${parts[1][0]}`;
        }
        return name.substring(0, 2);
    };

    const sortedThreads = Object.values(threads).sort((a,b) => {
      if (a.length === 0) return 1;
      if (b.length === 0) return -1;
      const lastMsgA = new Date(a[a.length - 1].date).getTime();
      const lastMsgB = new Date(b[b.length - 1].date).getTime();
      return lastMsgB - lastMsgA;
    });

    const activeThread = activeThreadId ? threads[activeThreadId] : null;
    const activeThreadSenderName = activeThread ? activeThread.find(m => m.senderId !== user?.id)?.senderName || 'Участник' : '';

    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-15rem)]">
            <Card className={`lg:col-span-1 ${activeThreadId && 'hidden lg:block'}`}>
                <CardHeader>
                    <CardTitle>Входящие диалоги</CardTitle>
                    <CardDescription>Всего диалогов: {Object.keys(threads).length}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 h-[calc(100%-8rem)] overflow-y-auto pr-2">
                    {loading ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sortedThreads.length > 0 ? (
                        sortedThreads.map(thread => {
                            if (thread.length === 0) return null;
                            const lastMessage = thread[thread.length - 1];
                            const sender = thread.find(m => m.senderId !== user?.id) || thread[0];
                            const isUnread = lastMessage.recipientId === user?.id && !lastMessage.isRead;
                            return (
                                <div 
                                    key={thread[0].threadId}
                                    onClick={() => handleThreadSelect(thread[0].threadId)}
                                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${activeThreadId === thread[0].threadId ? 'bg-muted' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className={`font-semibold ${isUnread ? 'text-primary' : ''}`}>{sender.senderName}</p>
                                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(lastMessage.date), 'd MMM HH:mm', { locale: ru })}
                                        </time>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col h-full items-center justify-center text-center">
                            <Inbox className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Входящих сообщений нет</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Как только кто-то отправит сообщение, оно появится здесь.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className={`lg:col-span-2 ${!activeThreadId && 'hidden lg:flex'}`}>
                {activeThread ? (
                    <div className="flex flex-col h-full">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-center gap-4">
                               <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setActiveThreadId(null)}>
                                    <ArrowLeft />
                               </Button>
                               <CardTitle>Диалог с {activeThreadSenderName}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto space-y-4 pr-2">
                           {activeThread.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                                    {msg.senderId !== user?.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${msg.senderId}`} />
                                            <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-xs font-bold mb-1 opacity-80">{msg.senderName}</p>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        <time className={`text-xs opacity-70 mt-2 block ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                            {format(new Date(msg.date), 'HH:mm', { locale: ru })}
                                        </time>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <CardFooter className="flex-shrink-0 pt-4 border-t">
                            <div className="relative w-full">
                                <Textarea 
                                    placeholder="Напишите ответ..." 
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply();
                                        }
                                    }}
                                    disabled={isSending}
                                    className="pr-20"
                                />
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    className="absolute top-1/2 right-2 -translate-y-1/2" 
                                    onClick={handleReply}
                                    disabled={isSending || !replyText}
                                >
                                    {isSending ? <Loader className="animate-spin" /> : <Send />}
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center text-center p-8">
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Выберите диалог</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Выберите диалог из списка слева, чтобы просмотреть переписку и ответить.</p>
                    </div>
                )}
            </Card>
         </div>
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
                    {isManager ? 'Сообщения' : 'Мои сообщения'}
                </h1>
                <p className="text-muted-foreground">
                    {isManager ? 'Просмотр и ответы на сообщения от спортсменов и родителей.' : 'Задайте вопрос тренеру или поделитесь мыслями.'}
                </p>
            </div>
            {isManager ? <CoachAdminView /> : <AthleteParentView />}
        </div>
    );
}
