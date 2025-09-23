
'use server';

import { db } from '@/lib/firebase';
import type { Child } from '@/lib/types';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const registerChildSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    age: z.coerce.number().min(3, { message: 'You must be at least 3 years old to play.' }),
});

export type FormState = {
    message: string;
    fields?: Record<string, string>;
    child?: Child;
} | null;


export async function registerChild(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = registerChildSchema.safeParse({
        name: formData.get('name'),
        age: formData.get('age'),
    });

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.name?.[0] || validatedFields.error.flatten().fieldErrors.age?.[0] || 'Invalid data.',
            fields: {
                ...Object.fromEntries(formData.entries()) as any,
            },
        };
    }
    
    try {
        // Find the first caregiver to associate the child with.
        const caregiverQuery = query(collection(db, "caregiver"), limit(1));
        const caregiverSnapshot = await getDocs(caregiverQuery);

        if (caregiverSnapshot.empty) {
            return { message: 'Could not find a caregiver profile. Please ask your caregiver to sign up first.' };
        }
        const caregiverId = caregiverSnapshot.docs[0].id;
        
        // Add the new child document to the 'children' collection
        const childDocRef = await addDoc(collection(db, 'children'), {
            name: validatedFields.data.name,
            age: validatedFields.data.age,
            caregiverId: caregiverId,
            disability: 'N/A', // Default value
            profilePhoto: `https://picsum.photos/seed/${validatedFields.data.name}/150/150`,
        });

        const newChild: Child = {
            id: childDocRef.id,
            ...validatedFields.data,
            disability: 'N/A',
            profilePhoto: `https://picsum.photos/seed/${validatedFields.data.name}/150/150`,
        };

        // Revalidate path to ensure new child shows up on other lists if needed.
        revalidatePath('/');

        return {
            message: "success",
            child: newChild,
        };

    } catch (e: any) {
        console.error(e);
        return { message: e.message || 'An error occurred during registration.' };
    }
}
