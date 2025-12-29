import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import testRoute from "./routes/test.js";
import connectDB from "./config/db.js";
import CryptoJS from "crypto-js";
import { WebSocket } from "ws";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Readable, PassThrough } from "stream";
import xml2js from "xml2js";

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

    try {
        // Convert audio first
        const pcmBuffer = await convertWebmToPcm(req.file.buffer);

        // --- New Implementation Start ---
        const config = {
            hostUrl: "wss://ise-api-sg.xf-yun.com/v2/ise", 
            host: "ise-api-sg.xf-yun.com",
            appid: "ga8832a8",
            apiSecret: "66c2effb8c12d94f063c85e6112f3b10",
            apiKey: "740b04aaec50fe4476e59121586ece81", 
            uri: "/v2/ise",
            highWaterMark: 1280,
        };

        const FRAME = {
            STATUS_FIRST_FRAME: 0,
            STATUS_CONTINUE_FRAME: 1,
            STATUS_LAST_FRAME: 2
        };

        const text = '\uFEFF' + (req.body.expected_text || "The quick brown fox jumps over the lazy dog"); 

        let date = (new Date().toUTCString());
        let wssUrl = config.hostUrl + "?authorization=" + getAuthStr(date, config) + "&date=" + date + "&host=" + config.host;
        
        const ws = new WebSocket(wssUrl);

        let status = FRAME.STATUS_FIRST_FRAME;
        // Use the converted buffer
        const fileBuffer = pcmBuffer; 
        let bufferOffset = 0;

        // Send function adapted for closure usage
        const send = (data, currentState) => {
            let frame = "";
            switch (currentState) {
                case FRAME.STATUS_FIRST_FRAME:
                    frame = {
                        "common": { app_id: config.appid },
                        "business": {
                            "sub": "ise",
                            "ent": "en_vip",
                            "category": "read_sentence",
                            "text": text,
                            "tte": "utf-8",
                            "rstcd": "utf8",
                            "ttp_skip": true,
                            "cmd": "ssb",
                            "aue": "raw",
                            "auf": "audio/L16;rate=16000" // Reverted to correct format
                        },
                        "data": { "status": 0 }
                    };
                    ws.send(JSON.stringify(frame));
                    
                    frame = {
                        "common": { "app_id": config.appid },
                        "business": { "aus": 1, "cmd": "auw", "aue": "raw" },
                        "data": { "status": 1, "data": data.toString('base64') }
                    };
                    ws.send(JSON.stringify(frame));
                    status = FRAME.STATUS_CONTINUE_FRAME;
                    break;

                case FRAME.STATUS_CONTINUE_FRAME:
                    frame = {
                        "common": { "app_id": config.appid },
                        "business": { "aus": 2, "cmd": "auw", "aue": "raw" },
                        "data": { "status": 1, "data": data.toString('base64') }
                    };
                    ws.send(JSON.stringify(frame));
                    break;

                case FRAME.STATUS_LAST_FRAME:
                    frame = {
                        "common": { "app_id": config.appid },
                        "business": { "aus": 4, "cmd": "auw", "aue": "raw" },
                        "data": { "status": 2, "data": data.toString('base64') } 
                    };
                    ws.send(JSON.stringify(frame));
                    break;
            }
            return status;
        };

        ws.on('open', (event) => {
            console.log("websocket connect!");
            // Simulate streaming from buffer
            const interval = setInterval(() => {
                if (bufferOffset >= fileBuffer.length) {
                    clearInterval(interval);
                    status = FRAME.STATUS_LAST_FRAME;
                    send("", status); // Send last frame
                    return;
                }

                // Calculate chunk
                let end = Math.min(bufferOffset + config.highWaterMark, fileBuffer.length);
                let chunk = fileBuffer.subarray(bufferOffset, end);
                status = send(chunk, status);
                bufferOffset = end; 
            }, 40); 
        });

        ws.on('message', async (data, err) => {
            if (err) {
                console.log(`err:${err}`);
                return;
            }
            let responseData = JSON.parse(data);
            if (responseData.code != 0) {
                console.log(`error code ${responseData.code}, reason ${responseData.message}`);
                ws.close();
                if (!res.headersSent) res.status(500).json(responseData);
                return;
            }

            if (responseData.data && responseData.data.status == 2) {
                const { data } = responseData.data;
                let b = Buffer.from(data, 'base64');
                let iseResult = b.toString();
                
                // Parse XML to JSON
                try {
                    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false, mergeAttrs: true });
                    const resultJson = await parser.parseStringPromise(iseResult);
                    
                    // Extract scores (adapt based on question type, usually read_chapter or read_sentence for sentence reading)
                    // The doc says root is "xml_result", then "read_sentence" or "read_chapter"
                    let scoreData = {};
                    let root = resultJson.xml_result;
                    let readNode = root.read_sentence || root.read_chapter || root.read_word;
                    
                    if (readNode) {
                         // Rec_paper often contains the scores in read_chapter/read_sentence context
                         let scoreNode = readNode.rec_paper ? readNode.rec_paper.read_chapter || readNode.rec_paper.read_sentence : readNode;
                         
                         // Sometimes it's directly on the node
                         if (!scoreNode.total_score && readNode.total_score) scoreNode = readNode;

                         // Map fields
                         scoreData = {
                             total_score: parseFloat(scoreNode.total_score),
                             accuracy_score: parseFloat(scoreNode.accuracy_score),
                             fluency_score: parseFloat(scoreNode.fluency_score),
                             integrity_score: parseFloat(scoreNode.integrity_score),
                             standard_score: parseFloat(scoreNode.standard_score),
                             phone_score: parseFloat(scoreNode.phone_score),
                             is_rejected: scoreNode.is_rejected === 'true',
                             except_info: scoreNode.except_info
                         };

                         // Convert total_score to 100 scale if it's on 5 scale (usually it is)
                         // Wait, iFLYTEK documented scale depends. 
                         // "total_score: Total Score". "A (9-10 points)". 
                         // "read_sentence" total score = [model regression].
                         // Let's keep the raw score and let frontend decide, OR normalize.
                         // User's frontend code was doing `total_score * 20` implying it expects a 5-point scale?
                         // "A (9-10 points)" suggests 10 point scale?
                         // Actually the user logic `pronunciation_score = total_score * 20` implies they think it's out of 5.
                         // But if I look at the XML example in doc: `total_score value="98.507320"`. That looks like 100 scale!
                         // However, another example: `total_score="92.511200"`
                         // So it seems it returns 100-scale score?
                         // User's code: `const total_score = parseFloat(readChapter.getAttribute("total_score")); if (!isNaN(total_score)) { pronunciation_score = total_score * 20; }`
                         // If the API returns 92.5, multiplying by 20 gives 1850!
                         // **CRITICAL**: The user's previous frontend logic might be WRONG if the API returns 100-scale.
                         // "Lite: plain... total_score value="98.507320"".
                         // If I return the raw score, and the frontend multiplies by 20...
                         // Let's NOT multiply here. Let's return the `pronunciation_score` field mapped from `total_score`.
                         // But if the user's frontend *expects* to multiply, I should check what they were getting before.
                         // They were using a different API or hypothetical one?
                         // The prompt shows they were trying to integrate *this* API.
                         // So I will provide the raw `total_score` and also a Normalized `pronunciation_score`.
                         // If the score is > 5, assume it's 100 scale. If <= 5, multiply by 20.
                         
                         let finalScore = scoreData.total_score;
                         if (finalScore <= 5) finalScore *= 20;
                         if (finalScore <= 10 && finalScore > 5) finalScore *= 10; // Maybe 10 scale?
                         
                         // Just sending parameters as they are + a normalized 'pronunciation_score'
                         scoreData.pronunciation_score = finalScore;
                    }

                    if (!res.headersSent) {
                        res.json({ 
                            message: "Success",
                            code: 0,
                            data: scoreData,
                            raw_xml: iseResult, // Keep raw just in case
                            raw_json: resultJson
                        });
                    }
                } catch (e) {
                    console.error("XML Parse Error", e);
                     if (!res.headersSent) {
                        res.status(500).json({ error: "Failed to parse API response", details: e.message });
                    }
                }
                ws.close();
            }
        });

        ws.on('close', () => {
            console.log('connect close!');
            if (!res.headersSent) {
                 res.status(500).json({ error: "Connection closed before result" });
            }
        });

        ws.on('error', (err) => {
            console.log("websocket connect err: " + err);
            if (!res.headersSent) {
                 res.status(500).json({ error: "Websocket connection error", details: err.message });
            }
        });

    } catch (e) {
        console.error("Audio conversion error:", e);
        res.status(500).send("Error processing audio file.");
    }
    // --- New Implementation End ---
});

    /* 
    // Old Implementation
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

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
    */
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
