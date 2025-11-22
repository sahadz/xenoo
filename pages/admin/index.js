import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Admin() {
  const router = useRouter()
  const [products,setProducts]=useState([])
  const [form,setForm]=useState({name:'',rate:'',sizes:'S,M,L',description:'',image:null})
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(()=>{
    // check session on mount
    (async ()=>{
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (!session) {
        router.replace('/admin/login')
        return
      }
      setUser(session.user)
      setLoadingAuth(false)
      fetchProducts()
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  async function fetchProducts(){
    const { data } = await supabase.from('products').select('*').order('created_at',{ascending:false})
    setProducts(data || [])
  }

  async function handleAdd(e){
    e.preventDefault()
    const sizes = form.sizes.split(',').map(s=>s.trim())
    let image_url = ''
    try{
      if(form.image){
        const file = form.image
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const filePath = `public/${fileName}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(filePath, file, { upsert: false })
        if(uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(uploadData.path)
        image_url = urlData.publicUrl
      }

      const newRow = { name: form.name, rate: form.rate, sizes: sizes, description: form.description, image_url }
      const { data, error } = await supabase.from('products').insert([newRow]).select()
      if(error) throw error
      setForm({name:'',rate:'',sizes:'S,M,L',description:'',image:null})
      fetchProducts()
    }catch(err){
      console.error('Add error', err)
      alert(err.message || JSON.stringify(err))
    }
  }

  async function handleDelete(id){
    if(!confirm('Delete product?')) return
    try{
      const { error } = await supabase.from('products').delete().eq('id', id)
      if(error) throw error
      fetchProducts()
    }catch(err){
      console.error('Delete error', err)
      alert(err.message || JSON.stringify(err))
    }
  }

  if(loadingAuth) return <div className="p-6">Checking authentication...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>

      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-2">Add Product</h2>
        <form onSubmit={handleAdd}>
          <input className="w-full border p-2 rounded mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="w-full border p-2 rounded mb-2" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/>
          <input className="w-full border p-2 rounded mb-2" placeholder="S,M,L" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})}/>
          <textarea className="w-full border p-2 rounded mb-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          <input className="w-full mb-2" type="file" onChange={e=>setForm({...form,image:e.target.files[0]})}/>
          <button className="btn-gold">Add</button>
        </form>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-4">Products</h2>
        <div className="space-y-3">
          {products.map(p=>(
            <div key={p.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.rate}</div>
              </div>
              <div className="flex gap-2">
                <Link href={'/admin/edit/' + p.id}><a className="px-3 py-1 border rounded">Edit</a></Link>
                <button className="px-3 py-1 border rounded" onClick={()=>{
                  navigator.clipboard.writeText(window.location.origin + '/product/' + p.id)
                  alert('URL copied')
                }}>Copy Link</button>
                <button className="px-3 py-1 border rounded" onClick={()=>handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  }
