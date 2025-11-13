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
import { Mail, Check, CheckCheck, Loader, Inbox, Send, ArrowLeft, MessageSquarePlus, BrainCircuit, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getMessageThreadsForUser, markThreadAsRead, createMessage, type Message, getCoachUser } from '@/lib/messages-api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getFullName, getInitials, getAvatarUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getFullJournal } from '@/lib/journal-api';
import { competitionsData } from '@/lib/data';
import { getAthletes, type Athlete } from '@/lib/athletes-api';


// Mock AI analysis function
const getAIAnalysis = async (athleteId: string): Promise<string> => {
    const journal = await getFullJournal();
    const athletes = await getAthletes();
    const currentUserAthlete = athletes.find(a => a.id === athleteId);

    const userCompetitions = competitionsData.filter(c => c.status === 'Завершенный');

    let attendanceSummary = '';
    let totalPresent = 0;
    let totalAbsent = 0;

    Object.values(journal).forEach(day => {
        Object.values(day).forEach(event => {
            if (event[athleteId]) {
                if (event[athleteId] === 'present') totalPresent++;
                if (event[athleteId] === 'absent') totalAbsent++;
            }
        });
    });

    if (totalPresent + totalAbsent > 0) {
        const attendancePercentage = (totalPresent / (totalPresent + totalAbsent)) * 100;
        attendanceSummary = `Анализ посещаемости:
- Всего посещено: ${totalPresent}
- Всего пропущено: ${totalAbsent}
- Процент посещаемости: ${attendancePercentage.toFixed(0)}%

Твой процент посещаемости - это хороший показатель дисциплины. ${attendancePercentage > 80 ? 'Так держать!' : 'Постарайся не пропускать тренировки, чтобы быстрее достичь цели.'}`
    } else {
        attendanceSummary = 'Недостаточно данных о посещаемости для анализа. Начни отмечаться в журнале!'
    }

    let competitionSummary = '';
    if (userCompetitions.length > 0) {
        competitionSummary = `\n\nАнализ соревнований:
${userCompetitions.map(c => `- "${c.name}": результат - ${c.result}`).join('\n')}

${userCompetitions.some(c => c.result?.includes('1')) ? 'Поздравляю с призовыми местами! Это отличный результат.' : 'Каждое соревнование - это ценный опыт. Продолжай работать над собой.'}`
    }

    const athleteName = currentUserAthlete ? getFullName(currentUserAthlete.firstName, currentUserAthlete.lastName) : "спортсмен";

    return `Здравствуйте, ${athleteName}! Я ваш AI-тренер. Я проанализировал вашу активность в приложении.

${attendanceSummary}
${competitionSummary}

Общая рекомендация: продолжайте регулярно тренироваться и не забывайте оставлять обратную связь после занятий. Это поможет мне давать более точные советы. Если у вас есть конкретный вопрос, задайте его.`;
}


