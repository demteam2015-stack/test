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
import { getMessageThreadsForUser, markThreadAsRead, createMessage, type Message, getCoachUser } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [coach, setCoach] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function fetchCoach() {
      const coachUser = await getCoachUser();
      setCoach(coachUser);
    }
    fetchCoach();
  }, []);

  const fetchThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const userThreads = await getMessageThreadsForUser(user.id);
    setThreads(userThreads);
    setLoading(false);

    // If there is only one thread, open it automatically
    const threadIds = Object.keys(userThreads);
    if (threadIds.length === 1 && !activeThreadId) {
        setActiveThreadId(threadIds[0]);
    }

  }, [user, activeThreadId]);

  useEffect(() => {
    fetchThreads();
  }, [user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, threads]);

  const handleThreadSelect = async (threadId: string) => {
    setActiveThreadId(threadId);
    if(user) {
        await markThreadAsRead(threadId, user.id);
        // Manually update the read status in the local state to avoid a full refetch
        setThreads(prev => {
            const newThreads = {...prev};
            if (newThreads[threadId]) {
                newThreads[threadId] = newThreads[threadId].map(msg => 
                    msg.recipientId === user.id ? { ...msg, isRead: true } : msg
                );
            }
            return newThreads;
        });
    }
  };

  const handleStartNewConversation = () => {
      if (!user || !coach) return;
      // Logic to find or create the main thread with the coach
      const coachThreadId = `${user.id}_${coach.id}`;
      const invertedCoachThreadId = `${coach.id}_${user.id}`;

      if (threads[coachThreadId] || threads[invertedCoachThreadId]) {
          setActiveThreadId(threads[coachThreadId] ? coachThreadId : invertedCoachThreadId);
      } else {
        // Create a temporary new thread view
        const newThreadId = coachThreadId;
        setThreads(prev => ({...prev, [newThreadId]: []}));
        setActiveThreadId(newThreadId);
      }
  }
  
  const handleReply = async () => {
    if (!replyText || !user || !coach) return;

    setIsSending(true);
    
    // In a new conversation, the threadId is determined for the first time.
    const threadIdToSend = activeThreadId || `${user.id}_${coach.id}`;

    const newMessage: Omit<Message, 'id'|'isRead'> = {
        senderId: user.id,
        senderName: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
        senderRole: user.role,
        recipientId: coach.id, // All messages go to the coach
        text: replyText,
        date: new Date().toISOString(),
        threadId: threadIdToSend
    };
    
    const createdMessage = await createMessage(newMessage);
    setReplyText('');
    setIsSending(false);
    
    // Manually update the local state to show the new message instantly
    setThreads(prevThreads => {
        const newThreads = {...prevThreads};
        const currentThread = newThreads[createdMessage.threadId] || [];
        currentThread.push(createdMessage);
        newThreads[createdMessage.threadId] = currentThread;
        // If it was a temporary thread, remove the old key
        if(activeThreadId && activeThreadId !== createdMessage.threadId) {
            delete newThreads[activeThreadId];
        }
        return newThreads;
    });

    // Ensure the new (or existing) thread is active
    setActiveThreadId(createdMessage.threadId);
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
    const getAvatarUrl = (userId: string) => {
        const adminImage = PlaceHolderImages.find(img => img.id === 'user-lexazver');
        if (adminImage && coach && userId === coach.id) {
            return adminImage.imageUrl;
        }

        const userImage = PlaceHolderImages.find(img => img.id === `user-${userId.substring(0, 4)}`);
        if (userImage) return userImage.imageUrl;
        
        return `https://i.pravatar.cc/150?u=${userId}`;
    }

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
                {coach && (
                  <Button size="sm" onClick={handleStartNewConversation}>
                      <MessageSquarePlus className="mr-2"/>
                      Написать
                  </Button>
                )}
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
                                    <p className={`font-semibold ${isUnread ? 'text-primary' : ''}`}>{coach?.name || 'Тренер'}</p>
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
                       {activeThread.map((msg, index) => (
                            <div key={msg.id + index} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                                {msg.senderId !== user?.id && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={getAvatarUrl(msg.senderId)} />
                                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="font-bold mb-1 text-xs text-primary">{msg.senderName}</p>
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
                    <h3 className="mt-4 text-lg font-semibold">Выберите или начните диалог</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Выберите диалог из списка слева или нажмите "Написать", чтобы начать новый.</p>
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}

    
