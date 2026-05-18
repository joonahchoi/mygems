export interface Student {
  id: string;
  name: string;
  score: number;
}

export interface SavedClass {
  id: string;
  name: string;
  students: Student[];
}

export type AppMode = 'input' | 'evaluation' | 'result';
