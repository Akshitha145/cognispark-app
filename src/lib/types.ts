export type Child = {
  id: string;
  name: string;
  age: number;
  disability: string;
  avatar: string;
};

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
