import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router"

function Home(){
    const [date,setDate]=useState("")
    useEffect(()=>{
        const todayYMD = (()=>{
            const t = new Date()
            const y = t.getFullYear()
            const m = String(t.getMonth()+1).padStart(2,'0')
            const d = String(t.getDate()).padStart(2,'0')
            return `${y}-${m}-${d}`
        })()
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        const formatDateDisplay = (yyyyMmDd) =>{
            if(!yyyyMmDd) return ''
            const [y,m,d] = yyyyMmDd.split('-')
            const day = parseInt(d,10)
            const mon = monthNames[parseInt(m,10)-1]
            setDate(`${day}${mon}${y}`)
            return `${day}${mon}${y}`
        }
        formatDateDisplay(todayYMD)

        axios.get("http://localhost:5000/test/").then((res)=>{
            console.log(res.data)
        }).catch((err)=>{
            console.log(err)
        })
    },[])
    return(
        <div className="app-container">
            <div className="card">
                <h1>Welcome{localStorage.getItem("user") ? `, ${JSON.parse(localStorage.getItem("user")).name}` : ''}</h1>
                <p className="spaced muted">Take a quick pronunciation test or manage tests in admin.</p>

                <div style={{display:'flex', gap:8}}>
                    <Link to={`/test/${date}`} className="btn-primary">Take today's test</Link>
                    <Link to="/admin" className="btn-ghost">Admin</Link>
                </div>
            </div>
        </div>
    )
}
export default Home