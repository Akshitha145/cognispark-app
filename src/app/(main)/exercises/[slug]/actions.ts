'use server';

import { adaptExercise, PersonalizedExerciseAdaptationInput } from '@/ai/flows/personalized-exercise-adaptation.ts';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const getAdaptedExerciseSchema = z.object({
    exerciseType: z.string(),
    currentDifficulty: z.string(),
    userPerformance: z.number().min(0).max(100),
});

export type FormState = {
    message: string;
    fields?: Record<string, string>;
    result?: {
        newDifficulty: string;
        reasoning: string;
    };
} | null;


export async function getAdaptedExercise(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = getAdaptedExerciseSchema.safeParse({
        exerciseType: formData.get('exerciseType'),
        currentDifficulty: formData.get('currentDifficulty'),
        userPerformance: Number(formData.get('userPerformance')),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            fields: {
                ...Object.fromEntries(formData.entries()) as any,
            },
        };
    }
    
    try {
        const input: PersonalizedExerciseAdaptationInput = {
            ...validatedFields.data,
            recentExercises: [
                { exerciseType: 'Memory Match', difficulty: 'easy', performance: 90 },
                { exerciseType: 'Pattern Puzzles', difficulty: 'medium', performance: 75 },
            ],
        };

        const result = await adaptExercise(input);
        
        return {
            message: "success",
            result: {
                newDifficulty: result.newDifficulty,
                reasoning: result.reasoning,
            }
        };

    } catch (e) {
        console.error(e);
        return { message: 'An error occurred while adapting the exercise.' };
    }
}


const saveGameSessionSchema = z.object({
    childId: z.string(),
    exerciseId: z.string(),
    score: z.number(),
    difficulty: z.string(),
});

export async function saveGameSession(data: {
    childId: string;
    exerciseId: string;
    score: number;
    difficulty: string;
}) {
    const validatedFields = saveGameSessionSchema.safeParse(data);

    if (!validatedFields.success) {
        console.error('Invalid game session data:', validatedFields.error);
        return { success: false, message: 'Invalid data provided.' };
    }

    try {
        await addDoc(collection(db, 'gameSessions'), {
            ...validatedFields.data,
            timestamp: serverTimestamp(),
        });
        return { success: true, message: 'Game session saved successfully.' };
    } catch (error) {
        console.error('Error saving game session:', error);
        return { success: false, message: 'Failed to save game session.' };
    }
}