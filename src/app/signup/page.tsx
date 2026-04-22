'use client';

import { KeyRound, Mail, X, Eye, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const [errorText, setErrorText] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorText(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
      setErrorText('Passwords do not match')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorText(error.message)
    } else if (data.session) {
      // If email confirmation is off, we get a session immediately
      router.push('/')
      router.refresh()
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-surface-container/60 backdrop-blur-2xl p-12 rounded-xl shadow-2xl max-w-md w-full text-center border border-white/5">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <CheckCircle size={48} className="text-primary" />
            </div>
          </div>
          <h2 className="font-headline text-3xl font-bold mb-4">Check Your Inbox</h2>
          <p className="text-on-surface-variant font-body mb-8">
            We've sent a confirmation link to your email. Please verify your account to start your curation journey.
          </p>
          <Link href="/login" className="inline-block bg-primary-container text-on-primary-container font-headline font-bold py-4 px-8 rounded-sm tracking-widest uppercase text-sm hover:bg-primary transition-all">
            Return to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Asymmetric Left Side: Visual Pedestal */}
      <section className="relative hidden md:flex overflow-hidden items-end p-12 lg:p-24 md:w-[60%]">
        <div className="absolute inset-0 z-0">
          <Image 
            fill
            alt="Close-up of a luxury die-cast model car headlamp" 
            className="object-cover grayscale contrast-125 opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMUuYzkNbX9C0OwNwHRSpGuN0LI5FjMCDH47r_XKo1Vi9qCqf_zj-3EsCP5CxmmDxB5U3Obdj2V4xrubgnUFGuChNVGwi1P9MJzwM22QLfbZXQ8v--lpEmoaajtqwlsheBit3NfnkdP7vRKJGGXy_IXzl6XUNbIcFxymfT5_w_BXzGTfxd5_OwRy-MgzaoUlhnr4wZO_B2gP3YIoX_eBsmQ91NrwOHS_AtHOa5rlpKt4oXUH7wLWWAORr27OyYctiROeWoclcg93c"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent w-1/3"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-surface-bright px-3 py-1 mb-6">
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface">Precision Standard</span>
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-bold tracking-tighter leading-none mb-6 text-on-surface">
            ENGINEERED FOR <br/><span className="text-primary">COLLECTORS.</span>
          </h1>
          <p className="font-body text-secondary max-w-md leading-relaxed text-lg">
            Join the exclusive digital showroom for elite scale model curation. Document history, track rarity, and showcase your precision assets.
          </p>
        </div>
      </section>

      {/* Right Side: Focused Transactional Canvas */}
      <section className="flex flex-col justify-center px-8 py-32 md:px-12 lg:px-20 bg-surface-container-lowest relative z-10 md:w-[40%]">
        <div className="w-full mx-auto max-w-xl">
          <header className="mb-12">
            <h2 className="font-headline text-3xl font-bold mb-2 text-on-surface">Create Account</h2>
            <p className="text-secondary-fixed-dim text-sm">Enter your credentials to begin your curation journey.</p>
          </header>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name - Optional in Supabase signup but part of the design */}
            <div className="group">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors" htmlFor="full_name">Full Name</label>
              <input 
                id="full_name" 
                name="full_name" 
                type="text" 
                placeholder="Enzo Ferrari" 
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 font-body transition-all outline-none" 
              />
            </div>

            {/* Email Address */}
            <div className="group">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required
                placeholder="curator@digital.com" 
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 font-body transition-all outline-none" 
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 font-body transition-all outline-none" 
                />
                <Eye size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface cursor-pointer" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 block group-focus-within:text-primary transition-colors" htmlFor="confirm_password">Confirm Password</label>
              <input 
                id="confirm_password" 
                name="confirm_password" 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 py-3 px-0 focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/30 font-body transition-all outline-none" 
              />
            </div>

            {/* Terms & Conditions Micro-label */}
            <div className="flex items-start gap-3 pt-2">
              <input 
                className="mt-1 bg-surface-container border-outline-variant/30 text-primary-container focus:ring-offset-background focus:ring-primary rounded-sm" 
                id="terms" 
                type="checkbox" 
                required
              />
              <label className="text-[11px] text-on-surface-variant/60 leading-tight" htmlFor="terms">
                By creating an account, you agree to our <Link className="text-on-surface hover:text-primary underline underline-offset-4 transition-colors" href="#">Terms of Service</Link> and <Link className="text-on-surface hover:text-primary underline underline-offset-4 transition-colors" href="#">Privacy Policy</Link>.
              </label>
            </div>
            
            {errorText && <p className="text-error font-body text-sm text-center">{errorText}</p>}

            {/* Primary Action: Ignition Point */}
            <button 
              disabled={loading}
              className="w-full bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-headline font-bold py-5 rounded-sm tracking-widest uppercase text-sm transition-all duration-300 transform active:scale-[0.98] mt-4 shadow-2xl shadow-primary-container/20 disabled:opacity-50" 
              type="submit"
            >
                {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-on-surface-variant font-body text-sm">
                Already have an account? 
                <Link href="/login" className="text-on-surface font-bold hover:text-primary transition-colors ml-1">Sign In</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
