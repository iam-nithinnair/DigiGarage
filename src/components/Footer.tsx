import Link from 'next/link';
import { Share2, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background w-full border-t border-outline-variant/15 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-black text-inverse-surface font-headline">THE DIGITAL CURATOR</div>
          <div className="text-inverse-surface/60 font-headline text-[10px] uppercase tracking-[0.1em]">© 2024 THE DIGITAL CURATOR. PRECISION ENGINEERED.</div>
        </div>
        <div className="flex gap-8 items-center flex-wrap justify-center">
          <Link href="#" className="font-headline text-[10px] uppercase tracking-[0.1em] text-inverse-surface/60 hover:text-primary-container transition-all">Terms of Service</Link>
          <Link href="#" className="font-headline text-[10px] uppercase tracking-[0.1em] text-inverse-surface/60 hover:text-primary-container transition-all">Privacy Policy</Link>
          <Link href="#" className="font-headline text-[10px] uppercase tracking-[0.1em] text-inverse-surface/60 hover:text-primary-container transition-all">Contact Support</Link>
          <Link href="#" className="font-headline text-[10px] uppercase tracking-[0.1em] text-inverse-surface/60 hover:text-primary-container transition-all">Archive</Link>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/20 hover:border-primary-container transition-colors">
            <Share2 size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/20 hover:border-primary-container transition-colors">
            <Globe size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
