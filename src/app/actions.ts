
'use server';

import { db } from '@/lib/firebase';
import type { Caregiver, Child } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { z } from 'zod';

const authenticateChildSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
  caregiverName: z.string().trim().min(1, { message: "Caregiver's name cannot be empty." }),
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
        caregiverName: formData.get('caregiverName')
    });

    if (!validatedFields.success) {
        return {
            message:
                validatedFields.error.flatten().fieldErrors.name?.[0] ||
                validatedFields.error.flatten().fieldErrors.caregiverName?.[0] ||
                'Invalid data provided.',
        };
    }

    try {
        const { name, caregiverName } = validatedFields.data;
        const inputChildName = name.trim().toLowerCase();
        const inputCaregiverName = caregiverName.trim().toLowerCase();

        // 1. Find Caregiver
        const caregiverQuery = query(collection(db, 'caregiver'));
        const caregiverSnapshot = await getDocs(caregiverQuery);
        if (caregiverSnapshot.empty) {
            return { message: 'No caregivers found in the database.' };
        }

        let foundCaregiver: (Caregiver & { id: string }) | null = null;
        for (const doc of caregiverSnapshot.docs) {
             const caregiverData = doc.data() as Omit<Caregiver, 'id' | 'children'>;
             const docName = caregiverData.name || (caregiverData as any).Name || (caregiverData as any).caregiverName || (caregiverData as any).fullName;
             if (docName && docName.trim().toLowerCase() === inputCaregiverName) {
                 foundCaregiver = { id: doc.id, ...caregiverData, children: [] };
                 break;
             }
        }

        if (!foundCaregiver) {
            return { message: 'Caregiver not found. Please check the spelling.' };
        }

        // 2. Find Child with matching name and caregiverId
        const childrenQuery = query(
            collection(db, 'children'),
            where('caregiverId', '==', foundCaregiver.id)
        );
        const childrenSnapshot = await getDocs(childrenQuery);

        if (childrenSnapshot.empty) {
            return { message: 'This caregiver does not have any registered children.' };
        }

        let foundChildDoc = null;
        for (const doc of childrenSnapshot.docs) {
            const childData = doc.data();
            const docName = childData.name || childData.Name;
             if (docName && docName.trim().toLowerCase() === inputChildName) {
                foundChildDoc = doc;
                break;
            }
        }
        
        if (!foundChildDoc) {
             return { message: `No child named "${name}" found for caregiver "${caregiverName}".` };
        }

        const childData = foundChildDoc.data();
        const child: Child = {
            id: foundChildDoc.id,
            name: childData.name || childData.Name,
            age: childData.age,
            disability: childData.disability,
            profilePhoto: childData.profilePhoto
        };

        return {
            message: 'success',
            child: child,
        };

    } catch (e: any) {
        console.error('❌ Authentication error:', e);
        return {
            message:
                'An unexpected error occurred during login. Please try again.',
        };
    }
}
