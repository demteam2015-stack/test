'use server';
/**
 * @fileOverview Генерирует персональные рекомендации по тренировкам для спортсменов на основе их данных о производительности и посещаемости.
 *
 * - generatePersonalizedTrainingRecommendations - Функция, которая генерирует рекомендации по тренировкам.
 * - TrainingRecommendationsInput - Входной тип для функции generatePersonalizedTrainingRecommendations.
 * - TrainingRecommendationsOutput - Возвращаемый тип для функции generatePersonalizedTrainingRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingRecommendationsInputSchema = z.object({
  athleteId: z.string().describe('Уникальный идентификатор спортсмена.'),
  performanceData: z.string().describe('Исторические данные о производительности спортсмена, представленные в виде строки JSON.'),
  attendanceRate: z.number().describe('Посещаемость спортсмена (от 0 до 1).'),
  preferences: z.string().describe('Предпочтения спортсмена, представленные в виде строки JSON.'),
});
export type TrainingRecommendationsInput = z.infer<typeof TrainingRecommendationsInputSchema>;

const TrainingRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Персональные рекомендации по тренировкам для спортсмена.'),
});
export type TrainingRecommendationsOutput = z.infer<typeof TrainingRecommendationsOutputSchema>;


const incorporateAdditionalInfoTool = ai.defineTool({
  name: 'incorporateAdditionalInfo',
  description: 'Этот инструмент проверяет предпочтения спортсмена, чтобы определить, следует ли включать в рекомендации по тренировкам дополнительную информацию, такую как советы по питанию или психическому здоровью.',
  inputSchema: z.object({
    preferences: z.string().describe('Предпочтения спортсмена в виде строки JSON.'),
    recommendations: z.string().describe('Текущие рекомендации по тренировкам.'),
  }),
  outputSchema: z.string().describe('Обновленные рекомендации по тренировкам с дополнительной информацией, если применимо.'),
},
async (input) => {
  const preferences = JSON.parse(input.preferences);
  let recommendations = input.recommendations;

  if (preferences.includeDietaryTips) {
    recommendations += '\n\nСовет по питанию: Рассмотрите возможность включения в свой рацион большего количества продуктов, богатых белком, для поддержки восстановления мышц.';
  }

  if (preferences.includeMentalWellnessTips) {
    recommendations += '\n\nСовет по психическому здоровью: Практикуйте осознанность и медитацию для снижения стресса и улучшения концентрации.';
  }

  return recommendations;
});

const trainingRecommendationsPrompt = ai.definePrompt({
  name: 'trainingRecommendationsPrompt',
  input: {schema: TrainingRecommendationsInputSchema},
  output: {schema: TrainingRecommendationsOutputSchema},
  tools: [incorporateAdditionalInfoTool],
  prompt: `Вы - экспертный AI-ассистент по тренировкам. Ваша цель - предоставлять персонализированные рекомендации по тренировкам для спортсменов на основе их данных о производительности, посещаемости и предпочтений.

  ID спортсмена: {{{athleteId}}}
  Данные о производительности: {{{performanceData}}}
  Посещаемость: {{{attendanceRate}}}

  На основе этой информации предоставьте подробные и действенные рекомендации по тренировкам.
  Учитывайте посещаемость при составлении рекомендаций; предлагайте альтернативные упражнения, если посещаемость низкая.

  Затем определите, есть ли дополнительная информация для предоставления, используя инструмент incorporateAdditionalInfo, чтобы определить, следует ли включать в рекомендации по тренировкам дополнительную информацию, такую как советы по питанию или психическому здоровью. Передайте предпочтения \"{{{preferences}}}\" и текущие рекомендации в инструмент. Обязательно следуйте предоставленным вам правилам использования инструмента.
  `,
});


const generatePersonalizedTrainingRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedTrainingRecommendationsFlow',
    inputSchema: TrainingRecommendationsInputSchema,
    outputSchema: TrainingRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await trainingRecommendationsPrompt(input);
    return output!;
  }
);


export async function generatePersonalizedTrainingRecommendations(input: TrainingRecommendationsInput): Promise<TrainingRecommendationsOutput> {
  return generatePersonalizedTrainingRecommendationsFlow(input);
}

export type { TrainingRecommendationsInput, TrainingRecommendationsOutput };
