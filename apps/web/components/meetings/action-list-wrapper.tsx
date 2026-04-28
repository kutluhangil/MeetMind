'use client';

import { useState } from 'react';
import { ActionList } from './action-list';
import type { ActionItem } from '@/types/database';

interface ActionListWrapperProps {
  meetingId: string;
  initialItems: ActionItem[];
}

export function ActionListWrapper({ meetingId, initialItems }: ActionListWrapperProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);

  const handleUpdate = async (id: string, status: ActionItem['status']) => {
    const res = await fetch(`/api/meetings/${meetingId}/actions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId: id, status }),
    });
    if (res.ok) {
      const { actionItem } = await res.json() as { actionItem: ActionItem };
      setItems((prev) => prev.map((a) => (a.id === id ? actionItem : a)));
    }
  };

  return <ActionList meetingId={meetingId} items={items} onItemUpdate={handleUpdate} />;
}
