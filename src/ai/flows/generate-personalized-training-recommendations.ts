'use server';
/**
 * @fileOverview Generates personalized training recommendations for athletes based on their performance data and attendance.
 *
 * - generatePersonalizedTrainingRecommendations - A function that generates training recommendations.
 * - TrainingRecommendationsInput - The input type for the generatePersonalizedTrainingRecommendations function.
 * - TrainingRecommendationsOutput - The return type for the generatePersonalizedTrainingRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingRecommendationsInputSchema = z.object({
  athleteId: z.string().describe('The unique identifier of the athlete.'),
  performanceData: z.string().describe('The athlete historical performance data, represented as a JSON string.'),
  attendanceRate: z.number().describe('The attendance rate of the athlete (0 to 1).'),
  preferences: z.string().describe('The athlete preferences, represented as a JSON string.'),
});
export type TrainingRecommendationsInput = z.infer<typeof TrainingRecommendationsInputSchema>;

const TrainingRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('The personalized training recommendations for the athlete.'),
});
export type TrainingRecommendationsOutput = z.infer<typeof TrainingRecommendationsOutputSchema>;


const incorporateAdditionalInfoTool = ai.defineTool({
  name: 'incorporateAdditionalInfo',
  description: 'This tool checks athlete preferences to determine if additional information, such as dietary or mental wellness tips, should be included in the training recommendations.',
  inputSchema: z.object({
    preferences: z.string().describe('The athlete preferences as a JSON string.'),
    recommendations: z.string().describe('The current training recommendations.'),
  }),
  outputSchema: z.string().describe('The updated training recommendations with additional information, if applicable.'),
},
async (input) => {
  const preferences = JSON.parse(input.preferences);
  let recommendations = input.recommendations;

  if (preferences.includeDietaryTips) {
    recommendations += '\n\nDietary Tip: Consider incorporating more protein-rich foods into your diet to support muscle recovery.';
  }

  if (preferences.includeMentalWellnessTips) {
    recommendations += '\n\nMental Wellness Tip: Practice mindfulness and meditation to reduce stress and improve focus.';
  }

  return recommendations;
});

const trainingRecommendationsPrompt = ai.definePrompt({
  name: 'trainingRecommendationsPrompt',
  input: {schema: TrainingRecommendationsInputSchema},
  output: {schema: TrainingRecommendationsOutputSchema},
  tools: [incorporateAdditionalInfoTool],
  prompt: `You are an expert AI training assistant. Your goal is to provide personalized training recommendations to athletes based on their performance data, attendance, and preferences.

  Athlete ID: {{{athleteId}}}
  Performance Data: {{{performanceData}}}
  Attendance Rate: {{{attendanceRate}}}

  Based on this information, provide detailed and actionable training recommendations.
  Consider the attendance rate when making the recommendations; suggest alternative exercises if attendance is low.

  Then, determine if there is additional information to provide using the incorporateAdditionalInfo tool to determine if additional information, such as dietary or mental wellness tips, should be included in the training recommendations. Pass the preferences \"{{{preferences}}}\" and current recommendations into the tool. Be sure to follow the tool use rules you were provided.
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
