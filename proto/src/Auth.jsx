import axios from "./utils/axios"
import { useState } from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "./firebase"
import { useNavigate } from "react-router"

function Auth() {
    const nav = useNavigate()
    const [newUser, setNewUser] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const submit = (name, email) => {
        axios.post('/user/google', { name, email }).then((res) => {
            console.log(res.data)
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            nav("/")
        }).catch((err) => {
            console.log(err)
        })
    }
    const googleSignIn = () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider).then((res) => {
            const user = res.user
            console.log(user)
            axios.post("/user/checkuser", { email: user.email }).then((res) => {
                if (res.data.message == "User does not exist") {
                    console.log("User exists, proceed to login")
                    setNewUser(true)
                    setEmail(user.email)
                    setName(user.displayName)
                }
                else {
                    submit(user.displayName, user.email)
                }
            })
        })

    }
    if (newUser) {
        return (
            <div>
                <input placeholder="Name" onChange={(e) => { setName(e.target.value) }} />
                <button onClick={() => submit(name, email)}>Submit</button>
            </div>

        )
    }
    return (
        <button onClick={googleSignIn}>Sign with google</button>
    )
}
export default Auth