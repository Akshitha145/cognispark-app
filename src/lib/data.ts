

import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity, Therapist, Caregiver, RecentScore, GameSession } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket, Palette } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon, EmotionIcon } from '@/components/icons';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where, limit, orderBy, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { subDays, format } from 'date-fns';

export const exercises: Exercise[] = [
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match pairs of cards to test and improve short-term memory.',
    skill: 'Memory',
    icon: MemoryIcon,
  },
  {
    id: 'pattern-puzzles',
    title: 'Pattern Puzzles',
    description: 'Complete sequences and identify patterns to boost problem-solving skills.',
    skill: 'Problem-Solving',
    icon: ProblemSolvingIcon,
  },
  {
    id: 'focus-forest',
    title: 'Focus Forest',
    description: 'A calming game to help improve attention and focus by identifying specific objects.',
    skill: 'Attention',
    icon: AttentionIcon,
  },
  {
    id: 'color-quest',
    title: 'Color Quest',
    description: 'Find and click the target color as fast as you can to improve focus.',
    skill: 'Attention',
    icon: Palette,
  },
  {
    id: 'emotion-explorer',
    title: 'Emotion Explorer',
    description: 'Identify emotions from facial expressions to improve social understanding.',
    skill: 'Social-Emotional',
    icon: EmotionIcon,
  },
];

export const badges: Badge[] = [
  { id: 'badge1', name: 'First Steps', description: 'Completed your first exercise!', icon: Star },
  { id: 'badge2', name: 'Memory Master', description: 'Mastered 10 memory exercises.', icon: BrainCircuit },
  { id: 'badge3', name: 'Puzzle Pro', description: 'Solved 20 complex puzzles.', icon: Puzzle },
  { id: 'badge4', name: 'Weekly Warrior', description: 'Completed exercises every day for a week.', icon: Gem },
  { id: 'badge5', name: 'Rocket Learner', description: 'Leveled up 5 times in one week.', icon: Rocket },
  { id: 'badge6', name: 'Social Butterfly', description: 'Collaborated with a peer for the first time.', icon: HeartHandshake },
];


export async function getCaregiverData(): Promise<{caregiver: Caregiver, children: Child[]} | null> {
    try {
        // Step 1: Fetch the first caregiver document from the 'caregiver' collection.
        const caregiverQuery = query(collection(db, "caregiver"), limit(1));
        const caregiverSnapshot = await getDocs(caregiverQuery);

        if (caregiverSnapshot.empty) {
            console.error("Firestore Error: No documents found in the 'caregiver' collection.");
            return null;
        }

        const caregiverDoc = caregiverSnapshot.docs[0];
        const caregiverData = caregiverDoc.data();
        const caregiverId = caregiverDoc.id; // This is the actual Document ID, e.g., "caregiver1"

        // Step 2: Fetch all children where 'caregiverId' matches the ID found in Step 1.
        const childrenQuery = query(collection(db, "children"), where("caregiverId", "==", caregiverId));
        const childrenSnapshot = await getDocs(childrenQuery);
        
        let childrenData: Child[] = [];
        if (childrenSnapshot.empty) {
            console.warn(`Firestore Warning: No children found with caregiverId: ${caregiverId}`);
        } else {
             childrenData = childrenSnapshot.docs.map(doc => {
                const childData = doc.data();
                // Handle both 'Name' and 'name' for resilience.
                const name = childData.Name || childData.name || 'Unnamed Child';
                return {
                    id: doc.id,
                    name: name,
                    age: childData.age || 0,
                    disability: childData.disability || 'N/A',
                    profilePhoto: childData.profilePhoto || `https://picsum.photos/seed/${doc.id}/150/150`
                };
            });
        }
        
        // Step 3: Assemble the final caregiver object.
        const assembledCaregiver: Caregiver = {
            id: caregiverId,
            name: caregiverData.Name || caregiverData.name || 'Caregiver',
            email: caregiverData.Email || caregiverData.email || 'no-email@example.com',
            profilePhoto: caregiverData.profilePhoto || `https://picsum.photos/seed/${caregiverId}/150/150`,
            children: childrenData 
        };

        return {
            caregiver: assembledCaregiver,
            children: childrenData
        };

    } catch (error) {
        console.error("CRITICAL ERROR in getCaregiverData:", error);
        return null;
    }
}


