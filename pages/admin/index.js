import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

// --- COMPONENT START ---
export default function AdminPage({ products: initialProducts }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts || [])
  
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button className="px-3 py-2 border rounded" onClick={handleLogout}>Logout</button>
      </div>
      <div className="p-4 border rounded bg-green-50">
        <p className="text-green-800">✅ You are logged in!</p>
      </div>
      {/* Simplified UI for testing */}
    </div>
  )
}

// --- SERVER SIDE DEBUGGING ---
export async function getServerSideProps(ctx) {
  // 1. Import Server Client
  const { createPagesServerClient } = await import('@supabase/auth-helpers-nextjs')
  const supabaseServer = createPagesServerClient(ctx)

  console.log("\n--- DEBUGGING LOGIN ---")

  // 2. Check Session
  const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
  
  if (sessionError) console.log("❌ Session Error:", sessionError.message)
  
  if (!session) {
    console.log("❌ Status: NO SESSION FOUND. (Cookies missing or invalid)")
    console.log("-> Redirecting to /admin/login")
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  console.log("✅ Status: Session Found for user:", session.user.email)
  console.log("ℹ️  User ID:", session.user.id)

  // 3. Check Admin Table
  const { data: admin, error: adminErr } = await supabaseServer
    .from('admins')
    .select('*')
    .eq('uid', session.user.id)

  if (adminErr) console.log("❌ DB Error checking admin table:", adminErr.message)
  console.log("ℹ️  Admin Table Result:", admin)

  if (!admin || admin.length === 0) {
    console.log("❌ Status: USER NOT IN ADMIN TABLE")
    console.log("-> Redirecting to / (Home)")
    return { redirect: { destination: '/', permanent: false } }
  }

  console.log("✅ Status: SUCCESS. Loading Admin Page...")
  console.log("-----------------------\n")

  return { props: { products: [] } }
}
