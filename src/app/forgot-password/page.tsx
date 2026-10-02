"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
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

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email address if an account exists."
      );
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setErrorMessage(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
        <div className="radial-glow absolute inset-0 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <Card className="border-navy-200/80 dark:border-navy-800 shadow-xl backdrop-blur-md">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-clinical-100 dark:bg-clinical-950 text-clinical-700 dark:text-clinical-300 mb-2 border border-clinical-200 dark:border-clinical-800">
                <KeyRound className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                Enter your email to receive secure recovery instructions
              </CardDescription>
            </CardHeader>

            <CardContent>
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl border border-rose-300/80 bg-rose-50/90 dark:border-rose-900/80 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3.5 rounded-xl border border-emerald-300/80 bg-emerald-50/90 dark:border-emerald-900/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Success: </span>
                    {successMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  helperText="Password recovery instructions will be dispatched here"
                  required
                />

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2 text-sm"
                    size="lg"
                    isLoading={isLoading}
                  >
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-clinical-600 dark:text-clinical-400 hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-center text-xs text-navy-400 dark:text-navy-500 pt-4">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                Single-use secure cryptographic reset tokens
              </span>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
