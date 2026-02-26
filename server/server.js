import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import testRoute from "./routes/test.js";
import connectDB from "./config/db.js";
import CryptoJS from "crypto-js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Readable, PassThrough } from "stream";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", userRoute);
app.use("/test", testRoute);

const upload = multer({ storage: multer.memoryStorage() });

ffmpeg.setFfmpegPath(ffmpegPath);

app.get("/",(req,res)=>{
    res.send("Hello World");
})

/* =========================
   GET AUDIO DURATION
========================= */
const getAudioDuration = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        ffmpeg(stream)
            .inputFormat("webm")
            .ffprobe((err, metadata) => {
                if (err) return reject(err);
                resolve(metadata.format.duration);
            });
    });
};

/* =========================
   SPLIT BUFFER
========================= */
const splitBuffer = (buffer, start, duration) => {
    return new Promise((resolve, reject) => {

        const inputStream = new Readable();
        inputStream.push(buffer);
        inputStream.push(null);

        const chunks = [];
        const outputStream = new PassThrough();

        ffmpeg(inputStream)
            .inputFormat("webm")
            .setStartTime(start)
            .setDuration(duration)
            .format("webm")
            .on("error", reject)
            .pipe(outputStream);

        outputStream.on("data", (chunk) => chunks.push(chunk));
        outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};

/* =========================
   CALL LANGUAGE API
========================= */
const callEnglishAPI = async (base64, expectedText) => {
    const response = await fetch(process.env.ENGLISH_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.API_KEY,
            "x-user-id": "vamsi"
        },
        body: JSON.stringify({
            audio_base64: base64,
            expected_text: expectedText,
            audio_format: "webm"
        })
    });

    return response.json();
};

/* =========================
   MERGE RESULTS PROPERLY
========================= */
const mergeResults = (r1, r2) => {

    const totalTime =
        (r1.reading?.total_time || 0) +
        (r2.reading?.total_time || 0);

    const correctWords =
        (r1.reading?.correct_words_read || 0) +
        (r2.reading?.correct_words_read || 0);

    const wordsRead =
        (r1.reading?.words_read || 0) +
        (r2.reading?.words_read || 0);

    const wpm = totalTime > 0
        ? (correctWords / totalTime) * 60
        : 0;

    const accuracy = wordsRead > 0
        ? (correctWords / wordsRead)
        : 0;

    return {
        pronunciation: {
            overall_score:
                ((r1.pronunciation?.overall_score || 0) +
                 (r2.pronunciation?.overall_score || 0)) / 2
        },
        fluency: {
            overall_score:
                ((r1.fluency?.overall_score || 0) +
                 (r2.fluency?.overall_score || 0)) / 2
        },
        overall: {
            overall_score:
                ((r1.overall?.overall_score || 0) +
                 (r2.overall?.overall_score || 0)) / 2
        },
        reading: {
            total_time: totalTime,
            correct_words_read: correctWords,
            words_read: wordsRead,
            speed_wpm_correct: wpm,
            accuracy: accuracy
        }
    };
};

/* =========================
   UPDATED ROUTE
========================= */
app.post("/get_result", upload.single("file"), async (req, res) => {

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        const duration = await getAudioDuration(req.file.buffer);

        // ✅ If <= 2 minutes
        if (duration <= 120) {
            const base64 = req.file.buffer.toString("base64");
            const result = await callEnglishAPI(base64, req.body.expected_text);
            return res.json(result);
        }

        // ✅ If > 2 minutes → split
        const chunk1 = await splitBuffer(req.file.buffer, 0, 120);
        const chunk2 = await splitBuffer(req.file.buffer, 120, duration - 120);

        const result1 = await callEnglishAPI(chunk1.toString("base64"), req.body.expected_text);
        const result2 = await callEnglishAPI(chunk2.toString("base64"), req.body.expected_text);

        const merged = mergeResults(result1, result2);

        return res.json(merged);

    } catch (error) {
        console.error("Processing error:", error);
        res.status(500).json({ error: "Audio processing failed" });
    }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));