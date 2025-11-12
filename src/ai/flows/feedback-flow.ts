'use server';
/**
 * @fileOverview An AI flow for analyzing user feedback.
 *
 * - getFeedback - A function that handles the feedback analysis process.
 * - FeedbackInput - The input type for the getFeedback function.
 * - FeedbackOutput - The return type for the getFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FeedbackInputSchema = z.object({
  feedbackText: z.string().describe('The user-submitted feedback text.'),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

const FeedbackOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis and response to the user's feedback, formatted as Markdown."),
});
export type FeedbackOutput = z.infer<typeof FeedbackOutputSchema>;

export async function getFeedback(input: FeedbackInput): Promise<FeedbackOutput> {
  return feedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: { schema: FeedbackInputSchema },
  output: { schema: FeedbackOutputSchema },
  prompt: `You are an expert AI sports coach and motivational assistant for an athletics team.
Your task is to analyze feedback from an athlete and provide a thoughtful, structured, and helpful response in Russian.

The user has provided the following feedback:
"{{{feedbackText}}}"

Your response must be formatted as Markdown and should include the following sections:

1.  **Благодарность и подтверждение:** Start by thanking the athlete for their feedback and confirm that you've understood their main point.
2.  **Анализ и эмпатия:** Show empathy. Acknowledge their feelings or perspective. Briefly break down the potential reasons behind their feedback (e.g., signs of overtraining if they mention fatigue, or the value of a suggestion if they propose an idea).
3.  **Конкретные рекомендации или план действий:** This is the most important part.
    *   If the feedback is about difficulty (e.g., "too hard"), suggest specific, actionable adjustments to their training plan for the next week. For example, suggest reducing intensity, adding a recovery day, or focusing on specific techniques.
    *   If the feedback is a suggestion (e.g., "more flexibility exercises"), incorporate it into a sample plan. Validate their idea and show how it can be integrated.
    *   If the feedback is positive, reinforce the behavior and explain why it's beneficial.
4.  **Мотивационное заключение:** End with an encouraging and motivational closing statement.

Example for "Тренировки слишком тяжелые, я устал":

### Спасибо за ваш отзыв!

Я вас услышал. Очень важно прислушиваться к своему телу, и я рад, что вы поделились своими ощущениями. Усталость — это сигнал, который нельзя игнорировать.

**Анализ ситуации:**
Похоже, что накопившаяся нагрузка превышает вашу текущую способность к восстановлению. Это может привести к перетренированности, что снизит ваши результаты и повысит риск травм. Наша цель — становиться сильнее, а не истощать себя.

**Рекомендации на следующую неделю:**
Давайте скорректируем план, чтобы дать вашему организму время на адаптацию:
*   **Снижение интенсивности:** На следующей неделе выполните все интервальные и скоростные работы на 75-80% от максимальной интенсивности.
*   **Дополнительный день отдыха:** Замените одну из тренировок на легкую восстановительную активность: 30-минутная прогулка, растяжка или плавание.
*   **Фокус на сне:** Старайтесь спать не менее 8 часов в сутки. Это критически важно для восстановления.

**Заключение:**
Помните, отдых — это такая же важная часть тренировочного процесса, как и сама нагрузка. Правильное восстановление сделает вас только сильнее. Прислушивайтесь к себе и не стесняйтесь сообщать о своем состоянии.

---
Generate a response for the user's feedback now.`,
});

const feedbackFlow = ai.defineFlow(
  {
    name: 'feedbackFlow',
    inputSchema: FeedbackInputSchema,
    outputSchema: FeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
