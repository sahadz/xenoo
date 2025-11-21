import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Image from 'next/image'

export default function ProductPage({ product }) {
  const [size, setSize] = useState(product?.sizes?.[0] || '')
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://example.com'

  if(!product) return <div>Product not found</div>

  const message = () => {
    const url = siteOrigin + '/product/' + product.id
    return encodeURIComponent(`Hi, I'm interested in *${product.name}*\nPrice: ${product.rate}\nSize: ${size}\nLink: ${url}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded p-4">
          <div className="w-full h-80 relative rounded overflow-hidden">
            {product.image_url ? <Image src={product.image_url} alt={product.name} fill style={{objectFit:'cover'}} /> : null}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl text-gold mt-2">{product.rate}</p>
          <div className="mt-4">
            <label className="block text-sm mb-2">Size</label>
            <div className="flex gap-2">
              {product.sizes?.map(s => (
                <button key={s} onClick={()=>setSize(s)} className={`px-3 py-1 rounded-full border ${size===s?'bg-gold text-white':''}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <a className="btn-gold" href={`https://wa.me/${whatsappNumber}?text=${message()}`} target="_blank" rel="noreferrer">Buy Now (WhatsApp)</a>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold">Details</h3>
        <p className="mt-2 text-gray-600">{product.description}</p>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
  return { props: { product: data || null } }
}
