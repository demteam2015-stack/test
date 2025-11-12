'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

const quotes = [
  {
    text: "Чемпионы создаются в тренажерном зале. Чемпионы создаются из того, что у них глубоко внутри – желания, мечты, видения.",
    author: "Мухаммед Али"
  },
  {
    text: "Я не боюсь того, кто изучает 10 000 различных ударов. Я боюсь того, кто изучает один удар 10 000 раз.",
    author: "Брюс Ли"
  },
  {
    text: "Победа — это не всё, но желание победить — это всё.",
    author: "Винс Ломбарди"
  },
  {
    text: "Единственный способ доказать, что ты хороший спортсмен, — это проиграть.",
    author: "Эрни Бэнкс"
  },
  {
    text: "Препятствия не должны тебя останавливать. Если ты столкнулся со стеной, не поворачивай назад. Выясни, как её преодолеть.",
    author: "Майкл Джордан"
  },
  {
    text: "Боль временна. Она может длиться минуту, час, день или год, но в конце концов она утихнет, и что-то другое займет ее место. Если я сдамся, она будет длиться вечно.",
    author: "Лэнс Армстронг"
  }
];


export function MotivationalQuote() {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    // This runs only on the client, after hydration, to avoid server-client mismatch
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!quote.text) {
    return null; // Or a loading skeleton
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
            Цитата дня
        </CardTitle>
        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 pl-4 italic">
            "{quote.text}"
        </blockquote>
        <p className="mt-2 text-right text-sm text-muted-foreground">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
