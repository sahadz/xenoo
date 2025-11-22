// pages/admin/edit/[id].js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'

export default function Edit({ product }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: product?.name || '',
    rate: product?.rate || '',
    sizes: (product?.sizes || []).join(','),
    description: product?.description || '',
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let image_url = product?.image_url || null

      if (form.image) {
        const file = form.image
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const filePath = `public/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('products').getPublicUrl(uploadData.path)
        image_url = urlData.publicUrl
      }

      const updated = {
        name: form.name,
        rate: form.rate,
        sizes: form.sizes.split(',').map(s=>s.trim()).filter(Boolean),
        description: form.description,
        image_url
      }

      const { error: updateError } = await supabase.from('products').update(updated).eq('id', product.id)
      if (updateError) throw updateError

      router.push('/admin')
    } catch (err) {
      console.error('Update error', err)
      setError(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <input className="w-full border p-2 mb-3" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="w-full border p-2 mb-3" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/>
        <input className="w-full border p-2 mb-3" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>
        <textarea className="w-full border p-2 mb-3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input type="file" className="w-full mb-3" onChange={e=>setForm({...form,image:e.target.files[0]})}/>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <div className="flex gap-2">
          <button className="btn-gold" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>router.push('/admin')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const { createPagesServerClient } = await import('@supabase/auth-helpers-nextjs')
  const supabaseServer = createPagesServerClient(ctx)

  const { data: { session } } = await supabaseServer.auth.getSession()
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  const { data: admin } = await supabaseServer.from('admins').select('uid').eq('uid', session.user.id).maybeSingle()
  if (!admin) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const { params } = ctx
  const id = params.id
  const { data: product } = await supabaseServer.from('products').select('*').eq('id', id).single()

  return { props: { product: product || null } }
}