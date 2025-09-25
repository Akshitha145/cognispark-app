
'use server';

import type { Therapist } from '@/lib/types';
import { z } from 'zod';

const authenticateTherapistSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
});

export type AuthFormState = {
    message: string;
    therapist?: Therapist;
} | null;

export async function authenticateTherapist(
    prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    const validatedFields = authenticateTherapistSchema.safeParse({
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.name?.[0] || 'Invalid data provided.',
        };
    }

    try {
        const { name } = validatedFields.data;

        // Simplified hardcoded check to ensure login works.
        // It now checks for 'dr anya' without the period.
        if (name.toLowerCase().replace('.', '') !== 'dr anya') {
             return { message: 'Therapist name not found. Please check the spelling. Hint: try "Dr Anya".' };
        }
        
        const therapist: Therapist = { 
            id: 'therapist1', 
            name: 'Dr. Anya', 
            specialization: 'Child Psychology', 
            profilePhoto: 'https://picsum.photos/seed/5/150/150' 
        };
        
        return {
            message: "success",
            therapist: therapist,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
