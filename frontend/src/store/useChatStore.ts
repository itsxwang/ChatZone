import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

// Define types for the state
interface ChatStoreState {
  allContacts: { id: string; name: string; email: string }[];
  chats: { id: string; name: string; email: string }[];
  messages: {
    id: string;
    content: string;
    senderId: string;
    timestamp: number;
  }[];
  activeTab: string;
  selectedUser: null | { id: string; name: string; email: string };
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

// Helper: safely get boolean from localStorage
const getInitialSoundState = (): boolean => {
  const stored = localStorage.getItem("isSoundEnabled");
  return stored === "true";
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: getInitialSoundState(),

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", String(newValue)); // must be string
    set({ isSoundEnabled: newValue });
  },

  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setSelectedUser: (
    selectedUser: null | { id: string; name: string; email: string }
  ) => set({ selectedUser }),

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },
}));
