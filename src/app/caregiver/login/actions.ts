
'use server';

import { db } from '@/lib/firebase';
import type { Caregiver, Child } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

        // Find the caregiver by name (case-insensitive).
        const caregiverQuery = query(collection(db, "caregiver"));
        const caregiverSnapshot = await getDocs(caregiverQuery);

        if (caregiverSnapshot.empty) {
            return { message: 'No caregiver profiles found in the database. Please contact support.' };
        }

        let foundCaregiverDoc = null;
        for (const doc of caregiverSnapshot.docs) {
            const caregiverData = doc.data();
            const docName = caregiverData.Name || caregiverData.name;
            if (docName && docName.toLowerCase() === name.toLowerCase()) {
                foundCaregiverDoc = doc;
                break;
            }
        }

        if (!foundCaregiverDoc) {
             return { message: 'Caregiver name not found. Please check the spelling and try again.' };
        }
        
        const caregiverId = foundCaregiverDoc.id;
        const caregiverData = foundCaregiverDoc.data();

         // Fetch all children for this caregiver
        const childrenQuery = query(collection(db, "children"), where("caregiverId", "==", caregiverId));
        const childrenSnapshot = await getDocs(childrenQuery);
        
        const children: Child[] = childrenSnapshot.docs.map(doc => {
            const childData = doc.data();
            return {
                id: doc.id,
                name: childData.name || childData.Name || 'Unnamed Child',
                age: childData.age,
                disability: childData.disability,
                profilePhoto: childData.profilePhoto,
            };
        });


        const caregiver: Caregiver = {
            id: caregiverId,
            name: caregiverData.name || caregiverData.Name,
            email: caregiverData.email || caregiverData.Email,
            profilePhoto: caregiverData.profilePhoto,
            children: children,
        };

        return {
            message: "success",
            caregiver: caregiver,
        };

    } catch (e: any) {
        console.error(e);
        return { message: 'An unexpected error occurred during login. Please try again.' };
    }
}
