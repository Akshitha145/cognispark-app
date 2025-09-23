
'use server';

import { db } from '@/lib/firebase';
import type { Child } from '@/lib/types';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { z } from 'zod';

const authenticateChildSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name cannot be empty.' }),
    caregiverId: z.string().trim().min(1, { message: 'Caretaker ID cannot be empty.' }),
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
        caregiverId: formData.get('caregiverId'),
    });

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return {
            message: errors.name?.[0] || errors.caregiverId?.[0] || 'Invalid data provided.',
        };
    }

    try {
        const { name, caregiverId } = validatedFields.data;

        // Firestore queries are case-sensitive. We will fetch by caregiverId first, then filter by name.
        const q = query(
            collection(db, "children"),
            where("caregiverId", "==", caregiverId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { message: 'No child found with that Caretaker ID. Please check the ID and try again.' };
        }

        let foundChildDoc = null;
        for (const doc of querySnapshot.docs) {
            const childData = doc.data();
            // Check for both 'name' and 'Name' for resilience
            const docName = childData.name || childData.Name;
            if (docName && docName.toLowerCase() === name.toLowerCase()) {
                foundChildDoc = doc;
                break;
            }
        }

        if (!foundChildDoc) {
            return { message: 'Username not found for the provided Caretaker ID. Please check the name.' };
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
