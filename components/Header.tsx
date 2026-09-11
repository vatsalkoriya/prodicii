"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, LayoutDashboard, LogIn, LogOut } from 'lucide-react';

export default function Header({ storeName }: { storeName?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function signOut() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/auth/login');
  }

  const landing = !storeName;
  const navLinkClass = landing
    ? 'landing-header-link'
    : 'rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white';
  const actionClass = landing
    ? 'landing-header-action'
    : 'shine rounded-full bg-brand px-4 py-2 text-[var(--brand-ink)] transition hover:bg-[#52e09d]';

  return (
    <header 
      className={`${landing ? 'landing-header' : 'store-header'} ${landing && scrolled ? 'landing-header-scrolled' : ''} fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled 
          ? 'border-b border-white/10 bg-[#081310]/80 py-3' 
          : 'border-b border-transparent bg-transparent py-5'
      }`}
    >
      <div className="app-shell flex items-center justify-between px-4 py-1 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {storeName || 'prodicii'}
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`${navLinkClass} inline-flex items-center gap-2`}
              >
                <LayoutDashboard size={15} aria-hidden="true" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={`${actionClass} inline-flex items-center gap-2`}
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`${navLinkClass} inline-flex items-center gap-2`}
              >
                <LogIn size={15} aria-hidden="true" />
                Login
              </Link>
              <Link
                href="/auth/register"
                className={`${actionClass} inline-flex items-center gap-2`}
              >
                Get Started
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
