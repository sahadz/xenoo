import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  // On mount: if already signed in and an admin, redirect to /admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          if (mounted) setChecking(false);
          return;
        }

        // verify admin status
        const uid = session.user.id;
        const { data: admin, error: adminErr } = await supabase
          .from("admins")
          .select("uid")
          .eq("uid", uid)
          .maybeSingle();

        if (admin && mounted) {
          router.replace("/admin");
          return;
        } else {
          // signed-in but not admin, sign out client so they can't use the session
          await supabase.auth.signOut();
          if (mounted) setChecking(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (mounted) setChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, [router]);

  async function handle(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (signInError) throw signInError;

      // session should be available
      const session = data?.session ?? (await supabase.auth.getSession()).data?.session;
      if (!session) throw new Error("No session returned from sign-in.");

      const uid = session.user.id;

      // check admins table
      const { data: admin, error: adminErr } = await supabase
        .from("admins")
        .select("uid")
        .eq("uid", uid)
        .maybeSingle();

      if (adminErr) {
        console.error("admin check error", adminErr);
        throw adminErr;
      }

      if (!admin) {
        // not an admin — sign out to be safe and show message
        await supabase.auth.signOut();
        setError("Access denied — your account is not an admin.");
        setLoading(false);
        return;
      }

      // OK — admin. Redirect to admin panel
      router.replace("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="max-w-md mx-auto p-6 card">
        <div>Checking session…</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h2 className="text-lg font-semibold mb-3">Admin Login</h2>

      <form className="mt-2" onSubmit={handle} aria-label="Admin login form">
        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />

        {error && <div className="text-red-600 mb-3" role="alert">{error}</div>}

        <div className="flex items-center gap-3">
          <button className="btn-gold" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
          <button
            type="button"
            className="px-3 py-2 border rounded"
            onClick={() => { setEmail(""); setPass(""); setError(null); }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
