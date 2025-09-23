import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity, Therapist, Caregiver, RecentScore } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon, EmotionIcon } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

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
    id: 'story-creator',
    title: 'Story Creator',
    description: 'Build stories word by word to enhance language and creative skills.',
    skill: 'Language',
    icon: LanguageIcon,
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


// --- Firestore Data Fetching Functions ---

// For now, we will fetch a hardcoded caregiver. Later, this will be the logged-in user.
const CAREGIVER_ID = "caregiver1"; 

export async function getCaregiverData(): Promise<{caregiver: Caregiver, children: Child[]} | null> {
    try {
        const caregiverDocRef = doc(db, "caregivers", CAREGIVER_ID);
        const caregiverSnap = await getDoc(caregiverDocRef);

        if (!caregiverSnap.exists()) {
            console.warn("Caregiver document not found in Firestore. Please add it.");
            return null;
        }

        const caregiverData = caregiverSnap.data() as Omit<Caregiver, 'id' | 'children'>;

        const childrenQuery = query(collection(db, "children"), where("caregiverId", "==", CAREGIVER_ID));
        const childrenSnap = await getDocs(childrenQuery);

        const childrenData: Child[] = childrenSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Child));
        
        return {
            caregiver: {
                id: caregiverSnap.id,
                ...caregiverData,
                children: childrenData,
            },
            children: childrenData
        };

    } catch (error) {
        console.error("Error fetching caregiver data:", error);
        return null;
    }
}


export async function getDashboardData(childId: string) {
    // These are examples. We'll build these out to fetch real data from Firestore.
    const overviewStats = {
        timeSpent: "3h 15m",
        timeSpentTrend: "+20%",
        exercisesCompleted: 15,
        exercisesCompletedTrend: "+3",
        badgesEarned: 2,
        latestBadge: "Memory Master"
    };

    const progressChartData: ProgressDataPoint[] = [
        { date: 'Mon', 'Cognitive Score': 75, 'Time Spent (min)': 30 },
        { date: 'Tue', 'Cognitive Score': 80, 'Time Spent (min)': 45 },
        { date: 'Wed', 'Cognitive Score': 78, 'Time Spent (min)': 25 },
        { date: 'Thu', 'Cognitive Score': 85, 'Time Spent (min)': 50 },
        { date: 'Fri', 'Cognitive Score': 88, 'Time Spent (min)': 40 },
        { date: 'Sat', 'Cognitive Score': 90, 'Time Spent (min)': 60 },
        { date: 'Sun', 'Cognitive Score': 92, 'Time Spent (min)': 55 },
    ];
    
    const recentActivities: RecentActivity[] = [
        { id: '1', childName: 'Alex', activity: 'Completed Memory Match (Hard)', timestamp: '2 hours ago' },
        { id: '2', childName: 'Alex', activity: 'Earned "Puzzle Pro" Badge', timestamp: '1 day ago' },
        { id: '3', childName: 'Alex', activity: 'Started Focus Forest', timestamp: '2 days ago' },
    ];

    return {
        overviewStats,
        progressChartData,
        recentActivities,
    }
}


// --- Static Data ---
// Kept for reference or for parts of the app not yet connected to Firestore.

export const therapists: Therapist[] = [
    {
        id: 'therapist1',
        name: 'Dr. Evelyn Reed',
        specialization: 'Cognitive Behavioral Therapy',
        avatar: PlaceHolderImages.find(img => img.id === 'therapist-avatar-1')?.imageUrl || '',
        avatarHint: PlaceHolderImages.find(img => img.id === 'therapist-avatar-1')?.imageHint,
    },
    {
        id: 'therapist2',
        name: 'Dr. Samuel Chen',
        specialization: 'Child Psychology',
        avatar: PlaceHolderImages.find(img => img.id === 'therapist-avatar-2')?.imageUrl || '',
        avatarHint: PlaceHolderImages.find(img => img.id === 'therapist-avatar-2')?.imageHint,
    }
];

export const allChildren: Child[] = [];
export const caregiver: Caregiver | null = null;
export const children: Child[] = [];
export const progressData: ProgressDataPoint[] = [];
export const recentActivities: RecentActivity[] = [];
export const skillScores = {};
export const exerciseScores: { name: string, score: number }[] = [];
export const recentScores: RecentScore[] = [];