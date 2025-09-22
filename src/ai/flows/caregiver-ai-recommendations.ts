'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-driven recommendations to caregivers on the dashboard.
 *
 * - `getCaregiverRecommendations` -  A function that generates personalized learning path recommendations for caregivers.
 * - `CaregiverRecommendationsInput` - The input type for the `getCaregiverRecommendations` function.
 * - `CaregiverRecommendationsOutput` - The return type for the `getCaregiverRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CaregiverRecommendationsInputSchema = z.object({
  childId: z.string().describe('The ID of the child.'),
  childAgeMonths: z.number().describe('The age of the child in months'),
  disabilityType: z.string().describe('The type of disability the child has (e.g., autism, ADHD, LD).'),
  currentExercises: z.array(z.string()).describe('List of exercise IDs the child is currently doing.'),
  performanceData: z.record(z.any()).describe('A JSON object containing the child’s performance data on various exercises.'),
});
export type CaregiverRecommendationsInput = z.infer<typeof CaregiverRecommendationsInputSchema>;

const CaregiverRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      exerciseId: z.string().describe('The ID of the recommended exercise.'),
      reason: z.string().describe('The reason for recommending this exercise.'),
      difficulty: z.string().describe('Suggested difficulty level.'),
    })
  ).describe('A list of AI-driven exercise recommendations for the child.'),
});
export type CaregiverRecommendationsOutput = z.infer<typeof CaregiverRecommendationsOutputSchema>;

export async function getCaregiverRecommendations(input: CaregiverRecommendationsInput): Promise<CaregiverRecommendationsOutput> {
  return caregiverRecommendationsFlow(input);
}

const caregiverRecommendationsPrompt = ai.definePrompt({
  name: 'caregiverRecommendationsPrompt',
  input: {schema: CaregiverRecommendationsInputSchema.extend({
    performanceDataString: z.string(),
  })},
  output: {schema: CaregiverRecommendationsOutputSchema},
  prompt: `You are an AI assistant that generates personalized learning path recommendations for caregivers to better support their child's cognitive development.

  Based on the following information about the child:
  - Child ID: {{{childId}}}
  - Child Age (months): {{{childAgeMonths}}}
  - Disability Type: {{{disabilityType}}}
  - Current Exercises: {{#each currentExercises}}{{{this}}}, {{/each}}
  - Performance Data: {{{performanceDataString}}}

  Provide a list of exercise recommendations (exerciseId, reason, difficulty) tailored to the child's needs and performance.
  Ensure the recommendations are appropriate for their age and disability type, and consider their current exercises and performance data.
  The difficulty should be one of Easy, Medium, or Hard.
  `, 
});

const caregiverRecommendationsFlow = ai.defineFlow(
  {
    name: 'caregiverRecommendationsFlow',
    inputSchema: CaregiverRecommendationsInputSchema,
    outputSchema: CaregiverRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await caregiverRecommendationsPrompt({
      ...input,
      performanceDataString: JSON.stringify(input.performanceData),
    });
    return output!;
  }
);
