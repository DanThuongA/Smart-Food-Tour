import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
  
  // Fake GPS State
  gpsPosition: [number, number];
  setGpsPosition: (lat: number, lng: number) => void;
  
  // Audio Tracking
  playedVenues: string[];
  markVenuePlayed: (venueId: string) => void;
  resetPlayedVenues: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      
      // Default to central HCMC
      gpsPosition: [10.7769, 106.7009],
      setGpsPosition: (lat, lng) => set({ gpsPosition: [lat, lng] }),
      
      playedVenues: [],
      markVenuePlayed: (venueId) => set((state) => ({
        playedVenues: [...new Set([...state.playedVenues, venueId])]
      })),
      resetPlayedVenues: () => set({ playedVenues: [] })
    }),
    {
      name: "smart-food-tour-storage",
      partialize: (state) => ({ language: state.language }), // Only persist language
    }
  )
);
