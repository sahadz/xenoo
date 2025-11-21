import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Layout({children, title='xenora'}) {
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    try {
      const saved = localStorage.getItem('xenora:theme')
      if(saved) {
        setDark(saved === 'dark')
        if(saved === 'dark') document.documentElement.classList.add('dark')
      } else {
        // respect prefers-color-scheme
        const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        if(prefers) { setDark(true); document.documentElement.classList.add('dark') }
      }
    } catch(e){}
  },[])

  function toggle(){
    try {
      const next = !dark
      setDark(next)
      if(next) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      localStorage.setItem('xenora:theme', next ? 'dark' : 'light')
    } catch(e){}
  }

  return (
    <>
      <Head>
        <title>{title} — xenora</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/"><a className="font-medium text-xl">xenora</a></Link>
            <nav className="space-x-4 flex items-center">
              <Link href="/collections"><a className="fade mr-3">Collections</a></Link>
              <Link href="/about"><a className="fade mr-3">About</a></Link>
              <Link href="/contact"><a className="fade mr-3">Contact</a></Link>
              <Link href="/admin/login"><a className="fade mr-3 text-sm">Admin</a></Link>
              <button onClick={toggle} aria-label="Toggle theme" className="p-2 rounded-full border">
                {dark ? '🌙' : '☀️'}
              </button>
            </nav>
          </div>
        </header>
        <div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.45}} className="flex-1 max-w-4xl mx-auto w-full p-4">
          {children}
        </div>
        <footer className="p-6 text-center text-sm">
          © {new Date().getFullYear()} xenora — crafted with care.
        </footer>
      </div>
    </>
  )
}
