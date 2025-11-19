import { useState } from 'react'
export default function Contact() {
  const [form, setForm] = useState({name:'',email:'',message:''})
  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-xl font-semibold">Contact</h1>
      <form className="mt-4 space-y-3" onSubmit={(e)=>{e.preventDefault(); alert('This demo page does not send messages. Please configure an API endpoint.')}}>
        <input className="w-full p-3 border rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="w-full p-3 border rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <textarea className="w-full p-3 border rounded" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}></textarea>
        <button className="btn-gold" type="submit">Send</button>
      </form>
    </div>
  )
}
