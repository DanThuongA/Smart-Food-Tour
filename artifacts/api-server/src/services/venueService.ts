import { venues, type Venue } from "../data/venues.js";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function localizeVenue(venue: Venue, lang: string) {
  const nameLocal = (venue.nameLocal as Record<string, string>) || {};
  const descriptionLocal = (venue.descriptionLocal as Record<string, string>) || {};
  return {
    ...venue,
    name: nameLocal[lang] || nameLocal["en"] || venue.name,
    description: descriptionLocal[lang] || descriptionLocal["en"] || venue.description,
    menu: venue.menu.map((item) => {
      const itemNameLocal = (item.nameLocal as Record<string, string>) || {};
      return {
        ...item,
        name: itemNameLocal[lang] || itemNameLocal["en"] || item.name
      };
    })
  };
}

export function getAllVenues(lang = "en", category?: string, lat?: number, lng?: number) {
  let result = venues.map((v) => localizeVenue(v, lang));

  if (category) {
    result = result.filter((v) => v.category === category);
  }

  if (lat !== undefined && lng !== undefined) {
    result = result
      .map((v) => ({
        ...v,
        _dist: haversineDistance(lat, lng, v.lat, v.lng)
      }))
      .sort((a, b) => a._dist - b._dist)
      .map(({ _dist, ...rest }) => rest);
  }

  return result.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    description: v.description,
    lat: v.lat,
    lng: v.lng,
    address: v.address,
    rating: v.rating,
    reviewCount: v.reviewCount,
    imageUrl: v.imageUrl,
    isOpen: v.isOpen,
    audioRadius: v.audioRadius,
    priceRange: v.priceRange,
    tags: v.tags,
    hasAudio: v.hasAudio,
    audioLanguages: v.audioLanguages
  }));
}

export function getVenueById(id: string, lang = "en") {
  const venue = venues.find((v) => v.id === id);
  if (!venue) return null;
  const localized = localizeVenue(venue, lang);
  const descriptionLocal = (venue.descriptionLocal as Record<string, string>) || {};
  return {
    ...localized,
    descriptionLocal,
    hours: venue.hours,
    phone: venue.phone,
    website: venue.website,
    gallery: venue.gallery,
    reviews: venue.reviews,
    hasAudio: venue.hasAudio,
    audioLanguages: venue.audioLanguages
  };
}

export function getNearbyVenues(lat: number, lng: number, radius = 100, lang = "en") {
  return venues
    .map((v) => {
      const distance = haversineDistance(lat, lng, v.lat, v.lng);
      const localized = localizeVenue(v, lang);
      return {
        id: localized.id,
        name: localized.name,
        category: localized.category,
        description: localized.description,
        lat: localized.lat,
        lng: localized.lng,
        address: localized.address,
        rating: localized.rating,
        reviewCount: localized.reviewCount,
        imageUrl: localized.imageUrl,
        isOpen: localized.isOpen,
        audioRadius: localized.audioRadius,
        priceRange: localized.priceRange,
        tags: localized.tags,
        distance: Math.round(distance),
        withinAudioRadius: distance <= v.audioRadius
      };
    })
    .filter((v) => v.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function getAudioForVenue(venueId: string, lang = "en") {
  const venue = venues.find((v) => v.id === venueId);
  if (!venue || !venue.hasAudio) return null;

  const transcripts = venue.audioTranscripts as Record<string, string>;
  let transcript = transcripts[lang];
  let actualLang = lang;
  let fallbackLang: string | undefined;

  if (!transcript) {
    transcript = transcripts["en"];
    actualLang = "en";
    fallbackLang = "en";
  }

  if (!transcript) {
    return null;
  }

  return {
    venueId,
    lang: actualLang,
    audioUrl: `/api/audio/${venueId}/stream?lang=${actualLang}`,
    fallbackLang,
    transcript
  };
}
