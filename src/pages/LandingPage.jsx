import { LandingNav } from './landing/LandingNav.jsx'
import { LandingHero } from './landing/LandingHero.jsx'
import { LandingFeatures } from './landing/LandingFeatures.jsx'
import { LandingHowItWorks } from './landing/LandingHowItWorks.jsx'
import { LandingPricing } from './landing/LandingPricing.jsx'
import { LandingAbout } from './landing/LandingAbout.jsx'
import { LandingCta } from './landing/LandingCta.jsx'
import { LandingFooter } from './landing/LandingFooter.jsx'

/**
 * Public marketing home — section components compose the page; copy lives in
 * `landing/content.js` for an easy swap to dynamic data later.
 */
export default function LandingPage() {
  return (
    <div className="min-h-svh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingAbout />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
