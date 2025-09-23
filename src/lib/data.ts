




import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity, Therapist, Caregiver, RecentScore } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon, EmotionIcon } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';

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

// For this prototype, we'll fetch the first caregiver we find.
// In a real app, this would be based on the currently logged-in user.
export async function getCaregiverData(): Promise<{caregiver: Caregiver, children: Child[]} | null> {
    try {
        const caregiversQuery = query(collection(db, "caregivers"), limit(1));
        const caregiverSnaps = await getDocs(caregiversQuery);

        if (caregiverSnaps.empty) {
            console.warn("No caregivers found in Firestore. Please add one.");
            return null;
        }
        
        const caregiverSnap = caregiverSnaps.docs[0];
        const caregiverId = caregiverSnap.id;
        const data = caregiverSnap.data();

        const childrenQuery = query(collection(db, "children"), where("caregiverId", "==", caregiverId));
        const childrenSnap = await getDocs(childrenQuery);

        const childrenData: Child[] = childrenSnap.docs.map(doc => {
            const childData = doc.data();
            return {
                id: doc.id,
                name: childData.name,
                age: childData.age,
                disability: childData.disability,
                profilePhoto: childData.profilePhoto
            } as Child;
        });
        
        const caregiverData: Caregiver = {
            id: caregiverId,
            name: data.Name || data.name,
            email: data.Email || data.email,
            profilePhoto: data.profilePhoto || data.profilePic || '',
            children: childrenData
        };

        return {
            caregiver: caregiverData,
            children: childrenData
        };

    } catch (error) {
        console.error("Error fetching caregiver data:", error);
        return null;
    }
}


export async function getDashboardData(childId: string, childName: string) {
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
    
    // Use the dynamic child's name now
    const recentActivities: RecentActivity[] = [
        { id: '1', childName: childName, activity: 'Completed Memory Match (Hard)', timestamp: '2 hours ago' },
        { id: '2', childName: childName, activity: 'Earned "Puzzle Pro" Badge', timestamp: '1 day ago' },
        { id: '3', childName: childName, activity: 'Started Focus Forest', timestamp: '2 days ago' },
    ];

    return {
        overviewStats,
        progressChartData,
        recentActivities,
    }
}

export async function getAllTherapists(): Promise<Therapist[]> {
    try {
        const therapistsSnap = await getDocs(collection(db, "therapists"));
        if (therapistsSnap.empty) {
            console.log("No therapists found, returning placeholder data.");
            return [
                { id: 'therapist1', name: 'Dr. Evelyn Reed', specialization: 'Cognitive Behavioral Therapy', profilePhoto: 'https://picsum.photos/seed/5/150/150' },
                { id: 'therapist2', name: 'Dr. Samuel Chen', specialization: 'Pediatric Psychology', profilePhoto: 'https://picsum.photos/seed/6/150/150' },
            ];
        }
        return therapistsSnap.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.name,
                specialization: data.specialization,
                profilePhoto: data.profilePhoto,
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
            console.log("No children found, returning placeholder data.");
            return [
                { id: 'child1', name: 'Alex', age: 8, disability: 'ADHD', profilePhoto: 'https://picsum.photos/seed/1/150/150' },
                { id: 'child2', name: 'Bella', age: 10, disability: 'Autism', profilePhoto: 'https://picsum.photos/seed/2/150/150' },
            ];
        }
        return childrenSnap.docs.map(doc => {
            const data = doc.data();
            return {
                 id: doc.id,
                 name: data.name,
                 age: data.age,
                 disability: data.disability,
                 profilePhoto: data.profilePhoto
            } as Child;
        });
    } catch (error) {
        console.error("Error fetching children:", error);
        return [];
    }
}


// --- Static Data ---
// Kept for reference or for parts of the app not yet connected to Firestore.

export const progressData: ProgressDataPoint[] = [];
export const skillScores = {
    'Memory': 88,
    'Problem-Solving': 75,
    'Attention': 62,
    'Language': 80,
    'Social-Emotional': 91,
};
export const exerciseScores = [
  { name: 'Memory Match', score: 88 },
  { name: 'Pattern Puzzles', score: 75 },
  { name: 'Focus Forest', score: 62 },
  { name: 'Story Creator', score: 80 },
  { name: 'Emotion Explorer', score: 91 },
];

export const recentScores: RecentScore[] = [
    { exercise: 'Memory Match', score: 92, date: '2024-05-20T10:00:00Z', difficulty: 'Hard' },
    { exercise: 'Pattern Puzzles', score: 85, date: '2024-05-19T14:30:00Z', difficulty: 'Medium' },
    { exercise: 'Focus Forest', score: 70, date: '2024-05-18T09:00:00Z', difficulty: 'Medium' },
    { exercise: 'Story Creator', score: 95, date: '2024-05-17T11:00:00Z', difficulty: 'Easy' },
];
export const children: Child[] = [];
export const therapists: Therapist[] = [];
export const recentActivities: RecentActivity[] = [];
