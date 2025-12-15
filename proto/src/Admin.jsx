import axios from "axios"
import { useEffect, useState } from "react"

function Admin(){
    const [tests,setTests]=useState([])
    const [showForm,setShowForm]=useState(false)
    const [selectedIdx, setSelectedIdx] = useState(null)
    const [levelFilter, setLevelFilter] = useState('All')
    const [editing, setEditing] = useState(false)

    useEffect(()=>{
        axios.get("http://localhost:5000/test/").then((res)=>{
            const payload = res.data
            setTests(Array.isArray(payload) ? payload : (payload.tests || []))
        }).catch(()=>{})
    }, [])

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const formatDateDisplay = (yyyyMmDd) =>{
        if(!yyyyMmDd) return ''
        const [y,m,d] = yyyyMmDd.split('-')
        const day = parseInt(d,10)
        const mon = monthNames[parseInt(m,10)-1]
        return `${day}${mon}${y}`
    }

    const todayYMD = (()=>{
        const t = new Date()
        const y = t.getFullYear()
        const m = String(t.getMonth()+1).padStart(2,'0')
        const d = String(t.getDate()).padStart(2,'0')
        return `${y}-${m}-${d}`
    })()

    // Form state
    const emptyQuestions = ()=>Array.from({length:3}, ()=>({question:'', options:['','','',''], answerIndex:0}))
    const [para, setPara] = useState('')
    const [level, setLevel] = useState('')
    const [date, setDate] = useState(todayYMD)
    const [questions, setQuestions] = useState(emptyQuestions)
    const [errors, setErrors] = useState({})

    const updateQuestionField = (qIdx, field, value) =>{
        setQuestions(prev=>{
            const copy = prev.map(q=>({...q}))
            copy[qIdx][field] = value
            return copy
        })
    }
    const updateOption = (qIdx, optIdx, value)=>{
        setQuestions(prev=>{
            const copy = prev.map(q=>({...q, options: [...q.options]}))
            copy[qIdx].options[optIdx] = value
            return copy
        })
    }
    const setAnswerIndex = (qIdx, idx)=>{
        setQuestions(prev=>{
            const copy = prev.map(q=>({...q}))
            copy[qIdx].answerIndex = idx
            return copy
        })
    }

    const validate = ()=>{
        const e = {}
        if(!para.trim()) e.para = 'Paragraph is required'
        if(!level.trim()) e.level = 'Level is required'
        if(!date) e.date = 'Date is required'
        questions.forEach((q,qi)=>{
            if(!q.question.trim()) e[`q${qi}`] = 'Question required'
            q.options.forEach((opt,oi)=>{ if(!opt.trim()) e[`q${qi}o${oi}`] = 'Option required' })
        })
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev)=>{
        ev.preventDefault()
        if(!validate()) return
        const testObj = {
            date: formatDateDisplay(date),
            level,
            para,
            questions: questions.map(q=>({question: q.question, options: q.options, answer: q.options[q.answerIndex]}))
        }
        setTests(prev => [testObj, ...prev])
        try{
            await axios.post('http://localhost:5000/test/', testObj)
        }catch(err){
            console.error('Error submitting test:', err)
        }
        setPara('')
        setLevel('')
        setDate(todayYMD)
        setQuestions(emptyQuestions)
        setShowForm(false)
        setErrors({})
    }
    const filteredTests = tests.filter(t=> {
        if(levelFilter === 'All') return true
        return String(t.level) === String(levelFilter)
    })

    const selectTest = (idx)=>{
        setSelectedIdx(idx)
        setEditing(false)
        // populate form states with selected test so update can reuse them
        const t = filteredTests[idx]
        if(!t) return
        setPara(t.para || '')
        setLevel(t.level || '')
        setDate(t.date || todayYMD)
        // do not attempt to fully map questions for editing here
    }

    const handleDelete = async (test)=>{
        const id = test._id
        if(!id){
            // fallback: remove by matching date+level if no id
            if(!confirm('No id present. Remove this test from UI?')) return
            setTests(prev=> prev.filter(p=> !(p.date===test.date && p.level===test.level)))
            setSelectedIdx(null)
            return
        }
        if(!confirm('Delete this test?')) return
        try{
            await axios.delete(`http://localhost:5000/test/${id}`)
            setTests(prev=> prev.filter(p=> p._id !== id))
            setSelectedIdx(null)
        }catch(err){
            console.error('Delete failed', err)
            alert('Delete failed')
        }
    }

    const handleUpdateSelected = async ()=>{
        if(selectedIdx === null) return
        const test = filteredTests[selectedIdx]
        if(!test) return
        const id = test._id
        const updates = { para, level, date }
        try{
            if(id){
                const resp = await axios.put(`http://localhost:5000/test/${id}`, updates)
                const updated = resp.data.test || { ...test, ...updates }
                setTests(prev => prev.map(p=> p._id === id ? updated : p))
            }else{
                // no id: update in UI only
                setTests(prev=> prev.map(p=> (p.date===test.date && p.level===test.level) ? {...p, ...updates} : p))
            }
            setEditing(false)
        }catch(err){
            console.error('Update failed', err)
            alert('Update failed')
        }
    }

    return(
        <div className="app-container">
            <div className="layout">
            <div className="sidebar card">
                <div style={{marginBottom:12}}>
                    <button className="btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm ? 'Close Form' : 'Create Form'}</button>
                </div>

                <div style={{marginBottom:12}}>
                    <strong>Filter:</strong>
                    <div style={{display:'flex', gap:6, marginTop:6}}>
                        {['All','1','2','3','4'].map(f=> (
                            <button key={f} onClick={()=>{setLevelFilter(f); setSelectedIdx(null)}} style={{padding:6, background: levelFilter===f ? '#eee' : 'white'}}>{f}</button>
                        ))}
                    </div>
                </div>

                <div style={{maxHeight: '70vh', overflow:'auto'}}>
                    {filteredTests.length === 0 && <div>No tests</div>}
                    {filteredTests.map((t, idx)=> (
                        <div key={t._id || `${t.date}-${idx}`} onClick={()=>selectTest(idx)} style={{padding:8, borderBottom:'1px solid #f0f0f0', cursor:'pointer', background: selectedIdx===idx ? '#fafafa' : 'white'}}>
                            <div style={{fontSize:13}}>{t.date}</div>
                            <div style={{fontSize:12, color:'#666'}}>Level: {t.level}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="main-panel card">
                {showForm && (
                <form onSubmit={handleSubmit} style={{border:'1px solid #ddd', padding:12, marginBottom:18}}>
                    <div style={{marginBottom:8}}>
                        <label>Paragraph:</label><br/>
                        <textarea value={para} onChange={e=>setPara(e.target.value)} rows={4} cols={60} className="form-field" />
                        {errors.para && <div style={{color:'red'}}>{errors.para}</div>}
                    </div>

                    <div style={{marginBottom:8}}>
                        <label>Level:</label><br/>
                        <input value={level} onChange={e=>setLevel(e.target.value)} placeholder="e.g. Beginner" />
                        {errors.level && <div style={{color:'red'}}>{errors.level}</div>}
                    </div>

                    <div style={{marginBottom:8}}>
                        <label>Date:</label><br/>
                        <input type="date" value={date} min={todayYMD} onChange={e=>setDate(e.target.value)} />
                        <div style={{fontSize:12, color:'#666'}}>Selected: {formatDateDisplay(date)}</div>
                        {errors.date && <div style={{color:'red'}}>{errors.date}</div>}
                    </div>

                    <div>
                        {questions.map((q,qi)=> (
                            <div key={qi} style={{borderTop:'1px solid #eee', paddingTop:8, marginTop:8}}>
                                <h4>Question {qi+1}</h4>
                                <input style={{width:'100%'}} placeholder={`Question ${qi+1}`} value={q.question} onChange={e=>updateQuestionField(qi,'question', e.target.value)} />
                                {errors[`q${qi}`] && <div style={{color:'red'}}>{errors[`q${qi}`]}</div>}
                                <div style={{marginTop:6}}>
                                    {q.options.map((opt,oi)=> (
                                        <div key={oi} style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                                            <input type="radio" name={`correct-${qi}`} checked={q.answerIndex===oi} onChange={()=>setAnswerIndex(qi, oi)} />
                                            <input placeholder={`Option ${oi+1}`} value={opt} onChange={e=>updateOption(qi, oi, e.target.value)} style={{flex:1}} />
                                            {errors[`q${qi}o${oi}`] && <div style={{color:'red'}}>{errors[`q${qi}o${oi}`]}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{marginTop:12}}>
                        <button className="btn-primary" type="submit">Submit Test</button>
                        <button className="btn-ghost" type="button" onClick={()=>setShowForm(false)} style={{marginLeft:8}}>Cancel</button>
                    </div>
                </form>
                )}

                {!showForm && (
                    <div>
                        {selectedIdx === null && <div className="muted">Select a test from the left to see details</div>}
                        {selectedIdx !== null && (()=>{
                            const test = filteredTests[selectedIdx]
                            if(!test) return <div>Invalid selection</div>
                            return (
                                <div>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <div>
                                            <h3 style={{margin:0}}>{test.date}</h3>
                                            <div style={{fontSize:12, color:'#666'}}>Level: {test.level}</div>
                                        </div>
                                        <div style={{display:'flex', gap:8}}>
                                            <button className="btn-ghost" onClick={()=>{ setEditing(e=>!e) }}>{editing ? 'Cancel Edit' : 'Edit'}</button>
                                            <button className="btn-danger" onClick={()=>handleDelete(test)}>Delete</button>
                                        </div>
                                    </div>

                                    {editing ? (
                                        <div style={{marginTop:12}}>
                                            <div>
                                                <label>Paragraph</label><br/>
                                                <textarea value={para} onChange={e=>setPara(e.target.value)} rows={4} cols={60} />
                                            </div>
                                            <div>
                                                <label>Level</label><br/>
                                                <input value={level} onChange={e=>setLevel(e.target.value)} />
                                            </div>
                                            <div style={{marginTop:8}}>
                                                <button className="btn-primary" onClick={handleUpdateSelected}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{marginTop:12}}>
                                            <p>{test.para}</p>
                                            <div>
                                                {test.questions && test.questions.map((q,qi)=> (
                                                    <div key={qi} style={{marginBottom:8}}>
                                                        <h4>Q{qi+1}: {q.question}</h4>
                                                        <p><strong>Answer:</strong> {q.answer || q.options && q.options[q.answerIndex] || ''}</p>
                                                        <div>{q.options && q.options.map((option, i) => (
                                                            <div key={i}>{option}</div>
                                                        ))}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{marginTop:18}}>
                                                <h4>Results</h4>
                                                {(!test.results || test.results.length===0) && <div>No results yet</div>}
                                                {test.results && test.results.map((r,ri)=> (
                                                    <div key={ri} style={{borderTop:'1px solid #eee', paddingTop:8, marginTop:8}}>
                                                        <div><strong>User:</strong> {r.userName || r.user || r.user_id || r.name || 'Unknown'}</div>
                                                        <div><strong>Marks:</strong> {r.marks ?? r.score ?? r.mark ?? 'N/A'}</div>
                                                        <div><strong>Transcript:</strong></div>
                                                        <pre style={{whiteSpace:'pre-wrap', background:'#fafafa', padding:8,color:"black"}}>{r.transcript || r.text || r.trans || '—'}</pre>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
            </div>
            </div>
    )
}

export default Admin