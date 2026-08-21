import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative";
const memoryStorage = new Map<string, string>();
const nonBrowserStorage = {
  getItem: async (key: string) => memoryStorage.get(key) ?? null,
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
};
const sessionStorage = isReactNative || typeof window !== "undefined" ? AsyncStorage : nonBrowserStorage;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase configuration is unavailable. Check the app environment settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: sessionStorage,
  },
});
