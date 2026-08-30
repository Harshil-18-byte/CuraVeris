import { create } from "zustand";
import { api } from "@/lib/api";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  fetchUnreadCount: async () => {
    try {
      const data = await api.notifications.getUnreadCount();
      set({ unreadCount: data.count });
    } catch {
      // Ignored if offline
    }
  },
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
