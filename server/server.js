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

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Helper to convert buffer to PCM
const convertWebmToPcm = (inputBuffer) => {
    return new Promise((resolve, reject) => {
        const inputStream = new Readable();
        inputStream.push(inputBuffer);
        inputStream.push(null);

        const chunks = [];
        const outStream = new PassThrough();

        ffmpeg(inputStream)
            .inputFormat('webm')
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .format('s16le')
            .on('error', (err) => reject(err))
            .pipe(outStream);

        outStream.on('data', (chunk) => chunks.push(chunk));
        outStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};


// Helper function for Auth
function getAuthStr(date, config) {
    let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
    let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
    let signature = CryptoJS.enc.Base64.stringify(signatureSha);
    let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
    return authStr;
}

app.post("/get_result", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }


    const fileBuffer=req.file.buffer
    const buffer=Buffer.from(fileBuffer)
    const base64=buffer.toString("base64")
    try {
        const response = await fetch(process.env.ENGLISH_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.API_KEY,
                "x-user-id": "vamsi"
            },
            body: JSON.stringify({audio_base64:base64,
            expected_text:req.body.expected_text,audio_format:"webm"})
        });

        const data = await response.json();
        console.log(data)
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));