import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Layout({children, title='xenora'}) {
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(()=>{
    try {
      const saved = localStorage.getItem('xenora:theme')
      if(saved) {
        setDark(saved === 'dark')
        if(saved === 'dark') document.documentElement.classList.add('dark')
      } else {
        const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setDark(prefers)
        if(prefers) document.documentElement.classList.add('dark')
      }
    }catch(e){}
  },[])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    localStorage.setItem('xenora:theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  const nav = [
    { href: '/collections', label: 'Collections' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/admin', label: 'Admin' },
  ]

  return (
    <>
      <Head>
        <title>{title} — xenora</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* left: logo */}
              <div className="flex items-center flex-shrink-0 mr-6">
                <Link href="/">
                  <a className="flex items-center space-x-3">
                    <img src="/logo.png" alt="xenora" className="h-8 w-auto" />
                    <span className="font-semibold text-xl">xenora</span>
                  </a>
                </Link>
              </div>

              {/* center: desktop nav */}
              <nav className="hidden md:flex md:items-center md:space-x-8 flex-1">
                {nav.map(n=>(
                  <Link key={n.href} href={n.href}>
                    <a className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">
                      {n.label}
                    </a>
                  </Link>
                ))}
              </nav>

              {/* right: theme toggle + mobile button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="hidden sm:inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-lg">{dark ? '🌙' : '☀️'}</span>
                </button>

                {/* mobile hamburger */}
                <button
                  onClick={()=>setMobileOpen(v=>!v)}
                  aria-expanded={mobileOpen}
                  aria-label="Toggle menu"
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {mobileOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu (collapsible) */}
          <div className={`md:hidden border-t dark:border-slate-700 bg-white dark:bg-slate-900 ${mobileOpen ? 'block' : 'hidden'}`}>
            <div className="px-4 py-3 space-y-2">
              {nav.map(n=>(
                <Link key={n.href} href={n.href}>
                  <a
                    onClick={()=>setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {n.label}
                  </a>
                </Link>
              ))}

              {/* mobile theme toggle visible here */}
              <div className="pt-2 border-t dark:border-slate-700">
                <button onClick={toggleTheme} className="w-full text-left px-3 py-2 rounded-md text-sm">
                  {dark ? 'Switch to light' : 'Switch to dark'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-4">
          {children}
        </main>

        <footer className="p-6 text-center text-sm">
          © {new Date().getFullYear()} xenora — crafted with care.
        </footer>
      </div>
    </>
  )
                  }
