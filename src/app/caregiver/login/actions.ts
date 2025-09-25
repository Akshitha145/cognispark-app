
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
    const lowercasedName = name.toLowerCase();
    
    // Check against multiple possible field names case-insensitively.
    const nameFieldsToTry = ['name', 'Name', 'caregiverName', 'fullName'];
    let foundCaregiverDoc = null;

    const caregiversCollection = collection(db, "caregiver");
    const caregiverSnapshot = await getDocs(caregiversCollection);

    if (caregiverSnapshot.empty) {
        // Hardcoded fallback for demonstration if database is empty
        if (lowercasedName === 'maria') {
             const children: Child[] = [
                { id: 'child1', name: 'Alex', age: 8, disability: 'ADHD', profilePhoto: `https://picsum.photos/seed/1/150/150`, caregiverId: 'caregiver1' },
                { id: 'child2', name: 'Bella', age: 7, disability: 'Autism', profilePhoto: `https://picsum.photos/seed/2/150/150`, caregiverId: 'caregiver1' },
                { id: 'child3', name: 'Charlie', age: 9, disability: 'Dyslexia', profilePhoto: `https://picsum.photos/seed/3/150/150`, caregiverId: 'caregiver1' }
            ];
             return {
                id: 'caregiver1',
                name: 'Maria',
                email: 'maria@example.com',
                profilePhoto: `https://picsum.photos/seed/4/150/150`,
                children: children
            };
        }
        return null;
    }

    // Loop through docs to perform case-insensitive comparison
    for (const doc of caregiverSnapshot.docs) {
        const data = doc.data();
        for (const field of nameFieldsToTry) {
            if (data[field] && typeof data[field] === 'string' && data[field].toLowerCase() === lowercasedName) {
                foundCaregiverDoc = { id: doc.id, ...data };
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
            return { message: 'Caregiver name not found. Please check the spelling and try again. Note: valid caregiver is "Maria".' };
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
