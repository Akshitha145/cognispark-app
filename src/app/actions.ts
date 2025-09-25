
'use server';

import { db } from '@/lib/firebase';
import type { Child } from '@/lib/types';
import { collection, getDocs, query } from 'firebase/firestore';
import { z } from 'zod';

const authenticateChildSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
    caregiverName: z.string().trim().min(1, { message: 'Caretaker Name cannot be empty.' }),
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
        const errors = validatedFields.error.flatten().fieldErrors;
        return {
            message: errors.name?.[0] || errors.caregiverName?.[0] || 'Invalid data provided.',
        };
    }

    try {
        const { name, caregiverName } = validatedFields.data;

        // Step 1: Find the caregiver by name (case-insensitive).
        const caregiverQuery = query(collection(db, "caregiver"));
        const caregiverSnapshot = await getDocs(caregiverQuery);

        if (caregiverSnapshot.empty) {
            return { message: 'No caregiver profiles found in the database. Please contact support.' };
        }

        let foundCaregiverDoc = null;
        for (const doc of caregiverSnapshot.docs) {
            const caregiverData = doc.data();
            const docCaregiverName = caregiverData.Name || caregiverData.name;
            if (docCaregiverName && docCaregiverName.toLowerCase() === caregiverName.toLowerCase()) {
                foundCaregiverDoc = doc;
                break;
            }
        }

        if (!foundCaregiverDoc) {
             return { message: 'Caretaker name not found. Please check the spelling and try again.' };
        }
        
        const caregiverId = foundCaregiverDoc.id;

        // Step 2: Find the child with the matching name and caregiverId (case-insensitive).
        const childQuery = query(collection(db, "children"));
        const childSnapshot = await getDocs(childQuery);

        if (childSnapshot.empty) {
            return { message: 'No children found in the database.' };
        }

        let foundChildDoc = null;
        for (const doc of childSnapshot.docs) {
            const childData = doc.data();
            const docChildName = childData.name || childData.Name;
            const docCaregiverId = childData.caregiverId;

            if (docChildName && docChildName.toLowerCase() === name.toLowerCase() && docCaregiverId === caregiverId) {
                foundChildDoc = doc;
                break;
            }
        }

        if (!foundChildDoc) {
            return { message: 'Your name was not found for the provided Caretaker. Please check your details.' };
        }

        const childData = foundChildDoc.data();
        const child: Child = {
            id: foundChildDoc.id,
            name: childData.name || childData.Name,
            age: childData.age,
            disability: childData.disability,
            profilePhoto: childData.profilePhoto,
        };

        return {
            message: "success",
            child: child,
        };

    } catch (e: any) {
        console.error(e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
