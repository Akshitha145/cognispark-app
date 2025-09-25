
'use server';

import type { Caregiver, Child } from '@/lib/types';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCaregiverData } from '@/lib/data';

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
        
        if (name.toLowerCase() !== 'maria') {
            return { message: 'Caregiver name not found. Please check the spelling. Hint: try "Maria".' };
        }

        const caregiverData = await getCaregiverData(name);

        if (!caregiverData) {
             return { message: 'Could not retrieve caregiver data.' };
        }
        
        return {
            message: "success",
            caregiver: caregiverData.caregiver,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
