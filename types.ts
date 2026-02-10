export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: Date; // We will use Date object for easier manipulation
  category: 'work' | 'personal' | 'others';
  hasReminder?: boolean;
}

export type FilterType = 'Today' | 'Later';

export interface ParsedTaskData {
  title: string;
  dueDateString?: string;
  hasReminder: boolean;
  category: 'work' | 'personal' | 'others';
}
