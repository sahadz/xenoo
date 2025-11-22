import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handle(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Example using Supabase email + password sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (signInError) throw signInError;

      // If you want to restrict to admin users, check user metadata or roles here.
      // For now, redirect on success:
      router.push("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-lg font-semibold">Admin Login</h2>

      <form className="mt-4" onSubmit={handle}>
        <input
          className="w-full border p-3 rounded mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded mb-2"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <button className="btn-gold" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
