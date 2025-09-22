'use server';

/**
 * @fileOverview This file defines a Genkit flow for personalized exercise adaptation.
 *
 * The flow dynamically adjusts exercise difficulty and type based on real-time user performance, providing a personalized learning experience.
 * It uses an LLM to reason about the appropriate difficulty level.
 *
 * - `adaptExercise` - A function that takes exercise performance data and returns an adjusted exercise configuration.
 * - `PersonalizedExerciseAdaptationInput` - The input type for the adaptExercise function.
 * - `PersonalizedExerciseAdaptationOutput` - The return type for the adaptExercise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedExerciseAdaptationInputSchema = z.object({
  exerciseType: z.string().describe('The type of exercise the user is currently performing (e.g., memory, attention, problem-solving).'),
  currentDifficulty: z.string().describe('The current difficulty level of the exercise (e.g., easy, medium, hard).'),
  userPerformance: z.number().describe('The user performance on the current exercise, as a percentage (0-100).'),
  recentExercises: z.array(z.object({
    exerciseType: z.string(),
    difficulty: z.string(),
    performance: z.number(),
  })).describe('A list of the user\'s recent exercise history, including exercise type, difficulty, and performance.'),
});
export type PersonalizedExerciseAdaptationInput = z.infer<typeof PersonalizedExerciseAdaptationInputSchema>;

const PersonalizedExerciseAdaptationOutputSchema = z.object({
  newDifficulty: z.string().describe('The recommended new difficulty level for the next exercise (e.g., easy, medium, hard).'),
  reasoning: z.string().describe('The AI\'s reasoning for the recommended difficulty adjustment.'),
});
export type PersonalizedExerciseAdaptationOutput = z.infer<typeof PersonalizedExerciseAdaptationOutputSchema>;

export async function adaptExercise(input: PersonalizedExerciseAdaptationInput): Promise<PersonalizedExerciseAdaptationOutput> {
  return personalizedExerciseAdaptationFlow(input);
}

const exerciseAdaptationPrompt = ai.definePrompt({
  name: 'exerciseAdaptationPrompt',
  input: {schema: PersonalizedExerciseAdaptationInputSchema},
  output: {schema: PersonalizedExerciseAdaptationOutputSchema},
  prompt: `You are an AI learning assistant that personalizes exercises for children with learning disabilities.

You will receive information about the user's current exercise, their performance, and their recent exercise history.
Based on this information, you will determine the appropriate difficulty level for the next exercise.

Consider the following factors when determining the new difficulty level:
* If the user's performance is consistently high (above 80%), increase the difficulty.
* If the user's performance is consistently low (below 50%), decrease the difficulty.
* If the user's performance is erratic, maintain the current difficulty or make small adjustments.
* Take into account the user's recent exercise history to identify patterns and trends.

Exercise Type: {{{exerciseType}}}
Current Difficulty: {{{currentDifficulty}}}
User Performance: {{{userPerformance}}}%
Recent Exercises: {{#each recentExercises}}{{{exerciseType}}} ({{{difficulty}}}): {{{performance}}}% {{/each}}

Based on this information, what should the new difficulty level be, and why?

{{#if recentExercises}}
Given the student has completed these recent exercises, their personalized plan should now be re-evaluated to make sure the student is not overwhelmed or underwhelmed by the material.
{{/if}}

New Difficulty:`,
});

const personalizedExerciseAdaptationFlow = ai.defineFlow(
  {
    name: 'personalizedExerciseAdaptationFlow',
    inputSchema: PersonalizedExerciseAdaptationInputSchema,
    outputSchema: PersonalizedExerciseAdaptationOutputSchema,
  },
  async input => {
    const {output} = await exerciseAdaptationPrompt(input);
    return output!;
  }
);
