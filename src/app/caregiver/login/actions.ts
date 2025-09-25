
'use server';

import { getCaregiverData } from '@/lib/data';
import type { Caregiver } from '@/lib/types';
import { z } from 'zod';

const authenticateCaregiverSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
});

export type AuthFormState = {
    message: string;
    caregiver?: Caregiver;
} | null;

export async function authenticateCaregiver(
    prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    const validatedFields = authenticateCaregiverSchema.safeParse({
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.name?.[0] || 'Invalid data provided.',
        };
    }

    try {
        const { name } = validatedFields.data;
        const result = await getCaregiverData(name);

        if (!result) {
            return { message: 'Caregiver name not found. Please check the spelling and try again. Note: valid caregiver is "Maria".' };
        }
        
        return {
            message: "success",
            caregiver: result.caregiver,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
