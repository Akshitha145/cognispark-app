import type { Child, Exercise, Badge, ProgressDataPoint, RecentActivity } from '@/lib/types';
import { BrainCircuit, Puzzle, Bot, Mic, Fingerprint, HeartHandshake, BookOpen, Star, Gem, Rocket } from 'lucide-react';
import { MemoryIcon, AttentionIcon, ProblemSolvingIcon, LanguageIcon } from '@/components/icons';


export const children: Child[] = [
  { id: 'child1', name: 'Alex', age: 7, disability: 'ADHD', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'child2', name: 'Bella', age: 9, disability: 'Autism', avatar: 'https://i.pravatar.cc/150?u=bella' },
  { id: 'child3', name: 'Charlie', age: 8, disability: 'LD', avatar: 'https://i.pravatar.cc/150?u=charlie' },
];

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
