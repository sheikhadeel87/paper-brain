// import { aboutBlurb } from './content.js'

// export function LandingAbout() {
//   return (
//     <section
//       id="about"
//       className="scroll-mt-20 border-b border-zinc-100 bg-white px-4 py-14 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-16"
//     >
//       <div className="mx-auto max-w-3xl text-center">
//         <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
//           About Paper Brain
//         </h2>
//         <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
//           {aboutBlurb}
//         </p>
//       </div>
//     </section>
//   )
// }

import { motion } from 'framer-motion';
import { Zap, Search, Layout, Sparkles } from 'lucide-react';
import { aboutBlurb } from './content.js';

export function LandingAbout() {
  return (
    <section id="about" className="scroll-mt-20 overflow-hidden bg-white px-6 py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              The Philosophy
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl ">
              About Papper Brain
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 text-zinc-600 dark:text-zinc-400 sm:text-base">
              {aboutBlurb}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-3">
              {['Fast Capture', 'Smart Review', 'Clean Data'].map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: The "Benefit" Grid */}
          <div className="relative grid grid-cols-2 gap-4">
            
            {/* Card 1: The "Intelligence" (Big Card) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="col-span-2 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-200 dark:shadow-none"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-6">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold italic tracking-tight">Intelligence by default.</h4>
              <p className="mt-2 text-violet-100 leading-relaxed">
                Papper Brain doesn't just store images; it understands the merchant, the currency, and the context of every transaction automatically.
              </p>
            </motion.div>

            {/* Card 2: Speed */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Zap className="mb-3 h-6 w-6 text-amber-500" />
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50">Instant Sync</h4>
              <p className="text-xs text-zinc-500 mt-1">From upload to dashboard in under 2 seconds.</p>
            </motion.div>

            {/* Card 3: Organization */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Search className="mb-3 h-6 w-6 text-violet-600" />
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50">Deep Search</h4>
              <p className="text-xs text-zinc-500 mt-1">Find any receipt by typing what you remember.</p>
            </motion.div>

            {/* Subtle Background Glow */}
            <div className="absolute -z-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

        </div>
      </div>
    </section>
  );
}