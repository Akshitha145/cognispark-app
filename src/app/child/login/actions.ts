
'use server';

import { db } from '@/lib/firebase';
import type { Child } from '@/lib/types';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const registerChildSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    caregiverName: z.string().min(2, { message: "Caretaker's name must be at least 2 characters." }),
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
        caregiverName: formData.get('caregiverName'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid data provided.',
            fields: Object.fromEntries(formData.entries()) as any,
        };
    }
    
    try {
        const { name, caregiverName } = validatedFields.data;

        // Step 1: Find the caregiver by name (case-insensitive).
        const caregiverQuery = query(collection(db, "caregiver"));
        const caregiverSnapshot = await getDocs(caregiverQuery);

        if (caregiverSnapshot.empty) {
            return { message: 'No caregiver profiles found in the database. A caregiver must sign up first.' };
        }

        let foundCaregiverDoc = null;
        for (const doc of caregiverSnapshot.docs) {
            const caregiverData = doc.data();
            const docName = caregiverData.Name || caregiverData.name;
            if (docName && docName.toLowerCase() === caregiverName.toLowerCase()) {
                foundCaregiverDoc = doc;
                break;
            }
        }

        if (!foundCaregiverDoc) {
             return { message: 'Caretaker name not found. Please check the spelling and try again.' };
        }
        
        const caregiverId = foundCaregiverDoc.id;
        
        // Add the new child document to the 'children' collection
        const childDocRef = await addDoc(collection(db, 'children'), {
            name: name,
            age: 7, // Default age, can be updated later
            caregiverId: caregiverId,
            disability: 'N/A', // Default value
            profilePhoto: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/150/150`,
        });

        const newChild: Child = {
            id: childDocRef.id,
            name: name,
            age: 7,
            disability: 'N/A',
            profilePhoto: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/150/150`,
        };

        revalidatePath('/');
        revalidatePath('/child');

        return {
            message: "success",
            child: newChild,
        };

    } catch (e: any) {
        console.error(e);
        return { message: e.message || 'An error occurred during registration.' };
    }
}
