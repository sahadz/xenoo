// pages/admin/index.js
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AdminPage({ products: initialProducts }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts || [])
  const [form, setForm] = useState({ name: '', rate: '', sizes: 'S,M,L', description: '', image: null })
  const [loading, setLoading] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let image_url = null
      if (form.image) {
        const file = form.image
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const path = `public/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(path, file, { upsert: false })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('products').getPublicUrl(uploadData.path)
        image_url = urlData.publicUrl
      }

      const { data, error } = await supabase.from('products').insert([{
        name: form.name,
        rate: form.rate,
        sizes: form.sizes.split(',').map(s=>s.trim()).filter(Boolean),
        description: form.description,
        image_url
      }]).select()

      if (error) throw error
      setProducts(prev => [data[0], ...prev])
      setForm({ name: '', rate: '', sizes: 'S,M,L', description: '', image: null })
    } catch (err) {
      console.error('Add error', err)
      alert(err.message || 'Add failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete product?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(p => p.filter(x => x.id !== id))
    } catch (err) {
      console.error('Delete error', err)
      alert(err.message || 'Delete failed')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-2">Add product</h2>
        <form onSubmit={handleAdd}>
          <input className="w-full border p-2 mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="w-full border p-2 mb-2" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} />
          <input className="w-full border p-2 mb-2" placeholder="S,M,L" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} />
          <textarea className="w-full border p-2 mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input type="file" className="w-full mb-2" onChange={e=>setForm({...form,image:e.target.files[0]})} />
          <div className="flex gap-2">
            <button className="btn-gold" type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add'}</button>
          </div>
        </form>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-4">Products</h2>
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.rate}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/edit/${p.id}`}><a className="px-3 py-1 border rounded">Edit</a></Link>
                <button className="px-3 py-1 border rounded" onClick={()=>handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Server-side protection (Pages Router helper)
export async function getServerSideProps(ctx) {
  const { createPagesServerClient } = await import('@supabase/auth-helpers-nextjs')
  const supabaseServer = createPagesServerClient(ctx)

  const { data: { session } } = await supabaseServer.auth.getSession()
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  // require admin membership
  const { data: admin } = await supabaseServer.from('admins').select('uid').eq('uid', session.user.id).maybeSingle()
  if (!admin) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const { data: products } = await supabaseServer.from('products').select('*').order('created_at', { ascending: false })

  return { props: { products: products || [] } }
}