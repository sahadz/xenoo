import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/router'

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

  if(!product) return <div className="card">Product not found</div>

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let imageUrl = product.image_url || null

      // 1) upload image if a new file was selected
      if (form.image) {
        const file = form.image
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `public/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, { cacheControl: '3600', upsert: true })

        if (uploadError) throw uploadError

        // 2) get public URL (assuming bucket is public)
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(uploadData.path)

        imageUrl = urlData.publicUrl
      }

      // 3) save product
      const updated = {
        name: form.name,
        rate: form.rate,
        sizes: form.sizes.split(',').map(s=>s.trim()).filter(Boolean),
        description: form.description,
        image_url: imageUrl
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(updated)
        .eq('id', product.id)

      if (updateError) throw updateError

      router.push('/admin')
    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Update row from products</h2>
      <form onSubmit={handleSubmit}>
        <label className="block">name</label>
        <input className="w-full mb-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>

        <label className="block">rate</label>
        <input className="w-full mb-2" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/>

        <label className="block">sizes</label>
        <input className="w-full mb-2" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>

        <label className="block">description</label>
        <textarea className="w-full mb-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea>

        <label className="block">image</label>
        <input className="w-full mb-2" type="file" accept="image/*" onChange={e=>setForm({...form,image:e.target.files[0]})}/>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex gap-2">
          <button className="btn-gold" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>router.push('/admin')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
  return { props: { product: data || null } }
}
