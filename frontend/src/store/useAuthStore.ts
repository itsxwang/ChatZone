import { create } from "zustand";
import { axiosInstance } from "../axios/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

 signup: async (data: { fullName: string; email: string; password: string }) => {
  set({ isSigningUp: true });

  try {
    const res = await axiosInstance.post("/auth/signup", data);
    set({ authUser: res.data });

    toast.success("Account created successfully!");
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    toast.error(error.response?.data?.message || "Signup failed");
  } finally {
    set({ isSigningUp: false });
  }
},
}));
