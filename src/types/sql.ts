// types/sql.ts - ОБНОВЛЕННЫЙ ТИП
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskType = 'sql' | 'code' | 'docker' | 'simulation' | 'hack' | 'defense';

export interface Task {
  id: string;
  title: string;
  goal: string;
  type: TaskType;
  difficulty: 'easy' | 'medium' | 'hard';
  initialCode?: string;
  solution?: string;
  hint?: string;
  checklist: ChecklistItem[];
  evidence: string;
  completed: boolean;
  xp: number;
  tags: string[];
}

export interface SqlProgress {
  theoryRead: boolean;
  quizAnswers: Record<number, number>;
  tasks: {
    easy: Record<string, { checklist: Record<string, boolean>; evidence: string; completed: boolean }>;
    medium: Record<string, { checklist: Record<string, boolean>; evidence: string; completed: boolean }>;
    hard: Record<string, { checklist: Record<string, boolean>; evidence: string; completed: boolean }>;
  };
  xp: number;
  level: number;
}