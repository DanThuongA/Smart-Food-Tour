import { useQuery, useMutation } from "@tanstack/react-query";
const API_BASE = "/api";
async function apiFetch(path, options) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error ${res.status}`);
    }
    return res.json();
}
// --- Hooks ---
export function useNearbyVenues(lat, lng, radius, lang) {
    return useQuery({
        queryKey: ["venues/nearby", lat, lng, radius, lang],
        queryFn: () => apiFetch(`/venues/nearby?lat=${lat}&lng=${lng}&radius=${radius}&lang=${lang}`),
    });
}
export function useVenueDetail(id, lang) {
    return useQuery({
        queryKey: ["venues", id, lang],
        queryFn: () => apiFetch(`/venues/${id}?lang=${lang}`),
        enabled: !!id,
    });
}
export function fetchAudio(venueId, lang) {
    return apiFetch(`/audio/${venueId}?lang=${lang}`);
}
export function useSendChat() {
    return useMutation({
        mutationFn: (body) => apiFetch("/chat", {
            method: "POST",
            body: JSON.stringify(body),
        }),
    });
}
