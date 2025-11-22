import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function Admin() {
  const [products,setProducts]=useState([])
  const [form,setForm]=useState({name:'',rate:'',sizes:'S,M,L',description:'',image:null})
  useEffect(()=>{ fetchProducts() },[])
  async function fetchProducts(){
    const { data } = await supabase.from('products').select('*').order('created_at',{ascending:false})
    setProducts(data || [])
  }
  async function handleAdd(e){
    e.preventDefault()
    const sizes = form.sizes.split(',').map(s=>s.trim())
    let image_url = ''
    if(form.image){
      const { data:upload, error:upErr } = await supabase.storage.from('product_images').upload(`${Date.now()}_${form.image?.name}`, form.image)
      if(upload?.path) {
        const { data: publicURL } = supabase.storage.from('product_images').getPublicUrl(upload.path)
        image_url = publicURL.publicUrl
      }
    }
    const { data, error } = await supabase.from('products').insert([{ name:form.name, rate:form.rate, sizes, description:form.description, image_url }])
    if(error) return alert(error.message)
    setForm({name:'',rate:'',sizes:'S,M,L',description:'',image:null})
    fetchProducts()
  }
  async function handleDelete(id){
    if(!confirm('Delete product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold">Add Product</h3>
          <form className="mt-3" onSubmit={handleAdd}>
            <input className="w-full border p-2 rounded mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <input className="w-full border p-2 rounded mb-2" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/>
            <input className="w-full border p-2 rounded mb-2" placeholder="Sizes (comma separated)" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>
            <textarea className="w-full border p-2 rounded mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            <input className="w-full mb-2" type="file" onChange={e=>setForm({...form,image:e.target.files[0]})}/>
            <button className="btn-gold" type="submit">Add</button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-semibold">Products</h3>
          <div className="mt-3 space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.rate}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={'/admin/edit/' + p.id}><a className="px-3 py-1 border rounded">Edit</a></Link>
                  <button className="px-3 py-1 border rounded" onClick={()=>{navigator.clipboard.writeText(window.location.origin + '/product/' + p.id); alert('URL copied')}}>Copy Link</button>
                  <button className="px-3 py-1 border rounded" onClick={()=>handleDelete(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
