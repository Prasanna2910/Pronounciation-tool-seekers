import { useState, useRef } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [phonemes, setPhonemes] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setTranscript("");
    setPhonemes([]);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      sendToServer(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const sendToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    const response = await fetch("http://localhost:5000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setTranscript(data.transcript);
    setPhonemes(data.words);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Pronunciation Test</h2>

      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      <h3>Transcript:</h3>
      <div>{transcript || "No transcript yet"}</div>

      <h3>Phonetics (Per Word):</h3>
      <ul>
        {phonemes.map((w, i) => (
          <li key={i}>
            <strong>{w.word}</strong> →{" "}
            {w.phonemes ? w.phonemes.map(p => p.phones).join(" ") : "(no phonemes)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
