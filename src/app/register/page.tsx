"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient, getSupabaseConfig } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [doctorName, setDoctorName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    if (!doctorName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
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
      // Supabase Auth: Register user with doctorName as full_name in user metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: doctorName.trim(),
          },
        },
      });

      if (signUpError) {
        console.error("Supabase signUp error:", {
          message: signUpError.message,
          name: signUpError.name,
          status: signUpError.status,
          code: (signUpError as any).code,
        });
        setErrorMessage(signUpError.message || "Registration failed. Please try again.");
        return;
      }

      if (data?.session) {
        setSuccessMessage("Account created successfully. Redirecting to Doctor Dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else if (data?.user) {
        setSuccessMessage(
          "Registration successful! Please check your email inbox to confirm your account."
        );
      } else {
        setErrorMessage("Registration was not completed. Please try again.");
      }
    } catch (err: any) {
      console.error("Supabase registration unexpected error:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      });
      setErrorMessage(err?.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <Card className="border-slate-800 bg-[#0f1523] shadow-lg">
            <CardHeader className="space-y-1 text-center pb-5">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-950/60 border border-teal-800/40 text-teal-400 mb-2">
                <Activity className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Create Account</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Register to access the clinical research workspace
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

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <Input
                  label="Doctor Name"
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Elena Vance"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  showPasswordToggle
                  helperText="Min. 6 characters"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  showPasswordToggle
                  required
                />

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-teal-400 hover:underline"
                      >
                        Sign In
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
