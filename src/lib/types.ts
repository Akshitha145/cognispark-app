export type Child = {
  id: string;
  name: string;
  age: number;
  disability: string;
  profilePhoto: string;
  avatarHint?: string;
};

export type Caregiver = {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  avatarHint?: string;
  children: Child[];
}

export type Therapist = {
    id: string;
    name: string;
    specialization: string;
    profilePhoto: string;
    avatarHint?: string;
}

export type Exercise = {
  id: string;
  title: string;
  description: string;
  skill: 'Memory' | 'Attention' | 'Problem-Solving' | 'Language' | 'Social-Emotional';
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


export type RecentScore = {
    exercise: string;
    score: number;
    date: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}