export default function MyMessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [coach, setCoach] = useState<{ id: string; name: string; role: 'admin' | 'coach' } | null>(null);
  const [athleteId, setAthleteId] = useState<string | null>(null);


  const fetchThreads = useCallback(async () => {
    if (!user || !athleteId) return;
    setLoading(true);
    const userThreads = await getMessageThreadsForUser(athleteId);
    setThreads(userThreads);
    setLoading(false);
  }, [user, athleteId]);
  
  // Find athlete profile for current user
  useEffect(() => {
    const findAthleteProfile = async () => {
        if (user) {
            const allAthletes = await getAthletes();
            if (user.role === 'athlete') {
                const athleteProfile = allAthletes.find(a => getFullName(a.firstName, a.lastName) === getFullName(user.firstName, user.lastName));
                if (athleteProfile) setAthleteId(athleteProfile.id);
            } else if (user.role === 'parent') {
                const childProfile = allAthletes.find(a => a.parentId === user.email);
                if (childProfile) setAthleteId(childProfile.id);
            } else {
                 setAthleteId(user.id);
            }
        }
    };
    findAthleteProfile();
  }, [user]);

  useEffect(() => {
    async function fetchCoach() {
      const coachUser = await getCoachUser();
      setCoach(coachUser);
    }
    fetchCoach();
  }, []);

  useEffect(() => {
    if(athleteId) {
        fetchThreads();
    }
  }, [fetchThreads, athleteId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, threads]);

  const handleThreadSelect = async (threadId: string) => {
    setActiveThreadId(threadId);
    if(athleteId) {
        await markThreadAsRead(threadId, athleteId);
        // Manually update the read status in the local state to avoid a full refetch
        setThreads(prev => {
            const newThreads = {...prev};
            if (newThreads[threadId]) {
                newThreads[threadId] = newThreads[threadId].map(msg => 
                    msg.recipientId === athleteId ? { ...msg, isRead: true } : msg
                );
            }
            return newThreads;
        });
    }
  };

  const handleStartNewConversation = () => {
      if (!athleteId || !coach) return;
      // Logic to find or create the main thread with the coach
      const coachThreadId = `${athleteId}_${coach.id}`;
      const invertedCoachThreadId = `${coach.id}_${athleteId}`;

      if (threads[coachThreadId] || threads[invertedCoachThreadId]) {
          setActiveThreadId(threads[coachThreadId] ? coachThreadId : invertedCoachThreadId);
      } else {
        // Create a temporary new thread view
        const newThreadId = coachThreadId;
        setThreads(prev => ({...prev, [newThreadId]: []}));
        setActiveThreadId(newThreadId);
      }
  }

  const handleGetAIAnalysis = async () => {
      if (!athleteId || !coach) return;
      setIsSending(true);

      const analysisText = await getAIAnalysis(athleteId);

      const threadId = `${athleteId}_ai_coach`;
      setActiveThreadId(threadId);

      const aiMessage: Omit<Message, 'id'|'isRead'> = {
        senderId: 'ai_coach_id',
        senderName: "AI-Тренер",
        senderRole: 'coach',
        recipientId: athleteId,
        text: analysisText,
        date: new Date().toISOString(),
        threadId: threadId,
      };

      const createdMessage = await createMessage(aiMessage);
      
      setThreads(prev => {
        const newThreads = {...prev};
        if (!newThreads[threadId]) newThreads[threadId] = [];
        const thread = newThreads[threadId];
        if (!thread.find(m => m.id === createdMessage.id)) {
            thread.push(createdMessage);
        }
        return newThreads;
      });

      toast({
          title: "Отчет от AI-Тренера готов",
          description: "Анализ вашей активности доступен в чате."
      });

      setIsSending(false);
  }
  
  const handleReply = async () => {
    if (!replyText || !user || !coach || !athleteId) return;

    setIsSending(true);
    
    // In a new conversation, the threadId is determined for the first time.
    const threadIdToSend = activeThreadId || `${athleteId}_${coach.id}`;

    const newMessage: Omit<Message, 'id'|'isRead'> = {
        senderId: athleteId,
        senderName: getFullName(user.firstName, user.lastName) || user.username,
        senderRole: user.role,
        recipientId: coach.id, // All messages go to the coach
        text: replyText,
        date: new Date().toISOString(),
        threadId: threadIdToSend
    };
    
    const createdMessage = await createMessage(newMessage);
    setReplyText('');
    
    setThreads(prevThreads => {
        const newThreads = {...prevThreads};
        const threadKey = createdMessage.threadId;
        if (!newThreads[threadKey]) {
            newThreads[threadKey] = [];
        }
        const thread = newThreads[threadKey];
        if (!thread.find(m => m.id === createdMessage.id)) {
            thread.push(createdMessage);
        }
        
        // If it was a temporary thread, remove the old key
        if(activeThreadId && activeThreadId !== threadKey) {
            delete newThreads[activeThreadId];
        }
        return newThreads;
    });

    // Ensure the new (or existing) thread is active
    setActiveThreadId(createdMessage.threadId);
    setIsSending(false);
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary"/>
            Центр рекомендаций
        </h1>
        <p className="text-muted-foreground">
            Ваш личный диалог с тренером и AI-помощником.
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
                  <Button size="sm" onClick={handleStartNewConversation} disabled={!athleteId}>
                      <MessageSquarePlus className="mr-2"/>
                      Написать тренеру
                  </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2 h-[calc(100%-8rem)] overflow-y-auto pr-2">
                {loading || !athleteId ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : sortedThreads.length > 0 ? (
                     sortedThreads.map(thread => {
                        const lastMessage = thread[thread.length - 1];
                        if (!lastMessage) return null;
                        
                        const otherParticipantName = lastMessage.senderId === athleteId 
                          ? (lastMessage.recipientId === coach?.id ? "Тренер" : "AI-Тренер") 
                          : lastMessage.senderName;
                        
                        const isUnread = lastMessage.recipientId === athleteId && !lastMessage.isRead;
                        const isCoachAdmin = lastMessage.senderId === coach?.id && coach?.role === 'admin';
                        return (
                            <div 
                                key={thread[0].threadId}
                                onClick={() => handleThreadSelect(thread[0].threadId)}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${activeThreadId === thread[0].threadId ? 'bg-muted' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className={`font-semibold flex items-center gap-1.5 ${isUnread ? 'text-primary' : ''}`}>
                                        {otherParticipantName}
                                        {isCoachAdmin && <BadgeCheck className="h-4 w-4 text-primary" />}
                                    </p>
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
                        <p className="mt-2 text-sm text-muted-foreground">Начните диалог с тренером или запросите анализ у AI.</p>
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
                           <CardTitle>Диалог</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto space-y-4 pr-2">
                       {activeThread.map((msg, index) => (
                            <div key={msg.id + index} className={`flex items-end gap-2 ${msg.senderId === athleteId ? 'justify-end' : ''}`}>
                                {msg.senderId !== athleteId && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={getAvatarUrl(msg.senderId, msg.senderName)} />
                                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === athleteId ? 'bg-primary text-primary-foreground' : (msg.senderName === "AI-Тренер" ? 'bg-secondary' : 'bg-muted')}`}>
                                    <p className="font-bold mb-1 text-xs flex items-center gap-1.5">
                                        {msg.senderName}
                                        {msg.senderRole === 'admin' && <BadgeCheck className="h-3 w-3" />}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <div className={`flex items-center gap-2 mt-2 ${msg.senderId === athleteId ? 'justify-end' : 'justify-start'}`}>
                                        <time className="text-xs opacity-70">
                                            {format(new Date(msg.date), 'HH:mm', { locale: ru })}
                                        </time>
                                         {msg.senderId === athleteId && (
                                            msg.isRead ? <CheckCheck size={16} className="text-blue-400" /> : <Check size={16} />
                                         )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </CardContent>
                     <CardFooter className="flex-shrink-0 pt-4 border-t gap-2">
                         <Button variant="outline" onClick={handleGetAIAnalysis} disabled={isSending || !athleteId}>
                             <BrainCircuit className="mr-2"/>
                             Запросить анализ у AI
                         </Button>
                         <div className="relative w-full">
                            <Textarea 
                                placeholder="Напишите ответ тренеру..." 
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply();
                                    }
                                }}
                                disabled={isSending || !athleteId}
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
                    <p className="mt-2 text-sm text-muted-foreground">Выберите диалог из списка слева, напишите тренеру или запросите анализ своей активности у AI-тренера.</p>
                     <Button className="mt-4" onClick={handleGetAIAnalysis} disabled={isSending || !athleteId}>
                         <BrainCircuit className="mr-2"/>
                         Получить анализ от AI
                     </Button>
                </div>
            )}
        </Card>

      </div>
    </div>
  );
}
