export type Child = {
  id: string;
  name: string;
  age: number;
  disability: string;
  profilePhoto: string;
  caregiverId?: string;
};

export type Caregiver = {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  children: Child[];
}

export type Therapist = {
    id: string;
    name: string;
    specialization: string;
    profilePhoto: string;
}

export type Exercise = {
  id: string;
  title: string;
  description: string;
  skill: 'Memory' | 'Attention' | 'Problem-Solving' | 'Language' | 'Social-Emotional' | 'Impulse Control' | 'Self-Regulation';
  icon: React.ComponentType<{ className?: string }>;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type ProgressDataPoint = {
  date: string;
  'Cognitive Score': number;
  'Time Spent (min)': number;
};

export type RecentActivity = {
  id: string;
  activity: string;
  timestamp: string;
  childName: string;
};

export type GameSession = {
    id?: string;
    childId: string;
    exerciseId: string;
    score: number;
    difficulty: string;
    timestamp: Date;
}

export type RecentScore = {
    exercise: string;
    score: number;
    date: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}
