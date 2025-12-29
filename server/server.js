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
                          // If rec_paper exists, use its child node (read_chapter or read_sentence) for scores
                          let scoreNode = readNode.rec_paper ? (readNode.rec_paper.read_chapter || readNode.rec_paper.read_sentence || readNode.rec_paper) : readNode;
                          
                          // Sometimes the scores are directly on the main node if rec_paper structure varies, 
                          // but usually rec_paper contains the final scores.
                          // Fallback to readNode if scoreNode doesn't have total_score
                          if (!scoreNode.total_score && readNode.total_score) scoreNode = readNode;
 
                          // Extract raw metrics
                          const total_score = parseFloat(scoreNode.total_score || 0);
                          const accuracy_score = parseFloat(scoreNode.accuracy_score || 0);
                          const fluency_score = parseFloat(scoreNode.fluency_score || 0);
                          const integrity_score = parseFloat(scoreNode.integrity_score || 0);
                          const standard_score = parseFloat(scoreNode.standard_score || 0);
                          const phone_score = parseFloat(scoreNode.phone_score || 0);
                          const time_len = parseInt(scoreNode.time_len || readNode.time_len || 0); // 10ms frames
                          const word_count = parseInt(scoreNode.word_count || readNode.word_count || 0);

                          // Normalize total_score to 100-point scale
                          // Heuristic: If score <= 5, multiply by 20. If <= 10 && > 5, multiply by 10. Else assume 100 already.
                          let pronunciation_score = total_score;
                          if (total_score <= 5 && total_score > 0) pronunciation_score = total_score * 20;
                          else if (total_score <= 10 && total_score > 5) pronunciation_score = total_score * 10;
                          
                          // Calculate WPM (Words Per Minute)
                          // time_len is in 10ms units. 
                          // Duration in seconds = time_len * 0.01
                          // Duration in minutes = duration_seconds / 60
                          let wpm = 0;
                          if (time_len > 0) {
                              const duration_min = (time_len * 0.01) / 60;
                              if (duration_min > 0) {
                                wpm = Math.round(word_count / duration_min);
                              }
                          }
 
                          // Map fields for response
                          scoreData = {
                              total_score: total_score, // Raw score
                              pronunciation_score: parseFloat(pronunciation_score.toFixed(2)), // Normalized to 100
                              accuracy_score: accuracy_score,
                              fluency_score: fluency_score,
                              integrity_score: integrity_score,
                              standard_score: standard_score, // Sometimes called proficiency or standardness
                              phone_score: phone_score,
                              is_rejected: scoreNode.is_rejected === 'true',
                              except_info: scoreNode.except_info,
                              word_count: word_count,
                              time_len: time_len,
                              wpm: wpm,
                              proficiency_score: standard_score // Mapping "proficatiol score" -> standardness/proficiency
                          };
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
