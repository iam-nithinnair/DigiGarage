'use client';

import { ArrowRight, Mail, KeyRound, RefreshCw, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [errorText, setErrorText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resendSuccess, setResendEmailSuccess] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const resendConfirmationEmail = useAuthStore(state => state.resendConfirmationEmail)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return
    setResetLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/DigiGarage/reset-password`,
    })
    setResetLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setResetSent(true)
      toast.success('Password reset email sent.')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorText(null)
    setResendEmailSuccess(false)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorText(error.message)
      toast.error(error.message)
    } else {
      toast.success("Welcome back, Curator.")
      router.push('/')
      router.refresh()
    }
  }

  const [resendLoading, setResendLoading] = useState(false)

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true)
    const { error } = await resendConfirmationEmail(email)
    setResendLoading(false)
    if (error) {
      setErrorText(error.message)
    } else {
      setResendEmailSuccess(true)
      setErrorText(null)
    }
  }

  const isEmailUnconfirmed = errorText?.toLowerCase().includes('email not confirmed');

  const resetModalRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when reset modal is open
  useEffect(() => {
    if (showResetModal) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [showResetModal])

  // Focus trap for reset modal
  const handleResetModalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { setShowResetModal(false); return }
    if (e.key !== 'Tab' || !resetModalRef.current) return

    const focusable = resetModalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }, [])

  useEffect(() => {
    if (!showResetModal) return
    document.addEventListener('keydown', handleResetModalKeyDown)
    return () => document.removeEventListener('keydown', handleResetModalKeyDown)
  }, [showResetModal, handleResetModalKeyDown])

  return (
    <main className="flex-grow flex items-center justify-center relative overflow-hidden min-h-screen bg-background">
      {/* Background Hero Element */}
      <div className="absolute inset-0 z-0">
        <Image 
          fill
          alt="Sleek detail of a classic sports car" 
          className="object-cover opacity-40 mix-blend-luminosity" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppfkRoAsfgcg0D7syBeH8l0FyVDZi-r3PTr3p1FiOz_7MLCQfcWhE1vTpSs0_mJ_KrLIXxQRQJFcJuMogaeAiCt2yV7L00NT3EEfT7kNaux3QkjiUbFtq7FK3gBl3PP9RqRl06UNsgrWUkHJw-2Wm5jaW7-pUoVJfih7fAuuVRni-SZbsRKAyA8S7rCtFwDrFX3617zuLteW4QKjmIytIUmMpEi92OGWGjZabzOfDkE_Cn8mQe1OXfKBYEEsPpHqHziIxkvQoe1w"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      </div>
      
      {/* Auth Canvas */}
      <div className="relative z-10 w-full max-w-md px-6 lg:px-0">
        <div className="bg-surface-container/60 backdrop-blur-2xl p-10 rounded-xl shadow-2xl border-none">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome Back</h1>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Precision Access Required</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="group">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2 px-1" htmlFor="email">Email Terminal</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@precision.com"
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none"
              />
            </div>
            
            {/* Password Input */}
            <div className="group">
              <div className="flex justify-between items-end mb-2 px-1">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block" htmlFor="password">Access Key</label>
                <button type="button" onClick={() => { setShowResetModal(true); setResetEmail(email); setResetSent(false); }} className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim hover:text-primary transition-colors">Forgot Password?</button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none"
              />
            </div>
            
            {errorText && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-error font-body text-sm text-center">{errorText}</p>
                {isEmailUnconfirmed && (
                  <button 
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="flex items-center gap-2 text-xs font-headline font-bold text-primary uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    Resend Confirmation Email
                  </button>
                )}
              </div>
            )}

            {resendSuccess && (
              <p className="text-primary font-body text-sm text-center">Confirmation email sent! Please check your inbox.</p>
            )}

            {/* Primary Action */}
            <div className="pt-4">
              <button 
                disabled={loading}
                className="w-full bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest py-4 px-6 rounded-sm hover:bg-primary transition-all duration-300 flex justify-center items-center gap-3 group disabled:opacity-50" 
                type="submit"
              >
                <span>{loading ? 'Processing...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
          
          {/* Footer Link */}
          <div className="mt-12 text-center">
            <p className="font-body text-sm text-on-surface-variant">
                Don't have an account? 
                <Link href="/signup" className="text-on-surface font-semibold hover:text-primary transition-colors underline underline-offset-4 decoration-outline-variant/30 ml-2">Sign Up</Link>
            </p>
          </div>
        </div>
        
        {/* Technical Chips/Specs */}
        <div className="mt-8 flex justify-center gap-4 opacity-50">
          <span className="bg-surface-bright text-on-surface font-label text-[9px] px-3 py-1 uppercase tracking-tighter text-on-surface">Encrypted-TLS 1.3</span>
          <span className="bg-surface-bright text-on-surface font-label text-[9px] px-3 py-1 uppercase tracking-tighter text-on-surface">Auth V4.02</span>
        </div>
      </div>
      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowResetModal(false)}>
          <div ref={resetModalRef} role="dialog" aria-modal="true" aria-labelledby="reset-modal-title" className="bg-surface-container/95 backdrop-blur-2xl rounded-xl p-8 w-full max-w-md border border-white/5 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Close reset password dialog">
              <X size={18} />
            </button>

            {!resetSent ? (
              <>
                <h2 id="reset-modal-title" className="font-headline text-2xl font-bold text-on-surface mb-2">Reset Password</h2>
                <p className="font-body text-sm text-on-surface-variant mb-6">Enter your email and we&apos;ll send a reset link.</p>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2 px-1" htmlFor="reset-email">Email</label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="curator@precision.com"
                      className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest py-3 px-6 rounded-sm hover:bg-primary transition-all duration-300 disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-primary" />
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Check Your Email</h2>
                <p className="font-body text-sm text-on-surface-variant">We&apos;ve sent a password reset link to <span className="text-on-surface font-medium">{resetEmail}</span>. Click the link in the email to set a new password.</p>
                <button type="button" onClick={() => setShowResetModal(false)} className="mt-6 text-primary font-headline text-xs uppercase tracking-widest hover:brightness-110 transition-colors">
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
