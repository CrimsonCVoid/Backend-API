import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { GetSolarDataByCoords } from "./GetGoogleData.js";

const app = express();
app.use(express.json());
app.use(cors());

// ❗ These come from environment variables on the Droplet
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ This client uses the *service role* key, NEVER sent to the frontend
// const supabase = createClient(supabaseUrl, serviceRoleKey);

// // Simple example: secure endpoint that fetches all users
// app.get("/api/users", async (req, res) => {
//   const { data, error } = await supabase
//     .from("users")
//     .select("*");

//   if (error) {
//     console.error(error);
//     return res.status(500).json({ error: "DB error" });
//   }

//   res.json(data);
// });

// // Example POST
// app.post("/api/add-user", async (req, res) => {
//   const { email } = req.body;
//   const { data, error } = await supabase
//     .from("users")
//     .insert({ email })
//     .select()
//     .single();

//   if (error) {
//     console.error(error);
//     return res.status(400).json({ error: error.message });
//   }

//   res.json(data);
// });

app.get("/api/getroofbycoords", async (req, res) => {
    console.log("Request???");
    let DATA = await GetSolarDataByCoords(req.query.lat, req.query.lon);
    res.status(200).json(DATA);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