export async function getDashboardData(childId: string, childName: string) {
    const sessions = await getGameSessions(childId, 7);

    const timeSpent = sessions.reduce((acc, session) => acc + 2, 0); // Assuming 2 mins per session
    const exercisesCompleted = sessions.length;

    const overviewStats = {
        timeSpent: `${Math.floor(timeSpent / 60)}h ${timeSpent % 60}m`,
        timeSpentTrend: "+0%", // Placeholder
        exercisesCompleted: exercisesCompleted,
        exercisesCompletedTrend: "+0", // Placeholder
        badgesEarned: 3, // Placeholder to match rewards page
        latestBadge: "Puzzle Pro" // Placeholder
    };

    const progressChartData: ProgressDataPoint[] = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateString = format(date, 'EEE');
        const sessionsOnDay = sessions.filter(s => format(new Date(s.timestamp), 'EEE') === dateString);
        
        const avgScore = sessionsOnDay.length > 0
            ? sessionsOnDay.reduce((sum, s) => sum + s.score, 0) / sessionsOnDay.length
            : 0;
            
        const timeSpentOnDay = sessionsOnDay.length * 2; // Assuming 2 mins per session

        return { date: dateString, 'Cognitive Score': Math.round(avgScore), 'Time Spent (min)': timeSpentOnDay };
    });
    
    const recentActivities: RecentActivity[] = sessions.slice(0, 3).map((session, index) => {
        const exercise = exercises.find(e => e.id === session.exerciseId);
        return {
            id: session.id || `${index}`,
            childName: childName,
            activity: `Completed ${exercise?.title || session.exerciseId}`,
            timestamp: format(new Date(session.timestamp), 'PPp')
        }
    });

    return {
        overviewStats,
        progressChartData,
        recentActivities,
    }
}

export function getGameSessions(childId: string, days: number, onUpdate: (sessions: GameSession[]) => void): Unsubscribe {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const sessionsQuery = query(
        collection(db, "gameSessions"), 
        where("childId", "==", childId),
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
        if (snapshot.empty) {
            onUpdate([]);
            return;
        }

        const sessions = snapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp);
            return { 
                id: doc.id,
                childId: data.childId,
                exerciseId: data.exerciseId,
                score: data.score,
                difficulty: data.difficulty,
                timestamp: timestamp,
            } as GameSession;
        });
        onUpdate(sessions);
    }, (error) => {
        console.error("Error fetching game sessions in real-time:", error);
        onUpdate([]);
    });

    return unsubscribe;
}


export async function getAllTherapists(): Promise<Therapist[]> {
    try {
        const therapistsSnap = await getDocs(collection(db, "therapists"));
        if (therapistsSnap.empty) {
            console.warn("No documents found in 'therapists' collection.");
            return [];
        }
        return therapistsSnap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.name || data.Name || 'Therapist',
                specialization: data.specialization || 'N/A',
                profilePhoto: data.profilePhoto || `https://picsum.photos/seed/${doc.id}/150/150`,
            } as Therapist;
        });
    } catch (error) {
        console.error("Error fetching therapists:", error);
        return [];
    }
}

export async function getAllChildren(): Promise<Child[]> {
    try {
        const childrenSnap = await getDocs(collection(db, "children"));
        if (childrenSnap.empty) {
            console.warn("No documents found in 'children' collection.");
            return [];
        }
        return childrenSnap.docs.map(doc => {
            const data = doc.data();
            return {
                 id: doc.id,
                 name: data.name || data.Name || 'Child',
                 age: data.age || 0,
                 disability: data.disability || 'N/A',
                 profilePhoto: data.profilePhoto || `https://picsum.photos/seed/${doc.id}/150/150`
            } as Child;
        });
    } catch (error) {
        console.error("Error fetching children:", error);
        return [];
    }
}

    
