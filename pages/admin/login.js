import { useState } from "react"
import { useRouter } from "next/router"
import supabase from "../../lib/supabaseClient"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = async () => {
    setError("")

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError("Invalid email or password")
      return
    }

    router.push("/admin")
  }

  return (
    <div className="container">
      <h1>Admin Login</h1>

      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={login}>Log in</button>
    </div>
  )
}