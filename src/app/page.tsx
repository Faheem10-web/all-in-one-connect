import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Dynamic graphic glow background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header / Navbar */}
      <header className="w-full h-16 border-b border-slate-800/80 flex items-center justify-between px-6 sm:px-12 backdrop-blur-md z-10">
        <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" />
            <path d="M12 7v10M7 12h10" />
          </svg>
          ALL IN ONE CONNECT
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="h-9 px-4 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span>Now in beta</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          One QR Code. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Every Business Connection.
          </span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10">
          Create a premium digital business profile, configure custom branding styles, share your
          social links, and connect instantly with custom QR redirects.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="h-12 px-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-colors flex items-center justify-center"
          >
            Create Your Profile
          </Link>
          <Link
            href="/login"
            className="h-12 px-8 rounded-md border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-base transition-colors flex items-center justify-center"
          >
            Manage Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-900 text-center text-xs text-slate-600 z-10">
        &copy; 2026 All In One Connect. Built with Next.js 15, Auth.js, and MongoDB.
      </footer>
    </div>
  );
}
