'use server';

import { generatePersonalizedTrainingRecommendations } from '@/ai/flows/generate-personalized-training-recommendations';
import type { TrainingRecommendationsInput } from '@/ai/flows/generate-personalized-training-recommendations';
import { z } from 'zod';

const recommendationSchema = z.object({
  athleteId: z.string().min(1, 'Athlete ID is required.'),
  performanceData: z.string().min(1, 'Performance data is required.'),
  attendanceRate: z.number().min(0).max(1),
  includeDietaryTips: z.boolean(),
  includeMentalWellnessTips: z.boolean(),
});

export type FormState = {
  message: string;
  recommendations?: string;
  fields?: Record<string, string>;
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
      message: 'Invalid form data.',
      issues: parsed.error.issues.map((issue) => issue.message),
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
      };
    } else {
      return { message: 'Failed to get recommendations. The result was empty.' };
    }
  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred on the server.' };
  }
}
