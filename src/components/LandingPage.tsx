
import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

export default function AffiliSpeedLanding() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030b0b] text-white font-sans selection:bg-[#00E0D6] selection:text-black">
      {/* Ambient Animated Background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#088F8F]/40 blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-[#009485]/40 blur-[140px]"
        />
      </div>

      {/* Navigation */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-extrabold tracking-wide flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          Affili<span className="text-[#00E0D6]">Speed</span>
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-white/80 hover:text-white transition-colors font-medium">Login</button>
          <button onClick={() => navigate('/signup')} className="rounded-xl bg-[#088F8F] px-6 py-3 text-sm font-bold text-white hover:bg-[#009485] transition-all shadow-lg shadow-brand-500/20 active:scale-95">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 md:pt-28 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl tracking-tight"
        >
          Where Conversations Move Faster.<br />
          <span className="text-[#00E0D6]">Affiliate Revenue Grows Smarter</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-2xl text-lg text-white/85 leading-relaxed"
        >
          AffiliSpeed is a next‑gen communication hub built for serious affiliate marketers.
          Engage customers instantly, build real trust, and turn every conversation into
          higher clicks, stronger relationships, and faster conversions — without lag.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto"
        >
          <button 
            onClick={() => navigate('/signup')} 
            className="rounded-2xl bg-white px-10 py-4 text-lg font-bold text-[#088F8F] shadow-xl hover:bg-gray-100 transition-all active:scale-95"
          >
            Start Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="rounded-2xl border border-white/30 px-10 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95"
          >
            View Platform
          </button>
        </motion.div>
      </main>

      {/* Feature Timeline */}
      <section className="relative z-10 mx-auto mt-32 max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {["Instant Messaging", "Ultra‑Fast System", "Affiliate‑First Tools"].map((title, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl hover:bg-white/10 transition-colors group cursor-default"
            >
              <span className="mb-4 inline-block text-sm font-semibold text-[#00E0D6] group-hover:scale-110 transition-transform">0{i + 1}</span>
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/75 leading-relaxed group-hover:text-white transition-colors">
                Built to help affiliate marketers communicate clearly, move faster,
                and close deals without friction.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto mt-32 max-w-5xl px-6 text-center pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-[#088F8F]/30 to-[#009485]/20 p-8 md:p-14 backdrop-blur-xl border border-white/10"
        >
          <h3 className="mb-4 text-3xl md:text-4xl font-bold">Launch Faster with AffiliSpeed</h3>
          <p className="mb-8 text-white/85 text-lg">
            Everything you need to communicate, convert, and grow — before your
            competitors even load.
          </p>
          <button 
            onClick={() => navigate('/signup')} 
            className="rounded-2xl bg-white px-12 py-4 text-lg font-bold text-[#088F8F] hover:bg-gray-100 transition-all shadow-2xl active:scale-95"
          >
            Create Your Free Account
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-white/60">
        <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-bold text-white">AffiliSpeed</span>
        </div>
        © {new Date().getFullYear()} Speed‑Driven Affiliate Platform.
      </footer>
    </div>
  );
}
