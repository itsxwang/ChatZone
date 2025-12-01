import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import type { AxiosError } from "axios";

// Define types for the state
interface ChatStoreState {
  allContacts: {
    _id: string;
    fullName: string;
    email: string;
    profilePic: string;
  }[];
  chats: { _id: string; fullName: string; email: string; profilePic: string }[];
  messages: {
    _id: string;
    senderId?: string;
    receiverId?: string;
    text?: string;
    image?: string;
    createdAt: string;
    updatedAt?: string;
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
  sendMessage: (messageData: {
    text?: string;
    image?: string;
  }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;

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

  getMessagesByUserId: async (userId) => {
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

  sendMessage: async (messageData: { text?: string; image?: string }) => {
    const { selectedUser, messages } = get();

    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser?._id,
      receiverId: selectedUser?._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // optimistically updating UI instantly
    set({ messages: [optimisticMessage, ...messages] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });

      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket?.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
}));
