import { Router, type IRouter } from "express";
import { users, pendingVenues } from "../data/users.js";
import { venues } from "../data/venues.js";

const router: IRouter = Router();

// Login
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: `fake-token-${user.id}` });
});

// Register vendor
router.post("/auth/register", (req, res) => {
  const { email, password, name, phone, shopName } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "bad_request", message: "email, password and name required" });
    return;
  }
  if (users.find((u) => u.email === email)) {
    res.status(409).json({ error: "conflict", message: "Email already registered" });
    return;
  }

  const newUser = {
    id: `u${Date.now()}`,
    email, password, name, phone, shopName,
    role: "vendor" as const,
    status: "pending" as const,
    createdAt: new Date().toISOString().split("T")[0]
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: `fake-token-${newUser.id}` });
});

// Vendor dashboard stats
router.get("/vendor/stats", (req, res) => {
  const vendorEmail = req.headers["x-vendor-email"] as string;
  const user = users.find((u) => u.email === vendorEmail && u.role === "vendor");
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Vendor auth required" });
    return;
  }

  // Fake stats
  res.json({
    weeklyVisits: Math.floor(Math.random() * 800) + 200,
    audioPlays: Math.floor(Math.random() * 500) + 100,
    nearbyNow: Math.floor(Math.random() * 15),
    dailyTraffic: [
      { day: "Mon", visits: 120 },
      { day: "Tue", visits: 95 },
      { day: "Wed", visits: 140 },
      { day: "Thu", visits: 110 },
      { day: "Fri", visits: 185 },
      { day: "Sat", visits: 220 },
      { day: "Sun", visits: 160 }
    ]
  });
});

// Vendor venues list
router.get("/vendor/venues", (req, res) => {
  const vendorEmail = req.headers["x-vendor-email"] as string;
  const user = users.find((u) => u.email === vendorEmail);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Auth required" });
    return;
  }

  const vendorVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(user.shopName?.toLowerCase().split(" ")[0] ?? "")
  );
  res.json(vendorVenues);
});

// Admin: all users
router.get("/admin/users", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }
  res.json(users.map(({ password: _, ...u }) => u));
});

// Admin: pending approvals
router.get("/admin/pending", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }
  res.json(pendingVenues);
});

// Admin: approve or reject venue
router.patch("/admin/pending/:id", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }

  const pv = pendingVenues.find((p) => p.id === req.params.id);
  if (!pv) {
    res.status(404).json({ error: "not_found", message: "Pending venue not found" });
    return;
  }

  const { action, reason } = req.body;
  if (action === "approve") {
    pv.status = "approved";
  } else if (action === "reject") {
    pv.status = "rejected";
    pv.rejectedReason = reason || "Does not meet requirements";
  }
  res.json(pv);
});

// Admin: all venues
router.get("/admin/venues", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }
  res.json(venues);
});

// Admin: dashboard stats
router.get("/admin/stats", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }
  res.json({
    totalVenues: venues.length,
    totalVendors: users.filter((u) => u.role === "vendor").length,
    pendingApprovals: pendingVenues.filter((p) => p.status === "pending").length,
    totalAudioPlays: 12453,
    topLanguages: [
      { lang: "vi", count: 4523 },
      { lang: "en", count: 3201 },
      { lang: "zh", count: 1893 },
      { lang: "ja", count: 987 },
      { lang: "ko", count: 654 }
    ],
    weeklyTraffic: [
      { day: "Mon", visits: 520 },
      { day: "Tue", visits: 435 },
      { day: "Wed", visits: 640 },
      { day: "Thu", visits: 510 },
      { day: "Fri", visits: 785 },
      { day: "Sat", visits: 920 },
      { day: "Sun", visits: 710 }
    ]
  });
});

// Admin: toggle user status
router.patch("/admin/users/:id/status", (req, res) => {
  const adminEmail = req.headers["x-admin-email"] as string;
  const admin = users.find((u) => u.email === adminEmail && u.role === "admin");
  if (!admin) {
    res.status(401).json({ error: "unauthorized", message: "Admin required" });
    return;
  }
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }
  user.status = req.body.status;
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
