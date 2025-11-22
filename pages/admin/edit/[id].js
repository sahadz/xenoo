import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Edit({ product }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: product.name,
    rate: product.rate,
    sizes: product.sizes.join(","),
    description: product.description,
    image: null,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    let image_url = product.image_url;

    try {
      if (form.image) {
        const file = form.image;
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}.${ext}`;
        const path = `public/${filename}`;

        const { data: uploadData, error: uploadError } =
          await supabase.storage.from("products").upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } =
          supabase.storage.from("products").getPublicUrl(uploadData.path);

        image_url = urlData.publicUrl;
      }

      await supabase.from("products").update({
        name: form.name,
        rate: form.rate,
        sizes: form.sizes.split(",").map((s) => s.trim()),
        description: form.description,
        image_url,
      }).eq("id", product.id);

      router.push("/admin");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <input className="w-full border p-2 mb-3" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        <input className="w-full border p-2 mb-3" value={form.rate} onChange={(e)=>setForm({...form,rate:e.target.value})}/>
        <input className="w-full border p-2 mb-3" value={form.sizes} onChange={(e)=>setForm({...form,sizes:e.target.value})}/>
        <textarea className="w-full border p-2 mb-3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        <input type="file" className="w-full mb-3" onChange={(e)=>setForm({...form,image:e.target.files[0]})}/>
        <button className="btn-gold">Save</button>
      </form>
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

  const id = ctx.params.id;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

  return { props: { product } };
}