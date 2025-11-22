// pages/admin/login.js
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // after sign-in the server-side admin check on /admin will run
    router.push("/admin");
  }

  return (
    <div className="card p-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      <form onSubmit={login}>
        <label className="block mb-1">Email</label>
        <input className="w-full border p-2 mb-3" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
        <label className="block mb-1">Password</label>
        <input className="w-full border p-2 mb-3" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} required/>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <div className="flex gap-2">
          <button className="btn-gold" type="submit">Log in</button>
          <button type="button" className="px-3 py-2 border rounded" onClick={()=>{ setEmail(""); setPass(""); setError(""); }}>Clear</button>
        </div>
      </form>
    </div>
  );
}