
'use server';

import { db } from '@/lib/firebase';
import type { Therapist } from '@/lib/types';
import { collection, getDocs, query } from 'firebase/firestore';
import { z } from 'zod';

const authenticateTherapistSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
});

export type AuthFormState = {
    message: string;
    therapist?: Therapist;
} | null;

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
        const inputName = name.trim().toLowerCase();

        // Find the therapist by name (case-insensitive).
        const therapistQuery = query(collection(db, "therapists"));
        const therapistSnapshot = await getDocs(therapistQuery);

        if (therapistSnapshot.empty) {
            return { message: 'No therapist profiles found in the database. Please contact support.' };
        }

        let foundTherapistDoc = null;
        for (const doc of therapistSnapshot.docs) {
            const therapistData = doc.data();
            const docName = therapistData.Name || therapistData.name;
            if (docName && docName.trim().toLowerCase() === inputName) {
                foundTherapistDoc = doc;
                break;
            }
        }

        if (!foundTherapistDoc) {
             return { message: 'Therapist name not found. Please check the spelling and try again.' };
        }
        
        const therapistData = foundTherapistDoc.data();

        const therapist: Therapist = {
            id: foundTherapistDoc.id,
            name: therapistData.name || therapistData.Name,
            specialization: therapistData.specialization,
            profilePhoto: therapistData.profilePhoto,
        };

        return {
            message: "success",
            therapist: therapist,
        };

    } catch (e: any) {
        console.error(e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
