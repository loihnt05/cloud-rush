import { create } from "zustand";

type SettingState = {
  backendUrl: string;
  accessToken: string | null;
  setBackendUrl: (url: string) => void;
  setAccessToken: (token: string | null) => void;
};

const useSettingStore = create<SettingState>((set) => ({
  backendUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
  accessToken: null,
  setBackendUrl: (url) => set({ backendUrl: url }),
  setAccessToken: (token) => set({ accessToken: token }),
}));

export default useSettingStore;
