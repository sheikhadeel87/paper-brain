import { Link } from 'react-router-dom'
import { hero } from './content.js'
import { btnBase, btnPrimary } from '../../lib/uiClasses.js'
import { motion } from 'framer-motion';
import { Scan, FileText, Check } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-lg p-4">
      {/* 1. The Main Dashboard Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-zinc-50 p-6 shadow-2xl dark:border-violet-900/40 dark:from-violet-950/40 dark:via-zinc-900 dark:to-zinc-950"
      >
        {/* Top Header Mockup */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400/50" />
            <div className="h-2 w-2 rounded-full bg-amber-400/50" />
            <div className="h-2 w-2 rounded-full bg-emerald-400/50" />
          </div>
          <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
             <div className="h-3 w-3 rounded-full bg-violet-400" />
          </div>
        </div>

        {/* 2. The Animated "Processing" Card */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/80 shadow-inner">
          
          {/* Moving Scan Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent z-10 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />

          <div className="flex gap-4">
            {/* The "Receipt" Icon with entrance animation */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50"
            >
              <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </motion.div>

            {/* Data Extraction Skeleton */}
            <div className="min-w-0 flex-1 space-y-3">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '100%' }} 
                transition={{ delay: 0.8, duration: 1 }}
                className="h-2 max-w-[140px] rounded bg-zinc-200 dark:bg-zinc-700" 
              />
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '60%' }} 
                transition={{ delay: 1, duration: 0.8 }}
                className="h-2 rounded bg-zinc-100 dark:bg-zinc-800" 
              />
              
              {/* The "Confidence Score" Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex items-center gap-1.5 w-fit rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900"
              >
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">98% Match</span>
              </motion.div>
            </div>
          </div>

          {/* 3. The Categorized "Tags" */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { color: 'bg-violet-100/90 dark:bg-violet-950/50', delay: 1.8, label: 'Vendor' },
              { color: 'bg-emerald-100/80 dark:bg-emerald-950/40', delay: 2.0, label: 'Total' },
              { color: 'bg-sky-100/80 dark:bg-sky-950/40', delay: 2.2, label: 'Date' }
            ].map((tag, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: tag.delay }}
                className={`flex flex-col items-center justify-center h-14 rounded-xl border border-white/50 dark:border-zinc-800 ${tag.color}`}
              >
                <div className="h-1.5 w-8 rounded-full bg-black/5 dark:bg-white/10 mb-2" />
                <span className="text-[9px] uppercase tracking-tighter font-bold opacity-40">{tag.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 4. The Footer Caption */}
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400"
        >
          <Scan className="h-3 w-3" />
          <span>Processing Real-time data</span>
        </motion.div>
      </motion.div>

      {/* Background Decorative Blobs */}
      <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl -z-10" />
      <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-emerald-200/20 blur-3xl -z-10" />
    </div>
  );
}

// function HeroVisual() {
//   return (
//     <div
//       className="relative mx-auto max-w-lg rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-zinc-50 p-6 shadow-lg dark:border-violet-900/40 dark:from-violet-950/40 dark:via-zinc-900 dark:to-zinc-950"
//       aria-hidden
//     >
//       <div className="mb-4 flex items-center justify-between gap-2">
//         <div className="h-2 w-24 rounded-full bg-violet-200 dark:bg-violet-800" />
//         <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/60" />
//       </div>
//       <div className="space-y-3 rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/80">
//         <div className="flex gap-2">
//           <div className="h-16 w-12 shrink-0 rounded-lg bg-violet-100 dark:bg-violet-900/50" />
//           <div className="min-w-0 flex-1 space-y-2">
//             <div className="h-2 w-full max-w-[12rem] rounded bg-zinc-200 dark:bg-zinc-700" />
//             <div className="h-2 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
//             <div className="h-8 w-full rounded-md bg-emerald-100/80 dark:bg-emerald-950/40" />
//           </div>
//         </div>
//         <div className="grid grid-cols-3 gap-2 pt-1">
//           <div className="h-14 rounded-lg bg-violet-100/90 dark:bg-violet-950/50" />
//           <div className="h-14 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/40" />
//           <div className="h-14 rounded-lg bg-sky-100/80 dark:bg-sky-950/40" />
//         </div>
//       </div>
//       <p className="mt-4 text-center text-xs font-medium text-violet-700 dark:text-violet-300">
//         Receipt → review → dashboard
//       </p>
//     </div>
//   )
// }

export function LandingHero() {
  return (
    <section className="border-b border-zinc-100 bg-white px-4 py-14 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="text-left">
          <p className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
            {hero.badge}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
            {hero.titleLead}{' '}
            <span className="text-violet-600 dark:text-violet-400">
              {hero.titleAccent}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/login"
              className={`${btnPrimary} inline-flex justify-center px-6 py-3 text-base no-underline`}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={`${btnBase} inline-flex justify-center border-violet-300 px-6 py-3 text-base text-violet-800 no-underline hover:bg-violet-50 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/40`}
            >
              Create account
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-600 sm:text-left dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
            >
              Log in
            </Link>
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  )
}
