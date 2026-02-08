import express from "express";
import cors from "cors";
import { GetSolarDataByCoords } from "./GetGoogleData.js";
import { convertGoogleToRoofData } from "./ConvertGoogleToRoofData.js";

const app = express();
app.use(express.json());
app.use(cors());

// VPC API key authentication
const API_KEY = process.env.INTERNAL_API_KEY;

// Health check — no auth required
app.get("/health", (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// API key middleware — protects all routes below this point
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    console.warn(`[Auth] Rejected request to ${req.path} — invalid API key`);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// POST /generate — called by Frontend proxy (/api/roof-generate)
// Accepts { lat, lng }, fetches Google Solar data, converts to RoofData format
app.post("/generate", async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  console.log(`[generate] Processing request for (${lat}, ${lng})`);

  try {
    const googleData = await GetSolarDataByCoords(lat, lng);
    const roofData = convertGoogleToRoofData(googleData);
    console.log(`[generate] Success — total_area_sf: ${roofData.total_area_sf}, planes: ${roofData.planes.length}`);
    res.json(roofData);
  } catch (err) {
    console.error("[generate] Failed:", err);
    res.status(500).json({ error: err.message || "Generation failed" });
  }
});

// Legacy route — kept for backward compatibility
app.get("/api/getroofbycoords", async (req, res) => {
  console.log("[getroofbycoords] Request received");
  try {
    let DATA = await GetSolarDataByCoords(req.query.lat, req.query.lon);
    res.status(200).json(DATA);
  } catch (err) {
    console.error("[getroofbycoords] Failed:", err);
    res.status(500).json({ error: err.message || "Failed to fetch roof data" });
  }
});

// Bind to VPC private IP (10.108.0.3) on port 4000
const PRIVATE_IP = process.env.PRIVATE_IP || "0.0.0.0";
const PORT = process.env.PORT || 4000;
app.listen(PORT, PRIVATE_IP, () => {
  console.log(`Algorithm API listening on ${PRIVATE_IP}:${PORT}`);
  if (API_KEY) {
    console.log("[Auth] API key authentication enabled");
  } else {
    console.warn("[Auth] WARNING: No INTERNAL_API_KEY set — endpoints are unprotected");
  }
});
