
'use server';

import type { Caregiver, Child } from '@/lib/types';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const authenticateCaregiverSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
});

export type AuthFormState = {
    message: string;
    caregiver?: Caregiver;
} | null;

async function findCaregiverByName(name: string): Promise<(Caregiver & { children: Child[] }) | null> {
    const caregiversCollection = collection(db, "caregiver");
    const nameFieldsToTry = ['name', 'Name', 'caregiverName', 'fullName'];

    let foundCaregiverDoc = null;

    // Firestore queries are case-sensitive. We can try a few common cases.
    const nameVariations = [name, name.toLowerCase(), name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
    const uniqueNameVariations = [...new Set(nameVariations)]; // Remove duplicates

    for (const field of nameFieldsToTry) {
        for (const nameVar of uniqueNameVariations) {
            const q = query(caregiversCollection, where(field, "==", nameVar));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                foundCaregiverDoc = { id: doc.id, ...doc.data() };
                break;
            }
        }
        if (foundCaregiverDoc) break;
    }
    
    if (!foundCaregiverDoc) return null;

    // Fetch associated children
    const childrenQuery = query(collection(db, 'children'), where('caregiverId', '==', foundCaregiverDoc.id));
    const childrenSnapshot = await getDocs(childrenQuery);
    const children: Child[] = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));

    return {
        id: foundCaregiverDoc.id,
        name: foundCaregiverDoc.name || foundCaregiverDoc.Name,
        email: foundCaregiverDoc.email,
        profilePhoto: foundCaregiverDoc.profilePhoto || `https://picsum.photos/seed/${foundCaregiverDoc.id}/150/150`,
        children: children
    };
}


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
        const caregiver = await findCaregiverByName(name);

        if (!caregiver) {
            return { message: 'Caregiver name not found. Please check the spelling and try again.' };
        }
        
        return {
            message: "success",
            caregiver: caregiver,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
