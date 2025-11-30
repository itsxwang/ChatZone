import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

// Define types for the state
interface ChatStoreState {
  allContacts: { _id: string; fullName: string; email: string; profilePic: string }[];
  chats: { _id: string; fullName: string; email: string; profilePic: string }[];
  messages: {
    id: string;
    content: string;
    senderId: string;
    timestamp: number;
  }[];
  activeTab: string;
  selectedUser: null | {
    _id: string;
    fullName: string;
    email: string;
    profilePic: string;
  };
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (
    selectedUser: null | {
      _id: string;
      fullName: string;
      email: string;
      profilePic: string;
    }
  ) => void;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  getAllContacts: () => Promise<void>;
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
    selectedUser: null | {
      _id: string;
      fullName: string;
      email: string;
      profilePic: string;
    }
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
  getMessagesByUserId: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
}));
