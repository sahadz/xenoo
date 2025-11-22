import { useState } from "react"
import { useRouter } from "next/router"
import supabase from "../../../lib/supabaseClient"

export default function EditProduct({ product }) {
  const router = useRouter()

  const [name, setName] = useState(product.name)
  const [rate, setRate] = useState(product.rate)
  const [sizes, setSizes] = useState(product.sizes)
  const [description, setDescription] = useState(product.description)
  const [image, setImage] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = product.image

    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase
        .storage
        .from("products")
        .upload(fileName, image, { upsert: true })

      if (uploadError) {
        alert("Image upload error")
        return
      }

      imageUrl = supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl
    }

    await supabase
      .from("products")
      .update({ name, rate, sizes, description, image: imageUrl })
      .eq("id", product.id)

    router.push("/admin")
  }

  return (
    <div className="container">
      <h1>Edit Product</h1>

      <form onSubmit={onSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input value={rate} onChange={e => setRate(e.target.value)} placeholder="Rate" />
        <input value={sizes} onChange={e => setSizes(e.target.value)} placeholder="Sizes" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />

        <input type="file" onChange={e => setImage(e.target.files[0])} />

        <button type="submit">Save</button>
      </form>
    </div>
  )
}

// 🔥 FIXED AUTH — server-side
export async function getServerSideProps(ctx) {
  const { id } = ctx.query

  const { createPagesServerClient } = await import("@supabase/auth-helpers-nextjs")
  const supabase = createPagesServerClient(ctx)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } }
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("uid", session.user.id)
    .maybeSingle()

  if (!admin) {
    return { redirect: { destination: "/", permanent: false } }
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  return { props: { product } }
}