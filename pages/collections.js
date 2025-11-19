import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'
export default function Collections({ products=[] }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const { data } = await supabase.from('products').select('*').order('created_at', {ascending:false})
  return { props: { products: data || [] } }
}
