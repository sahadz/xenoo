import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react' // CHANGED: Use the hook
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const supabase = useSupabaseClient() // CHANGED: Initialize client here
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

      // Refresh the router to load the new cookies
      router.refresh ? router.refresh() : null
      await router.push('/admin') 
      
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 card mt-12">
      <h2 className="text-xl font-semibold mb-4">Admin login</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-1">Email</label>
        <input 
          className="w-full border p-2 mb-3" 
          type="email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          required 
        />

        <label className="block mb-1">Password</label>
        <input 
          className="w-full border p-2 mb-3" 
          type="password" 
          value={pass} 
          onChange={e=>setPass(e.target.value)} 
          required 
        />

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <button className="btn-gold" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
