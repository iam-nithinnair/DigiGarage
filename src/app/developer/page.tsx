import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal, Settings, Bell, User } from "lucide-react";

export default function DeveloperPage() {
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      {/* Developer Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
        {/* Hero Visual / Asymmetric Content */}
        <div className="lg:col-span-7 relative group">
          <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60"></div>
            <Image 
              fill
              alt="Nithin Nair Developer Portrait" 
              className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW99MGj8QDFw47aPX4WSg0_1yv7RJ99fn398DaLBoqYVbPE71m1J7nqIBHQqXWmfEANiLq78t_jJ-R2MeNvjHV5e5rdLqQwm2wbF_4sdtr-epEdVPZjZ6EWSTHxtzJXRVj-U44_1VdxcK4p27q1m_-MPdwCcef8dWt_LX11JWrJl481EKzpRlsob7dLgUu3RuGSklb7KGfyZ5l5WkrP5hXvMZZo4bIZbnofYFPDjwM-o_TxNED8axgu2wXF6yshK3Y5w1IEbm3tLM"
            />
            {/* Tech Spec Overlay (Editorial Style) */}
            <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-2">
              <span className="bg-surface-bright text-[10px] tracking-[0.2em] px-3 py-1 font-label uppercase text-on-surface">BUILD v2.4.0</span>
              <span className="bg-primary-container text-[10px] tracking-[0.2em] px-3 py-1 font-label uppercase text-on-primary-container">LEAD ENGINEER</span>
            </div>
          </div>
          {/* Background Decorative Text */}
          <div className="absolute -bottom-10 -left-10 select-none pointer-events-none opacity-[0.03] z-0 hidden md:block">
            <h2 className="text-[12rem] font-black font-headline tracking-tighter leading-none">CURATOR</h2>
          </div>
        </div>

        {/* Profile Info */}
        <div className="lg:col-span-5 pt-8 lg:pt-20 relative z-20">
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <h4 className="text-primary font-label text-sm tracking-[0.3em] uppercase">The Architect</h4>
              <h1 className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-on-surface leading-tight">
                Nithin<br/>Nair
              </h1>
            </div>
            <div className="space-y-6">
              <p className="text-on-surface-variant text-lg leading-relaxed font-body font-light max-w-md">
                Bridging the gap between high-performance automotive engineering and precision software development. Nithin specializes in creating immersive digital environments that mirror the luxury and technical excellence of the world's most iconic scale models.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/20 pt-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-label tracking-[0.2em] text-on-surface/50 uppercase">Expertise</span>
                  <p className="text-sm font-label uppercase text-on-surface">UI Architecture</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-label tracking-[0.2em] text-on-surface/50 uppercase">Focus</span>
                  <p className="text-sm font-label uppercase text-on-surface">Automotive Design</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="#" className="bg-primary text-on-primary font-label font-bold text-xs tracking-widest uppercase px-10 py-5 hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 group">
                Get in Touch
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#" className="border border-outline-variant/30 text-on-surface font-label font-bold text-xs tracking-widest uppercase px-10 py-5 hover:bg-surface-container-high transition-all duration-300 text-center">
                Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Project Preview (Bento Section) */}
      <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 bg-surface-container-low p-12 flex flex-col justify-between group cursor-pointer border border-transparent hover:border-outline-variant/20 transition-all duration-500 min-h-[400px]">
          <div className="space-y-4">
            <span className="text-[10px] font-label tracking-[0.2em] text-primary uppercase">Recent Work</span>
            <h3 className="text-4xl font-headline font-bold text-on-surface">Virtual Showroom v4</h3>
            <p className="text-on-surface/50 max-w-md text-sm leading-relaxed">A real-time 3D rendering engine for 1:18 scale model interaction, featuring dynamic lighting and material simulation.</p>
          </div>
          <div className="flex items-center gap-4">
            <Terminal size={20} className="text-primary" />
            <span className="font-label text-[10px] tracking-widest uppercase text-on-surface/60">View Technical Docs</span>
          </div>
        </div>
        <div className="bg-primary-container p-12 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
          {/* Decorative Icon - using a settings/bolt icon as placeholder for precision_manufacturing */}
          <Settings className="absolute -right-8 -bottom-8 w-48 h-48 text-on-primary-container/10 scale-125 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <h3 className="text-3xl font-headline font-black text-on-primary-container relative z-10 leading-tight">PRECISION<br/>DRIVEN</h3>
          <p className="text-on-primary-container/80 text-sm font-label tracking-wide relative z-10">Crafting code with the same obsession as a die-cast artisan.</p>
        </div>
      </div>
    </main>
  );
}
