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
import { useAuth, type UserProfile } from '@/context/auth-context';
import { getMessageThreadsForUser, markThreadAsRead, createMessage, type Message } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getFullName, getInitials, getAvatarUrl } from '@/lib/utils';
import Link from 'next/link';

// Helper function to get all users directly for the coach view
const getAllUsers = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const users: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_id_')) {
            try {
                const storedUser = JSON.parse(localStorage.getItem(key) || '{}');
                // Attempt to get name from unencrypted username, fallback
                const nameParts = storedUser.username.split('_');
                const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'User';
                const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';

                users.push({
                    id: storedUser.id,
                    email: storedUser.email,
                    username: storedUser.username,
                    // These will be encrypted and not useful here without the user's password.
                    // We'll rely on the user object being mostly unencrypted for this view.
                    firstName: firstName, 
                    lastName: lastName,
                    role: 'athlete'
                });
            } catch (e) {
                // ignore
            }
        }
    }
    return users;
};


const CoachAdminView = () => {
    const { user, adminGetUserProfile } = useAuth();
    const [threads, setThreads] = useState<Record<string, Message[]>>({});
    const [participants, setParticipants] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const fetchThreadsAndParticipants = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const coachThreads = await getMessageThreadsForUser(user.id);
        
        // Get all users to find participant info
        const allUsers = getAllUsers();
        
        const participantsData: Record<string, UserProfile> = {};
        allUsers.forEach(u => {
            participantsData[u.id] = u;
        });

        // The coach/admin themself
        if (user) {
            participantsData[user.id] = user;
        }
        
        setParticipants(participantsData);
        setThreads(coachThreads);
        setLoading(false);
    }, [user]);
    
    const fetchThreads = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const coachThreads = await getMessageThreadsForUser(user.id);
        setThreads(coachThreads);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchThreadsAndParticipants();
    }, [fetchThreadsAndParticipants]);
    
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
        if (!currentThread) return;

        const otherParticipantId = activeThreadId.replace(user.id, '').replace('_', '');
        
        setIsSending(true);

        const newMessageData: Omit<Message, 'id'|'isRead'> = {
            senderId: user.id,
            senderName: "Тренер", // Coach always sends as "Тренер"
            senderRole: user.role,
            recipientId: otherParticipantId,
            threadId: activeThreadId,
            text: replyText,
            date: new Date().toISOString(),
        };

        const createdMessage = await createMessage(newMessageData);
        
        setThreads(prev => {
            const newThreads = {...prev};
            if(newThreads[activeThreadId]) {
                 newThreads[activeThreadId] = [...newThreads[activeThreadId], createdMessage];
            } else {
                 newThreads[activeThreadId] = [createdMessage];
            }
            return newThreads;
        });
        
        setReplyText('');
        setIsSending(false);
    };

    const sortedThreads = Object.entries(threads)
      .filter(([,thread]) => thread.length > 0)
      .sort(([,a],[,b]) => {
        const lastMsgA = new Date(a[a.length - 1].date).getTime();
        const lastMsgB = new Date(b[b.length - 1].date).getTime();
        return lastMsgB - lastMsgA;
    });

    const activeThread = activeThreadId ? threads[activeThreadId] : null;

    const getParticipantForThread = (thread: Message[]) => {
        if (!user || thread.length === 0) return null;
        // Find the first message not sent by the current user (the coach)
        const otherUserMsg = thread.find(m => m.senderId !== user.id);
        if (otherUserMsg) {
          // The sender name is stored unencrypted in the message
          return { name: otherUserMsg.senderName, id: otherUserMsg.senderId };
        }
        
        // If coach started the conversation, the other participant is the recipient
        const firstMessage = thread[0];
        if (firstMessage.recipientId && participants[firstMessage.recipientId]) {
            const participant = participants[firstMessage.recipientId];
            return participant ? { name: getFullName(participant.firstName, participant.lastName) || participant.username, id: participant.id } : { name: "Участник", id: firstMessage.recipientId };
        }

        return null;
    }
    
    const activeParticipant = activeThread ? getParticipantForThread(activeThread) : null;
    const activeThreadParticipantName = activeParticipant ? activeParticipant.name : 'Участник';

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
                        sortedThreads.map(([threadId, thread]) => {
                            if (thread.length === 0) return null;
                            const lastMessage = thread[thread.length - 1];
                            const participant = getParticipantForThread(thread);
                            const participantName = participant ? participant.name : "Неизвестный";
                            const isUnread = user ? lastMessage.recipientId === user.id && !lastMessage.isRead : false;
                            
                            return (
                                <div 
                                    key={threadId}
                                    onClick={() => handleThreadSelect(threadId)}
                                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${activeThreadId === threadId ? 'bg-muted' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className={`font-semibold ${isUnread ? 'text-primary' : ''}`}>{participantName}</p>
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
                               <CardTitle>Диалог с {activeThreadParticipantName}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto space-y-4 pr-2">
                           {activeThread.map((msg, index) => {
                                const senderId = msg.senderId;
                                const senderName = msg.senderName;
                                const sender = participants[senderId];
                                return (
                                <div key={msg.id + index} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : ''}`}>
                                    {msg.senderId !== user?.id && sender && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={getAvatarUrl(sender.id, sender.username)} />
                                            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-xs font-bold mb-1 text-primary">{senderName}</p>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        <time className={`text-xs opacity-70 mt-2 block ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                            {format(new Date(msg.date), 'HH:mm', { locale: ru })}
                                        </time>
                                    </div>
                                </div>
                                )
                            })}
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

    if (!user) return null;

    return (
        <div className="grid gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary"/>
                    Сообщения
                </h1>
                <p className="text-muted-foreground">
                    Просмотр и ответы на сообщения от спортсменов и родителей.
                </p>
            </div>
            {isManager ? <CoachAdminView /> : (
                 <Card>
                    <CardHeader>
                        <CardTitle>Неверная страница</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Чтобы отправить новое сообщение или просмотреть историю, пожалуйста, перейдите в раздел "Мои сообщения" в меню слева.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/dashboard/my-messages">Перейти в Мои сообщения</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
