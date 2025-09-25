
'use server';

import type { Caregiver, Child } from '@/lib/types';
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
        
        if (name.toLowerCase() !== 'maria') {
            return { message: 'Caregiver name not found. Please check the spelling and try again. Note: valid caregiver is "Maria".' };
        }

        const children: Child[] = [
            { id: 'child1', name: 'Alex', age: 8, disability: 'ADHD', profilePhoto: `https://picsum.photos/seed/1/150/150`, caregiverId: 'caregiver1' },
            { id: 'child2', name: 'Bella', age: 7, disability: 'Autism', profilePhoto: `https://picsum.photos/seed/2/150/150`, caregiverId: 'caregiver1' },
            { id: 'child3', name: 'Charlie', age: 9, disability: 'Dyslexia', profilePhoto: `https://picsum.photos/seed/3/150/150`, caregiverId: 'caregiver1' }
        ];

        const caregiver: Caregiver = {
            id: 'caregiver1',
            name: 'Maria',
            email: 'maria@example.com',
            profilePhoto: `https://picsum.photos/seed/4/150/150`,
            children: children
        };
        
        return {
            message: "success",
            caregiver: caregiver,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
