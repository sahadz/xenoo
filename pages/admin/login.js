// pages/admin/login.js
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'   // must match the export below
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
      // 1) call sign-in and capture full response
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })

      console.log('signIn response:', { data, signInError })

      if (signInError) {
        // show readable message
        setError(signInError.message || JSON.stringify(signInError))
        setLoading(false)
        return
      }

      // 2) Immediately verify client session exists
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      console.log('post-login session:', { sessionData, sessionErr })

      if (sessionErr) {
        setError('Could not read session after login: ' + sessionErr.message)
        setLoading(false)
        return
      }

      if (!sessionData?.session) {
        // Common failure point — npm env / cookies issue
        setError('Login appeared successful but no session was found on client. Check env and cookies.')
        setLoading(false)
        return
      }

      // All good — go to admin (server-side will re-check and allow)
      router.push('/admin')
    } catch (err) {
      console.error('Login error (catch):', err)
      setError(err?.message || String(err))
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

        {error && <div className="text-red-600 mb-3" role="alert">{error}</div>}

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
