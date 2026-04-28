export type MeetingStatus =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'summarizing'
  | 'completed'
  | 'failed';

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Participant {
  name: string;
  email?: string;
  role?: string;
}
