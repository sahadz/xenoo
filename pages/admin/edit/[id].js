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

  if(!product) return <div className="card">Product not found</div>

  async function handleUpdate(e){
    e.preventDefault()
    const sizes = form.sizes.split(',').map(s=>s.trim())
    let image_url = product.image_url || ''
    if(form.image){
      const { data:upload, error:upErr } = await supabase.storage.from('product_images').upload(`${Date.now()}_${form.image?.name}`, form.image)
      if(upload?.path) {
        const { data: publicURL } = supabase.storage.from('product_images').getPublicUrl(upload.path)
        image_url = publicURL.publicUrl
      }
    }
    const { data, error } = await supabase.from('products').update({ name: form.name, rate: form.rate, sizes, description: form.description, image_url }).eq('id', product.id)
    if(error) return alert(error.message)
    alert('Updated')
    router.push('/admin')
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold">Edit Product</h2>
      <form className="mt-3" onSubmit={handleUpdate}>
        <input className="w-full border p-2 rounded mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="w-full border p-2 rounded mb-2" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/>
        <input className="w-full border p-2 rounded mb-2" placeholder="Sizes (comma separated)" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>
        <textarea className="w-full border p-2 rounded mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <div className="mb-2">
          <div className="text-sm mb-1">Current image preview:</div>
          {product.image_url ? <img src={product.image_url} className="w-40 h-40 object-cover rounded" alt="current" /> : <div className="text-sm text-gray-500">No image</div>}
        </div>
        <input className="w-full mb-2" type="file" onChange={e=>setForm({...form,image:e.target.files[0]})}/>
        <div className="flex gap-2">
          <button className="btn-gold" type="submit">Save</button>
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
