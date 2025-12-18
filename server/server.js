// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// require("dotenv").config();
// const cors = require("cors");
// const route = require("./routes/user");

// app.use(express.json());
// app.use(cors());
// app.use("/user",route);
// app.use("/test",require("./routes/test"));

// // 404 Middleware
// app.use((req, res, next) => {
//     res.status(404).json({ message: "Route not found" });
// });

// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGO)
// .then(()=>{
//     console.log("Connected to MongoDB");
// })
// .catch((err)=>{
//     console.log("Error connecting to MongoDB: " , err.message);
// });

// app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
// })
import express from "express";
import cors from "cors";
import multer from "multer";
import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import testRoute from "./routes/test.js";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", userRoute);
app.use("/test", testRoute);

const upload = multer({ storage: multer.memoryStorage() });

const deepgram =  createClient("b2399083ddd623491f02173aa1d89fe515bd7d22");

// -------- POST /transcribe -----------
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded" });

    // buffer from multer
    const audioBuffer = req.file.buffer;

    // Call the v3 SDK method for pre-recorded files
    // transcribeFile returns an object { result, error } per docs
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-3",      // or nova-2 / base etc.
        smart_format: true,
        punctuate: true,
        // If Deepgram supports a phoneme flag in your account/region, include it.
        // The SDK permits passing custom params too.
        phoneme: true,        // try phoneme:true (works as a custom param if typed param is missing)
        utterances: true,
      }
    );

    if (error) {
      console.error("Deepgram error:", error);
      return res.status(500).json({ error: error.message || error });
    }

    // result structure (per docs) contains result.results.channels[0].alternatives[0]
    const channel = result?.results?.channels?.[0] ?? null;
    const topAlt = channel?.alternatives?.[0] ?? null;

    const transcript = topAlt?.transcript ?? "";
    const words = topAlt?.words ?? []; // each word may include phoneme info if returned

    return res.json({ transcript, words, raw: result });
  } catch (err) {
    console.error("Transcription failed:", err);
    return res.status(500).json({ error: "Transcription failed", detail: err?.message || err });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
