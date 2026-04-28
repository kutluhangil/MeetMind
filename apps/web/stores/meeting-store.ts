import { create } from 'zustand';
import type { Meeting, ActionItem } from '@/types/database';

interface MeetingStore {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  actionItems: ActionItem[];
  isLoading: boolean;
  error: string | null;

  setMeetings: (meetings: Meeting[]) => void;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  setActionItems: (items: ActionItem[]) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  currentMeeting: null,
  actionItems: [],
  isLoading: false,
  error: null,

  setMeetings: (meetings) => set({ meetings }),
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  setActionItems: (items) => set({ actionItems: items }),

  updateMeeting: (id, updates) =>
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      currentMeeting:
        state.currentMeeting?.id === id
          ? { ...state.currentMeeting, ...updates }
          : state.currentMeeting,
    })),

  updateActionItem: (id, updates) =>
    set((state) => ({
      actionItems: state.actionItems.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ meetings: [], currentMeeting: null, actionItems: [], isLoading: false, error: null }),
}));
