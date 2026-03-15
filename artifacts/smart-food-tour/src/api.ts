import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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

// --- Types ---
export interface NearbyVenue {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  imageUrl: string;
  address: string;
  distance?: number;
  withinAudioRadius?: boolean;
}

export interface VenueDetail {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  imageUrl: string;
  address: string;
  phone?: string;
  website?: string;
  description: string;
  tags?: string[];
  isOpen?: boolean;
  hours?: Record<string, string>;
  menu?: { id: string; name: string; description: string; price: number; imageUrl?: string }[];
  gallery?: string[];
  reviews?: { id: string; author: string; rating: number; comment: string; date: string }[];
}

export interface AudioInfo {
  venueId: string;
  lang: string;
  transcript: string;
}

// --- Hooks ---
export function useNearbyVenues(lat: number, lng: number, radius: number, lang: string) {
  return useQuery<NearbyVenue[]>({
    queryKey: ["venues/nearby", lat, lng, radius, lang],
    queryFn: () =>
      apiFetch<NearbyVenue[]>(`/venues/nearby?lat=${lat}&lng=${lng}&radius=${radius}&lang=${lang}`),
  });
}

export function useVenueDetail(id: string, lang: string) {
  return useQuery<VenueDetail>({
    queryKey: ["venues", id, lang],
    queryFn: () => apiFetch<VenueDetail>(`/venues/${id}?lang=${lang}`),
    enabled: !!id,
  });
}

export function fetchAudio(venueId: string, lang: string): Promise<AudioInfo> {
  return apiFetch<AudioInfo>(`/audio/${venueId}?lang=${lang}`);
}

export function useSendChat() {
  return useMutation<{ reply: string }, Error, { message: string; lang: string; userLat?: number; userLng?: number }>({
    mutationFn: (body) =>
      apiFetch<{ reply: string }>("/chat", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}
