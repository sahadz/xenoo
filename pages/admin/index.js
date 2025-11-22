import { useState } from "react"
import Link from "next/link"
import supabase from "../../lib/supabaseClient"

export default function AdminPage({ products }) {
  return (
    <div className="container">
      <h1>Admin Panel</h1>

      <Link href="/admin/add">
        <button>Add Product</button>
      </Link>

      <h2>Products</h2>
      {products.length === 0 && <p>No products found.</p>}

      {products.map(p => (
        <div key={p.id} className="product-card">
          <h3>{p.name}</h3>
          <p>{p.rate}</p>
          <Link href={`/admin/edit/${p.id}`}><button>Edit</button></Link>
          <Link href={`/admin/delete/${p.id}`}><button>Delete</button></Link>
        </div>
      ))}
    </div>
  );
}

// 🔥 NEW FIXED AUTH — server-side
export async function getServerSideProps(ctx) {
  const { createPagesServerClient } = await import("@supabase/auth-helpers-nextjs")
  const supabase = createPagesServerClient(ctx)

  const { data: { session } } = await supabase.auth.getSession()

  // Not logged in → redirect
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } }
  }

  // Allow only admins (admins table)
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("uid", session.user.id)
    .maybeSingle()

  if (!admin) {
    return { redirect: { destination: "/", permanent: false } }
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false })

  return { props: { products: products ?? [] } }
}