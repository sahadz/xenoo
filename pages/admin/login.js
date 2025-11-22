// pages/admin/login.js
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })

      if (signInError) throw signInError

      // after sign-in, server-side check on /admin will run and allow/deny
      router.push('/admin')
    } catch (err) {
      console.error('Login error', err)
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 card mt-12">
      <h2 className="text-xl font-semibold mb-4">Admin login</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-1">Email</label>
        <input className="w-full border p-2 mb-3" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

        <label className="block mb-1">Password</label>
        <input className="w-full border p-2 mb-3" type="password" value={pass} onChange={e=>setPass(e.target.value)} required />

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <div className="flex gap-2">
          <button className="btn-gold" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button type="button" className="px-3 py-2 border rounded" onClick={()=>{ setEmail(''); setPass(''); setError('') }}>
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}