"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Supabase passes tokens in the URL hash after email link click.
  // The Supabase client auto-picks these up via onAuthStateChange.
  // We wait for PASSWORD_RECOVERY event before showing the form.
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if session already exists (user might have refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      toast.error(updateError.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative overflow-hidden min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          fill
          alt="Detail of a precision-engineered sports car"
          className="object-cover opacity-40 mix-blend-luminosity"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6 lg:px-0">
        <div className="bg-surface-container/60 backdrop-blur-2xl p-10 rounded-xl shadow-2xl border-none">
          {success ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-3">
                Password Updated
              </h1>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                Your password has been reset successfully. Redirecting to login...
              </p>
              <div className="w-full bg-surface-container-highest rounded-full h-1 overflow-hidden">
                <div className="bg-primary h-full animate-[shrink_3s_linear_forwards]" style={{ width: "100%" }}></div>
              </div>
            </div>
          ) : !ready ? (
            /* Waiting for recovery token */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <KeyRound size={28} className="text-on-surface-variant" />
              </div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-3">
                Verifying Reset Link
              </h1>
              <p className="font-body text-sm text-on-surface-variant">
                Processing your password reset token...
              </p>
            </div>
          ) : (
            /* Reset form */
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-primary" />
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">
                  Set New Password
                </h1>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Secure your curator account
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2 px-1"
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2 px-1"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-error">
                    <AlertCircle size={16} />
                    <p className="font-body text-sm">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest py-4 px-6 rounded-sm hover:bg-primary transition-all duration-300 flex justify-center items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Technical Chips */}
        <div className="mt-8 flex justify-center gap-4 opacity-50">
          <span className="bg-surface-bright text-on-surface font-label text-[9px] px-3 py-1 uppercase tracking-tighter">
            Encrypted-TLS 1.3
          </span>
          <span className="bg-surface-bright text-on-surface font-label text-[9px] px-3 py-1 uppercase tracking-tighter">
            Auth V4.02
          </span>
        </div>
      </div>
    </main>
  );
}
