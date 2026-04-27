import { features } from './content.js'
import { cardCls } from '../../lib/uiClasses.js'

const iconWrap =
  'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'

function FeatureIcon({ name }) {
  const stroke = 'currentColor'
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  switch (name) {
    case 'scan':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    case 'layers':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    default:
      return null
  }
}

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-zinc-50 px-4 py-16 dark:bg-zinc-900/50 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Why Paper Brain?
        </p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          AI that works for you
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          Practical tools for capturing and reviewing expenses — without losing the human touch.
        </p>
        <ul className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.id} className={`${cardCls} flex flex-col gap-4`}>
              <div className={`${iconWrap} text-violet-600 dark:text-violet-400`}>
                <FeatureIcon name={f.icon} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {f.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
