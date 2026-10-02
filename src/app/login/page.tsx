"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient, getSupabaseConfig } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard";
  const urlError = searchParams?.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(urlError || null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createClient(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const { isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      setErrorMessage(
        "Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or unconfigured in .env.local."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Supabase Auth: Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccessMessage("Authentication successful. Redirecting to Doctor Dashboard...");
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Supabase login error:", err);
      const rawMsg = err.message || "";
      if (rawMsg.includes("Invalid login credentials") || rawMsg.includes("invalid_credentials")) {
        setErrorMessage("Supabase authentication failed: Invalid email or password.");
      } else if (rawMsg.includes("Email not confirmed")) {
        setErrorMessage("Supabase authentication failed: Please check your email inbox to confirm your account first.");
      } else if (rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("fetch failed")) {
        setErrorMessage(
          "Supabase authentication failed: Unable to reach the Supabase endpoint. Please check your network connection and verify your Supabase project status."
        );
      } else {
        setErrorMessage(`Supabase authentication failed: ${rawMsg || "Failed to sign in. Please try again."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#0f1523] shadow-lg">
      <CardHeader className="space-y-1 text-center pb-5">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-950/60 border border-teal-800/40 text-teal-400 mb-2">
          <Activity className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-bold text-white">Sign In</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Enter your credentials to access your research workspace
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="doctor@example.com"
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              showPasswordToggle
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-teal-400 hover:underline"
                >
                  Register
                </Link>
              </span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <React.Suspense fallback={<div className="h-80 rounded-xl bg-slate-900/50 animate-pulse" />}>
            <LoginForm />
          </React.Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
