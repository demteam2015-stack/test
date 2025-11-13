'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Check, CheckCheck, Loader, Inbox, Send, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getMessageThreadsForUser, markThreadAsRead, createMessage, type Message } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Assume a single coach for simplicity
const COACH_ID = 'admin_lexazver';
const COACH_NAME = 'Тренер';

export default function MyMessagesPage() {
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
    const userThreads = await getMessageThreadsForUser(user.id);
    setThreads(userThreads);
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
        // Refresh threads to update unread status visually
        fetchThreads();
    }
  };

  const handleStartNewConversation = () => {
      // Create a dummy threadId to open the new message view
      const newThreadId = `new_${user?.id}_${Date.now()}`;
      setThreads(prev => ({...prev, [newThreadId]: []}));
      setActiveThreadId(newThreadId);
  }
  
  const handleReply = async () => {
    if (!replyText || !user || !activeThreadId) return;
    
    setIsSending(true);

    const isNewThread = activeThreadId.startsWith('new_');
    // If it's a new thread, the threadId will be determined by the createMessage function
    const threadIdToSend = isNewThread ? undefined : activeThreadId;

    const newMessage: Omit<Message, 'id'|'isRead'|'threadId'> & {threadId?: string} = {
        senderId: user.id,
        senderName: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
        senderRole: user.role,
        recipientId: COACH_ID, // All replies go to the coach
        text: replyText,
        date: new Date().toISOString(),
        threadId: threadIdToSend
    };
    
    await createMessage(newMessage);
    setReplyText('');
    setIsSending(false);
    await fetchThreads(); // Refresh to show the new message
    
    // After sending, we need to find the new threadId if it was a new conversation
    if (isNewThread) {
        const userThreads = await getMessageThreadsForUser(user.id);
        const newThread = Object.values(userThreads).find(thread => thread.some(m => m.text === replyText));
        if (newThread) {
            setActiveThreadId(newThread[0].threadId);
        }
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const sortedThreads = Object.values(threads)
    .filter(thread => thread.length > 0) // Don't show dummy 'new' threads in the list
    .sort((a,b) => {
      const lastMsgA = new Date(a[a.length - 1].date).getTime();
      const lastMsgB = new Date(b[b.length - 1].date).getTime();
      return lastMsgB - lastMsgA;
  });

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary"/>
            Мои сообщения
        </h1>
        <p className="text-muted-foreground">
            История ваших диалогов с тренером.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-15rem)]">
        <Card className={`lg:col-span-1 ${activeThreadId && 'hidden lg:block'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Диалоги</CardTitle>
                    <CardDescription>Всего диалогов: {sortedThreads.length}</CardDescription>
                </div>
                <Button size="sm" onClick={handleStartNewConversation}>
                    <MessageSquarePlus className="mr-2"/>
                    Написать
                </Button>
            </CardHeader>
            <CardContent className="space-y-2 h-[calc(100%-8rem)] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : sortedThreads.length > 0 ? (
                     sortedThreads.map(thread => {
                        const lastMessage = thread[thread.length - 1];
                        const isUnread = lastMessage.recipientId === user?.id && !lastMessage.isRead;
                        return (
                            <div 
                                key={thread[0].threadId}
                                onClick={() => handleThreadSelect(thread[0].threadId)}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${activeThreadId === thread[0].threadId ? 'bg-muted' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className={`font-semibold ${isUnread ? 'text-primary' : ''}`}>{COACH_NAME}</p>
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
                        <h3 className="mt-4 text-lg font-semibold">У вас пока нет диалогов</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Нажмите "Написать", чтобы начать диалог с тренером.</p>
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
                           <CardTitle>Диалог с тренером</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto space-y-4 pr-2">
                       {activeThread.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                                {msg.senderId !== user?.id && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=admin_lexazver`} />
                                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <div className={`flex items-center gap-2 mt-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <time className="text-xs opacity-70">
                                            {format(new Date(msg.date), 'HH:mm', { locale: ru })}
                                        </time>
                                         {msg.senderId === user?.id && (
                                            msg.isRead ? <CheckCheck size={16} className="text-blue-400" /> : <Check size={16} />
                                         )}
                                    </div>
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
                    <Mail className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Выберите диалог</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Выберите диалог из списка слева, чтобы просмотреть переписку, или нажмите "Написать", чтобы начать новый.</p>
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}
