'use client';

import { ArrowRight, Mail, KeyRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [errorText, setErrorText] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorText(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorText(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
  }

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
                placeholder="curator@precision.com" 
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none" 
              />
            </div>
            
            {/* Password Input */}
            <div className="group">
              <div className="flex justify-between items-end mb-2 px-1">
                <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block" htmlFor="password">Access Key</label>
                <Link href="#" className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim hover:text-primary transition-colors">Forgot Password?</Link>
              </div>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/15 text-on-surface py-3 px-4 focus:ring-0 focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/30 font-body text-sm outline-none" 
              />
            </div>
            
            {errorText && <p className="text-error font-body text-sm text-center">{errorText}</p>}

            {/* Primary Action */}
            <div className="pt-4">
              <button 
                className="w-full bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest py-4 px-6 rounded-sm hover:bg-primary transition-all duration-300 flex justify-center items-center gap-3 group" 
                type="submit"
              >
                <span>Sign In</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
    </main>
  );
}
