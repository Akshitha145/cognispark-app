
'use server';

import type { Therapist } from '@/lib/types';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const authenticateTherapistSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
});

export type AuthFormState = {
    message: string;
    therapist?: Therapist;
} | null;


async function findTherapistByName(name: string): Promise<Therapist | null> {
    const therapistsCollection = collection(db, "therapist");
    const nameFieldsToTry = ['name', 'Name', 'therapistName', 'fullName'];

    let foundTherapistDoc = null;
    
    // Firestore queries are case-sensitive. We can try a few common cases.
    const nameVariations = [name, name.toLowerCase(), name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
    const uniqueNameVariations = [...new Set(nameVariations)]; // Remove duplicates, e.g. if name is already lowercase

    for (const field of nameFieldsToTry) {
        for (const nameVar of uniqueNameVariations) {
            const q = query(therapistsCollection, where(field, "==", nameVar));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                foundTherapistDoc = { id: doc.id, ...doc.data() };
                break;
            }
        }
        if (foundTherapistDoc) break;
    }

    if (!foundTherapistDoc) {
        // Hardcoded fallback for demonstration if Firestore is empty
        const therapists: Therapist[] = [
            { id: 'therapist1', name: 'Dr. Anya', specialization: 'Child Psychology', profilePhoto: 'https://picsum.photos/seed/5/150/150' },
            { id: 'therapist2', name: 'Dr. Ben', specialization: 'Behavioral Therapy', profilePhoto: 'https://picsum.photos/seed/6/150/150' }
        ];
        return therapists.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
    }

    return {
        id: foundTherapistDoc.id,
        name: foundTherapistDoc.name || foundTherapistDoc.Name,
        specialization: foundTherapistDoc.specialization,
        profilePhoto: foundTherapistDoc.profilePhoto || `https://picsum.photos/seed/${foundTherapistDoc.id}/150/150`,
    };
}


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
        const therapist = await findTherapistByName(name);

        if (!therapist) {
             return { message: 'Therapist name not found. Please check the spelling. Hint: try "Dr. Anya".' };
        }
        
        return {
            message: "success",
            therapist: therapist,
        };

    } catch (e: any) {
        console.error("Authentication error:", e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
