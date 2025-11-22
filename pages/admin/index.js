import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function Admin({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [form, setForm] = useState({
    name: "",
    rate: "",
    sizes: "S,M,L",
    description: "",
    image: null,
  });

  async function handleAdd(e) {
    e.preventDefault();
    const sizes = form.sizes.split(",").map((s) => s.trim());
    let image_url = "";

    try {
      if (form.image) {
        const file = form.image;
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}.${ext}`;
        const path = `public/${filename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(uploadData.path);

        image_url = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("products")
        .insert([{ name: form.name, rate: form.rate, sizes, description: form.description, image_url }])
        .select();

      if (error) throw error;

      setProducts([data[0], ...products]);
      setForm({ name: "", rate: "", sizes: "S,M,L", description: "", image: null });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete product?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Admin Panel</h1>

      <div className="card p-4 mb-6">
        <form onSubmit={handleAdd}>
          <input className="w-full border p-2 mb-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input className="w-full border p-2 mb-2" placeholder="Rate" value={form.rate} onChange={(e)=>setForm({...form,rate:e.target.value})}/>
          <input className="w-full border p-2 mb-2" placeholder="S,M,L" value={form.sizes} onChange={(e)=>setForm({...form,sizes:e.target.value})}/>
          <textarea className="w-full border p-2 mb-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          <input type="file" className="w-full mb-2" onChange={(e)=>setForm({...form,image:e.target.files[0]})} />
          <button className="btn-gold">Add</button>
        </form>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-semibold">Products</h2>
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between border p-2 mb-3 rounded">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">{p.rate}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/edit/${p.id}`}><a className="px-3 py-1 border rounded">Edit</a></Link>
              <button className="px-3 py-1 border rounded" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { createServerSupabaseClient } = await import("@supabase/auth-helpers-nextjs");
  const supabase = createServerSupabaseClient(ctx);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { redirect: { destination: "/admin/login", permanent: false } };

  const uid = session.user.id;
  const { data: admin } = await supabase.from("admins").select("uid").eq("uid", uid).maybeSingle();
  if (!admin) return { redirect: { destination: "/", permanent: false } };

  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return { props: { products } };
}