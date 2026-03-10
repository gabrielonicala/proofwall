"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Shield, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/10 blur-[120px] animate-gradient-mesh" />
        <div className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-secondary/10 blur-[100px] animate-gradient-mesh" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Shield className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Proof<span className="text-gradient">Wall</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm sm:p-8">
          {success ? (
            <div className="py-4 text-center">
              <CheckCircle className="mx-auto mb-4 size-12 text-success" />
              <h1 className="mb-2 text-xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-bold">Reset your password</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
