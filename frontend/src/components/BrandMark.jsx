/** App logo mark — shared by marketing shell and app chrome. */
export function BrandMark({ className = '' }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 2L35 11v18L20 38 5 29V11L20 2z"
        className="fill-violet-600"
      />
      <path
        d="M20 9l9 5.5v11L20 31l-9-5.5v-11L20 9z"
        className="fill-white opacity-95"
      />
      <path
        d="M20 14c-2.5 0-4 1.6-4 3.5 0 1.5 1 2.7 2.5 3.1V24h3v-3.4c1.5-.4 2.5-1.6 2.5-3.1C24 15.6 22.5 14 20 14z"
        className="fill-violet-500"
      />
    </svg>
  )
}
