
'use server';

import { db } from '@/lib/firebase';
import type { Child } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { z } from 'zod';

const authenticateChildSchema = z.object({
    name: z.string().trim().min(1, { message: 'Your name cannot be empty.' }),
    caregiverName: z.string().trim().min(1, { message: "Caretaker's name cannot be empty." }),
});

export type AuthFormState = {
    message: string;
    child?: Child;
} | null;


export async function authenticateChild(
    prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    const validatedFields = authenticateChildSchema.safeParse({
        name: formData.get('name'),
        caregiverName: formData.get('caregiverName'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.caregiverName?.[0] || 'Invalid data provided.',
        };
    }

    try {
        const { name, caregiverName } = validatedFields.data;
        const inputName = name.trim().toLowerCase();
        const inputCaregiverName = caregiverName.trim().toLowerCase();

        // For this simplified version, we'll use hardcoded data.
        const validCaregivers = ['maria'];
        const validChildren = [
            { id: 'child1', name: 'alex', caregiver: 'maria', age: 8, disability: 'ADHD', profilePhoto: 'https://picsum.photos/seed/1/150/150' },
            { id: 'child2', name: 'bella', caregiver: 'maria', age: 7, disability: 'Autism', profilePhoto: 'https://picsum.photos/seed/2/150/150' },
            { id: 'child3', name: 'charlie', caregiver: 'maria', age: 9, disability: 'Dyslexia', profilePhoto: 'https://picsum.photos/seed/3/150/150' },
        ];
        
        if (!validCaregivers.includes(inputCaregiverName)) {
            return { message: 'Caregiver name not found. Please check the spelling. Hint: try "Maria".' };
        }
        
        const foundChild = validChildren.find(c => c.name === inputName && c.caregiver === inputCaregiverName);

        if (!foundChild) {
            return { message: `Could not find a child named '${name}' for caregiver '${caregiverName}'. Hint: try "Alex".` };
        }

        const child: Child = {
            id: foundChild.id,
            name: name, // Keep original capitalization for display
            age: foundChild.age,
            disability: foundChild.disability,
            profilePhoto: foundChild.profilePhoto,
        };

        return {
            message: "success",
            child: child,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
