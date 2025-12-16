import { useEffect, useState } from "react"
import axios from "./utils/axios"
import { useNavigate } from "react-router"

function Dashboard() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const nav = useNavigate()

    useEffect(() => {
        axios.get("/user/profile")
            .then((res) => {
                setUser(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setError("Failed to load profile")
                setLoading(false)
                if (err.response && err.response.status === 401) {
                    nav("/auth")
                }
            })
    }, [nav])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>
    if (!user) return <div>No user data</div>

    return (
        <div className="app-container">
            <div className="card">
                <h2>Dashboard</h2>
                <div className="spaced">
                    <h3>Profile</h3>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Current Level:</strong> {user.level}</p>
                </div>

                <div className="spaced">
                    <h3>Test History</h3>
                    {user.tests && user.tests.length > 0 ? (
                        <div style={{ display: "grid", gap: "10px" }}>
                            {user.tests.map((test, index) => (
                                <div key={index} className="card" style={{ background: "#f9f9f9" }}>
                                    <div><strong>Date:</strong> {new Date(test.timestamp).toLocaleDateString()}</div>
                                    <div><strong>Marks:</strong> {test.marks} / {test.total}</div>
                                    <div><strong>Level:</strong> {test.level}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No tests taken yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
