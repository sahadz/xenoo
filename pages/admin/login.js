import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
export default function Login() {
  const [email,setEmail]=useState(''), [pass,setPass]=useState('')
  const router = useRouter()
  const handle = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if(error) return alert(error.message)
    router.push('/admin')
  }
  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-lg font-semibold">Admin Login</h2>
      <form className="mt-4" onSubmit={handle}>
        <input className="w-full border p-3 rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value}) />
        <input className="w-full border p-3 rounded mb-2" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value}) />
        <button className="btn-gold" type="submit">Log in</button>
      </form>
    </div>
  )
}
