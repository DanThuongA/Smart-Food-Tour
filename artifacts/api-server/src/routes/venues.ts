import { Router, type IRouter } from "express";
import {
  getAllVenues,
  getVenueById,
  getNearbyVenues,
  getAudioForVenue
} from "../services/venueService.js";

const router: IRouter = Router();

router.get("/venues", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const category = req.query.category as string | undefined;
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

  const result = getAllVenues(lang, category, lat, lng);
  res.json(result);
});

router.get("/venues/nearby", (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 100;
  const lang = (req.query.lang as string) || "en";

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "bad_request", message: "lat and lng are required" });
    return;
  }

  const result = getNearbyVenues(lat, lng, radius, lang);
  res.json(result);
});

router.get("/venues/:id", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const venue = getVenueById(req.params.id, lang);

  if (!venue) {
    res.status(404).json({ error: "not_found", message: "Venue not found" });
    return;
  }

  res.json(venue);
});

router.get("/audio/:venueId", (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const audio = getAudioForVenue(req.params.venueId, lang);

  if (!audio) {
    res.status(404).json({ error: "not_found", message: "No audio available for this venue" });
    return;
  }

  res.json(audio);
});

export default router;
