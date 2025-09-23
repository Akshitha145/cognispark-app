import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity, Therapist, Caregiver } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon, EmotionIcon } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// MOCK DATA - This will be replaced with Firestore data

const alexAvatar = PlaceHolderImages.find(p => p.id === 'child-avatar-1');
const bellaAvatar = PlaceHolderImages.find(p => p.id === 'child-avatar-2');
const charlieAvatar = PlaceHolderImages.find(p => p.id === 'child-avatar-3');
const caregiverAvatar = PlaceHolderImages.find(p => p.id === 'caregiver-avatar');
const therapistAvatar1 = PlaceHolderImages.find(p => p.id === 'therapist-avatar-1');
const therapistAvatar2 = PlaceHolderImages.find(p => p.id === 'therapist-avatar-2');


export const allChildren: Child[] = [
  { id: 'child1', name: 'Alex', age: 7, disability: 'ADHD', avatar: alexAvatar?.imageUrl || '', avatarHint: alexAvatar?.imageHint },
  { id: 'child2', name: 'Bella', age: 9, disability: 'Autism', avatar: bellaAvatar?.imageUrl || '', avatarHint: bellaAvatar?.imageHint },
  { id: 'child3', name: 'Charlie', age: 8, disability: 'LD', avatar: charlieAvatar?.imageUrl || '', avatarHint: charlieAvatar?.imageHint },
];

export const caregiver: Caregiver = {
    id: 'caregiver1',
    name: 'Sarah',
    email: 'caregiver@example.com',
    avatar: caregiverAvatar?.imageUrl || '',
    avatarHint: caregiverAvatar?.imageHint,
    children: [allChildren[0], allChildren[1]],
}

// For the dashboard, we only show the children of the logged-in caregiver.
export const children = caregiver.children;


export const therapists: Therapist[] = [
    { id: 'therapist1', name: 'Dr. Evelyn Reed', specialization: 'Cognitive Behavioral Therapy', avatar: therapistAvatar1?.imageUrl || '', avatarHint: therapistAvatar1?.imageHint },
    { id: 'therapist2', name: 'Dr. Samuel Chen', specialization: 'Child Psychology', avatar: therapistAvatar2?.imageUrl || '', avatarHint: therapistAvatar2?.imageHint },
]

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

export const progressData: ProgressDataPoint[] = [
  { date: 'Mon', 'Cognitive Score': 65, 'Time Spent (min)': 30 },
  { date: 'Tue', 'Cognitive Score': 70, 'Time Spent (min)': 35 },
  { date: 'Wed', 'Cognitive Score': 72, 'Time Spent (min)': 32 },
  { date: 'Thu', 'Cognitive Score': 80, 'Time Spent (min)': 40 },
  { date: 'Fri', 'Cognitive Score': 78, 'Time Spent (min)': 38 },
  { date: 'Sat', 'Cognitive Score': 85, 'Time Spent (min)': 45 },
  { date: 'Sun', 'Cognitive Score': 88, 'Time Spent (min)': 42 },
];

export const recentActivities: RecentActivity[] = [
    { id: '1', childName: 'Alex', activity: 'Scored 85% on Memory Match (Medium)', timestamp: '2 hours ago' },
    { id: '2', childName: 'Bella', activity: 'Earned the "Puzzle Pro" badge', timestamp: '5 hours ago' },
    { id: '3', childName: 'Alex', activity: 'Completed Focus Forest (Easy)', timestamp: '1 day ago' },
    { id: '4', childName: 'Charlie', activity: 'Started the Story Creator exercise', timestamp: '2 days ago' },
];

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
]

export const recentScores = [
    {
        exercise: "Emotion Explorer",
        score: 91,
        date: "2024-07-21",
        difficulty: "Easy",
    },
    {
        exercise: "Memory Match",
        score: 88,
        date: "2024-07-21",
        difficulty: "Medium",
    },
    {
        exercise: "Story Creator",
        score: 80,
        date: "2024-07-20",
        difficulty: "Easy",
    },
    {
        exercise: "Pattern Puzzles",
        score: 75,
        date: "2024-07-19",
        difficulty: "Easy",
    },
    {
        exercise: "Focus Forest",
        score: 62,
        date: "2024-07-18",
        difficulty: "Medium",
    },
]
