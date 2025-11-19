import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Home({ featured=[] }) {
  return (
    <section>
      <div className="py-12 text-center">
        <div className="mx-auto w-28 h-28 relative">
          <Image src="/logo.png" alt="xenora" fill style={{objectFit:'contain'}} />
        </div>
        <h1 className="text-3xl mt-4 font-bold">xenora — premium, sexy, clean</h1>
        <p className="max-w-xl mx-auto mt-4 text-gray-600">Curated pieces that celebrate beauty. Mobile-first, smooth experience.</p>
        <motion.div whileTap={{scale:0.98}} className="mt-6"><Link href="/collections"><a className="btn-gold">Shop Collections</a></Link></motion.div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {featured.map(p => (
            <Link key={p.id} href={'/product/'+p.id}><a>
              <motion.div whileHover={{ y:-4 }} className="card">
                <div className="w-full h-36 relative rounded-md mb-2 overflow-hidden">
                  {p.image_url ? <Image src={p.image_url} alt={p.name} fill style={{objectFit:'cover'}} sizes="(max-width: 640px) 100vw, 33vw" /> : null}
                </div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">{p.rate}</div>
              </motion.div>
            </a></Link>
          ))}
        </div>
      </div>

      <div className="mt-10 card">
        <h3 className="text-lg font-semibold">Our Story</h3>
        <p className="mt-2 text-gray-600">xenora began as a desire to create luxurious essentials that feel like a second skin. Minimal, intentional, and radiant.</p>
      </div>
    </section>
  )
}

export async function getStaticProps() {
  // fetch sample featured products
  let { data } = await supabase.from('products').select('*').limit(6)
  return { props: { featured: data || [] }, revalidate: 30 }
}
