"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return null; // don't warn while empty
    const pattern =
      /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return pattern.test(value) ? null : "Please enter a valid email address.";
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailValidation = validateEmail(email);
    setEmailError(emailValidation);
    if (emailValidation) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Login failed");

      setSuccess("Welcome back!");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0f0f0f] via-[#111] to-black text-slate-200 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-400 animate-pulse" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-80 w-80 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600" />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-[system-ui] font-semibold tracking-tight text-slate-100">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Please sign in to continue
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                  required
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 transition-colors ${
                    emailError
                      ? "border-rose-400/60 bg-black/40 focus:border-rose-400 focus:ring-rose-400/30"
                      : "border-white/10 bg-black/30 focus:border-indigo-400 focus:ring-indigo-400/30"
                  }`}
                  placeholder="you@example.com"
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-rose-300">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-400 hover:text-slate-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading || Boolean(emailError)}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 font-medium text-white shadow-lg focus:outline-none disabled:opacity-60"
              >
                <span className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_40%)] opacity-30" />
                {loading ? "Signing in…" : "Login"}
              </motion.button>
            </form>
          </div>

          {/* Downside links */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Create one
            </a>
          </p>

          <p className="mt-2 text-center text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}