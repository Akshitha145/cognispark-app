

import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity, Therapist, Caregiver, RecentScore, GameSession } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket, Palette } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon, EmotionIcon, ButterflyIcon, BubbleIcon } from '@/components/icons';
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
  {
    id: 'butterfly-balance',
    title: 'Butterfly Balance',
    description: 'Tap only the glowing butterfly to practice attention and impulse control.',
    skill: 'Impulse Control',
    icon: ButterflyIcon,
  },
  {
    id: 'calm-bubble-pop',
    title: 'Calm Bubble Pop',
    description: 'Pop bubbles slowly to relax and improve fine motor skills.',
    skill: 'Self-Regulation',
    icon: BubbleIcon,
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


export function getGameSessions(childId: string, days: number, onUpdate: (sessions: GameSession[]) => void): Unsubscribe {
    const startDate = subDays(new Date(), days);
    
    // Simplified query to avoid needing a composite index
    const sessionsQuery = query(
        collection(db, "gameSessions"), 
        where("childId", "==", childId)
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
        if (snapshot.empty) {
            onUpdate([]);
            return;
        }

        let sessions = snapshot.docs.map(doc => {
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

        // Filter by date on the client
        sessions = sessions.filter(session => session.timestamp >= startDate);

        // Sort the sessions in memory
        sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        onUpdate(sessions);
    }, (error) => {
        console.error("Error fetching game sessions in real-time:", error);
        onUpdate([]);
    });

    return unsubscribe;
}


export async function getAllTherapists(): Promise<Therapist[]> {
    return [
        { id: 'therapist1', name: 'Dr. Anya', specialization: 'Child Psychology', profilePhoto: 'https://picsum.photos/seed/5/150/150' },
        { id: 'therapist2', name: 'Dr. Ben', specialization: 'Behavioral Therapy', profilePhoto: 'https://picsum.photos/seed/6/150/150' }
    ];
}

export async function getAllChildren(): Promise<Child[]> {
     return [
        { id: 'child1', name: 'Alex', age: 8, disability: 'ADHD', profilePhoto: `https://picsum.photos/seed/1/150/150` },
        { id: 'child2', name: 'Bella', age: 7, disability: 'Autism', profilePhoto: `https://picsum.photos/seed/2/150/150` },
        { id: 'child3', name: 'Charlie', age: 9, disability: 'Dyslexia', profilePhoto: `https://picsum.photos/seed/3/150/150` }
    ];
}
