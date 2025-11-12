'use server';

import { generatePersonalizedTrainingRecommendations } from '@/ai/flows/generate-personalized-training-recommendations';
import type { TrainingRecommendationsInput } from '@/ai/flows/generate-personalized-training-recommendations';
import { z } from 'zod';

const recommendationSchema = z.object({
  athleteId: z.string().min(1, 'ID атлета обязательно.'),
  performanceData: z.string().min(1, 'Данные о производительности обязательны.'),
  attendanceRate: z.number().min(0).max(1),
  includeDietaryTips: z.boolean(),
  includeMentalWellnessTips: z.boolean(),
});

export type FormState = {
  message: string;
  recommendations?: string;
  fields?: {
    performanceData?: string;
  };
  issues?: string[];
};

export async function getRecommendations(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = recommendationSchema.safeParse({
    ...formData,
    attendanceRate: Number(formData.attendanceRate),
    includeDietaryTips: formData.includeDietaryTips === 'on',
    includeMentalWellnessTips: formData.includeMentalWellnessTips === 'on',
  });

  if (!parsed.success) {
    return {
      message: 'Неверные данные формы.',
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // Validate that performanceData is valid JSON
  try {
    JSON.parse(parsed.data.performanceData);
  } catch (e) {
    return {
      message: 'Неверные данные формы.',
      issues: ['Данные о производительности должны быть в формате JSON.'],
    };
  }

  const {
    athleteId,
    performanceData,
    attendanceRate,
    includeDietaryTips,
    includeMentalWellnessTips,
  } = parsed.data;

  const preferences = JSON.stringify({
    includeDietaryTips,
    includeMentalWellnessTips,
  });

  const input: TrainingRecommendationsInput = {
    athleteId,
    performanceData,
    attendanceRate,
    preferences,
  };

  try {
    const result = await generatePersonalizedTrainingRecommendations(input);
    if (result.recommendations) {
      return {
        message: 'success',
        recommendations: result.recommendations,
        fields: {
          performanceData: parsed.data.performanceData,
        }
      };
    } else {
      return { message: 'Не удалось получить рекомендации. Результат пуст.' };
    }
  } catch (error) {
    console.error(error);
    return { message: 'На сервере произошла непредвиденная ошибка.' };
  }
}
