"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage("Password updated successfully! Redirecting to Doctor Dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error("Password update error:", err);
      setErrorMessage(err.message || "Failed to update password. Please try again.");
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
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                Choose a strong new password for your investigator account
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Success: </span>
                    {successMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New Password *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Confirm New Password *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2 text-sm"
                    size="lg"
                    isLoading={isLoading}
                  >
                    <span>Update Password & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
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
