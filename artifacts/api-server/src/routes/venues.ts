import { Router, type IRouter } from "express";
import { venues } from "../data/venues.js";

const router: IRouter = Router();

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function localize(venue: typeof venues[0], lang: string) {
  const nameLocal = venue.nameLocal as Record<string, string>;
  const descriptionLocal = venue.descriptionLocal as Record<string, string>;
  const name = nameLocal[lang] || nameLocal["en"] || venue.name;
  const description = descriptionLocal[lang] || descriptionLocal["en"] || venue.description;
  const menu = venue.menu.map((item) => {
    const itemNameLocal = item.nameLocal as Record<string, string>;
    return { ...item, name: itemNameLocal[lang] || itemNameLocal["en"] || item.name };
  });
  return { ...venue, name, description, menu };
}

// GET /api/venues/nearby
router.get("/venues/nearby", (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 100;
  const lang = (req.query.lang as string) || "en";

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "lat and lng are required" });
    return;
  }

  const result = venues
    .map((v) => {
      const distance = haversine(lat, lng, v.lat, v.lng);
      const loc = localize(v, lang);
      return {
        id: loc.id,
        name: loc.name,
        category: loc.category,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        rating: loc.rating,
        imageUrl: loc.imageUrl,
        isOpen: loc.isOpen,
        priceRange: loc.priceRange,
        distance: Math.round(distance),
        withinAudioRadius: distance <= v.audioRadius,
      };
    })
    .filter((v) => v.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  res.json(result);
});

// GET /api/venues/:id
router.get("/venues/:id", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const venue = venues.find((v) => v.id === req.params.id);

  if (!venue) {
    res.status(404).json({ error: "Venue not found" });
    return;
  }

  const loc = localize(venue, lang);
  res.json({
    ...loc,
    hours: venue.hours,
    phone: venue.phone,
    website: venue.website,
    gallery: venue.gallery,
    reviews: venue.reviews,
  });
});

// GET /api/venues
router.get("/venues", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const category = req.query.category as string | undefined;

  let result = venues.map((v) => localize(v, lang));
  if (category) result = result.filter((v) => v.category === category);

  res.json(result.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    lat: v.lat,
    lng: v.lng,
    address: v.address,
    rating: v.rating,
    imageUrl: v.imageUrl,
    isOpen: v.isOpen,
    priceRange: v.priceRange,
    tags: v.tags,
  })));
});

// GET /api/audio/:venueId
router.get("/audio/:venueId", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const venue = venues.find((v) => v.id === req.params.venueId);

  if (!venue || !venue.hasAudio) {
    res.status(404).json({ error: "Audio not found" });
    return;
  }

  const transcripts = venue.audioTranscripts as Record<string, string>;
  const transcript = transcripts[lang] || transcripts["en"];
  const actualLang = transcripts[lang] ? lang : "en";

  if (!transcript) {
    res.status(404).json({ error: "No transcript available" });
    return;
  }

  res.json({ venueId: venue.id, lang: actualLang, transcript });
});

export default router;
