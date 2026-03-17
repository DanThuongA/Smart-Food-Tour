import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAppStore = create()(persist((set) => ({
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
}), {
    name: "smart-food-tour-storage",
    partialize: (state) => ({ language: state.language }), // Only persist language
}));
