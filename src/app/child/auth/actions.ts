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

        // 1. Find the caregiver first
        const caregiverQuery = query(collection(db, "caregiver"));
        const caregiverSnapshot = await getDocs(caregiverQuery);
        
        let foundCaregiverDoc = null;
        if (!caregiverSnapshot.empty) {
            for (const doc of caregiverSnapshot.docs) {
                const caregiverData = doc.data();
                const docName = caregiverData.name || caregiverData.Name || caregiverData.caregiverName || caregiverData.fullName;
                if (docName && docName.trim().toLowerCase() === inputCaregiverName) {
                    foundCaregiverDoc = doc;
                    break;
                }
            }
        }

        if (!foundCaregiverDoc) {
            return { message: 'Caregiver name not found. Please check the spelling.' };
        }
        
        const caregiverId = foundCaregiverDoc.id;

        // 2. Find the child associated with that caregiver
        const childrenQuery = query(
            collection(db, "children"), 
            where("caregiverId", "==", caregiverId)
        );
        const childrenSnapshot = await getDocs(childrenQuery);

        if (childrenSnapshot.empty) {
             return { message: 'No children found for the specified caregiver.' };
        }

        let foundChildDoc = null;
        for (const doc of childrenSnapshot.docs) {
            const childData = doc.data();
            const docName = childData.name || childData.Name;
             if (docName && docName.trim().toLowerCase() === inputName) {
                foundChildDoc = doc;
                break;
            }
        }

        if (!foundChildDoc) {
            return { message: `Could not find a child named '${name}' for caregiver '${caregiverName}'.` };
        }

        const childData = foundChildDoc.data();
        const child: Child = {
            id: foundChildDoc.id,
            name: childData.name || childData.Name || 'Unnamed Child',
            age: childData.age,
            disability: childData.disability,
            profilePhoto: childData.profilePhoto,
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
