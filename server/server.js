import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import testRoute from "./routes/test.js";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", userRoute);
app.use("/test", testRoute);

const upload = multer({ storage: multer.memoryStorage() });
app.post("/get_result",upload.single("file"),async(req,res)=>{
    if(!req.file){
        return res.status(400).send("No file uploaded.")
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

        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
