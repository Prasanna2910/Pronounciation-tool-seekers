import axios from "./utils/axios"
import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router"

function Test() {
    const { id } = useParams()
    const [testData, setTestData] = useState(null)
    const [answers, setAnswers] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    // Transcription state
    const [liveTranscription, setLiveTranscription] = useState("")
    const [finalTranscription, setFinalTranscription] = useState("")
    const [trError, setTrError] = useState(null)
    const [trLoading, setTrLoading] = useState(false)
    const [trRecording, setTrRecording] = useState(false)
    const recognitionRef = useRef(null)
    const transcriptRef = useRef("")

    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)
    useEffect(() => {
        const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch (e) { return null } })()
        const level = user?.level || ''
        axios.get(`/test/${id}/${level}/${user?._id}`).then((res) => {
            setTestData(res.data.test)
            const qs = res.data?.test?.questions || []
            setAnswers(Array.from({ length: qs.length }, () => null))
            console.log('loaded test', res.data)
        }).catch((err) => {
            console.error(err)
            setError('Failed to load test')
        })
    }, [id])

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.onresult = null
                    recognitionRef.current.onerror = null
                    recognitionRef.current.onend = null
                    recognitionRef.current.stop?.()
                } catch (e) { }
                recognitionRef.current = null
            }
        }
    }, [])

    const startRecording = () => {
        if (!SpeechRecognition) {
            setTrError('Speech recognition is not supported in this browser')
            return
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onresult = null
                recognitionRef.current.onerror = null
                recognitionRef.current.onend = null
                recognitionRef.current.stop?.()
            } catch (e) { }
            recognitionRef.current = null
        }

        const recog = new SpeechRecognition()
        recognitionRef.current = recog
        recog.continuous = true
        recog.interimResults = true

        setLiveTranscription("")
        transcriptRef.current = ""
        setTrRecording(true)
        setTrLoading(false)
        setTrError(null)
        setFinalTranscription("")

        recog.onresult = (event) => {
            let interim = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i]
                if (r.isFinal) {
                    transcriptRef.current += r[0].transcript
                } else {
                    interim += r[0].transcript
                }
            }
            const combined = (transcriptRef.current + " " + interim).trim()
            transcriptRef.current = transcriptRef.current.trim()
            setLiveTranscription(combined)
        }

        recog.onend = () => {
            const finalText = (transcriptRef.current || liveTranscription || finalTranscription || "").trim()
            setTrRecording(false)
            setTrLoading(false)
            setFinalTranscription(finalText || "No speech detected.")
            setLiveTranscription("")
            transcriptRef.current = ""
            recognitionRef.current = null
        }

        recog.onerror = (event) => {
            console.error('Speech Recognition Error', event)
            setTrError(event?.error || event?.message || 'Unknown error')
            setTrRecording(false)
            setTrLoading(false)
            try { recog.stop?.() } catch (e) { }
            recognitionRef.current = null
        }

        try { recog.start() } catch (err) {
            console.warn('Recognition start error', err)
            setTrError('Failed to start recognition')
            recognitionRef.current = null
            setTrRecording(false)
        }
    }

    const stopRecording = () => {
        if (!recognitionRef.current) {
            setTrRecording(false)
            setTrLoading(false)
            return
        }
        setTrLoading(true)
        try {
            recognitionRef.current.stop()
        } catch (e) {
            console.warn('Error stopping recognition', e)
            const finalText = (transcriptRef.current || liveTranscription || finalTranscription || "").trim()
            setTrRecording(false)
            setTrLoading(false)
            setFinalTranscription(finalText || "No speech detected.")
            setLiveTranscription("")
            transcriptRef.current = ""
            recognitionRef.current = null
        }
    }

    const selectOption = (qIdx, optIdx) => {
        setAnswers(prev => {
            const copy = [...prev]
            copy[qIdx] = optIdx
            return copy
        })
    }

    const handleSubmit = async () => {
        if (!testData) return
        const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch (e) { return null } })()
        if (!user || !user._id) {
            alert('You must be logged in to submit the test')
            return
        }
        // If recording is active, stop it and wait briefly for final transcript
        if (recognitionRef.current) {
            stopRecording()
            // wait until recognitionRef is cleared or timeout
            const waited = await new Promise((resolve) => {
                const start = Date.now()
                const check = () => {
                    if (!recognitionRef.current) return resolve(true)
                    if (Date.now() - start > 3000) return resolve(false)
                    setTimeout(check, 100)
                }
                check()
            })
            if (!waited) {
                // still try to use what we have
            }
        }
        // compute marks
        const qs = testData.questions || []
        let marks = 0
        const answersText = []
        for (let i = 0; i < qs.length; i++) {
            const q = qs[i]
            const selected = answers[i]
            const selectedText = (q.options && selected != null) ? q.options[selected] : null
            answersText.push(selectedText)
            const correctText = q.answer || (q.options && q.options[q.answerIndex])
            if (correctText != null && selectedText === correctText) marks++
        }

        const result = {
            userName: user.name || user.userName || user.email || 'Unknown',
            user_id: user._id,
            marks,
            total: (qs.length || 0),
            answers: answersText,
            level: Number(testData.level),
            transcript: finalTranscription || liveTranscription || '',
            timestamp: new Date().toISOString()
        }

        try {
            setSubmitting(true)
            await axios.post(`/test/submit/${testData._id || id}`, { result, user_id: user._id })
            alert('Results submitted')
        } catch (err) {
            console.error('submit failed', err)
            alert('Submit failed')
        } finally {
            setSubmitting(false)
        }
    }
    return (
        <div className="app-container">
            <div className="card">
                <h2>Test</h2>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {!testData && !error && <div>Loading...</div>}
                {testData && (
                    <div>
                        <div className="spaced">
                            <h3>Paragraph</h3>
                            <p className="muted">{testData.para}</p>
                        </div>

                        <div className="spaced">
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                <button className={trRecording ? 'btn-danger' : 'btn-primary'} onClick={trRecording ? stopRecording : startRecording} disabled={trLoading || !SpeechRecognition}>
                                    {trLoading ? 'Processing...' : trRecording ? 'Stop Speaking' : 'Start Speaking'}
                                </button>
                                {trError && <div style={{ color: 'red' }}>{trError}</div>}
                            </div>

                            <div className="transcript card">
                                <div style={{ fontWeight: 600, marginBottom: 6 }}>Live Transcript</div>
                                <div style={{ minHeight: 24, color: trRecording ? '#111' : '#666', fontStyle: trRecording ? 'normal' : 'italic' }}>{liveTranscription || (trRecording ? 'Start speaking now...' : 'No live transcript')}</div>
                                {finalTranscription && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontWeight: 600 }}>Final Transcript</div>
                                        <div className="transcript" style={{ background: '#f7f7f7', padding: 8, borderRadius: 4 }}>{finalTranscription}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="spaced">
                            <h3>Questions</h3>
                            {(testData.questions || []).map((q, qi) => (
                                <div key={qi} className="card" style={{ marginBottom: 12 }}>
                                    <div style={{ fontWeight: 600 }}>Q{qi + 1}: {q.question}</div>
                                    <div style={{ marginTop: 6 }}>
                                        {(q.options || []).map((opt, oi) => (
                                            <label key={oi} style={{ display: 'block', marginBottom: 6 }}>
                                                <input type="radio" name={`q-${qi}`} checked={answers[qi] === oi} onChange={() => selectOption(qi, oi)} /> {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Test'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Test