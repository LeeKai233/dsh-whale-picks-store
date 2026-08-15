/**
 * WhaleIcon — the 鲸选 brand glyph as an inline SVG React component.
 *
 * To replace with your own design: export the shape from any SVG editor as
 * a single <path> (or keep multiple elements), then paste the path data into
 * this component. No build config changes needed — tsdown bundles this file
 * into the client bundle like any other module.
 */
export function WhaleIcon({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* stylized whale: body, belly, eye, spout */}
      <path
        d="M4.2 12.4c-1.6-.9-3.1-1.1-3.7-.3.7 1.7 3.5 2.4 5.8 2.3 1.2 1.6 3.1 2.6 5.4 2.6 3.5 0 6.4-2 7.3-4.7 1.9-1.1 3.2-1.9 3.9-2.9.3-.4 0-1-.5-1.1-.8-.1-1.7 0-2.7.4.4-1.1.3-2.1-.3-2.8-.6-.7-1.7-.7-2.5 0-.4.3-.7.8-.9 1.3-.9-.4-2.1-.6-3.5-.6-3.8 0-6.7 2.4-7.1 5.5-.3.2-.8.2-1.2.3z"
        fill="#4D6BFE"
      />
      <circle cx="14.4" cy="7.9" r="0.9" fill="#ffffff" />
      <path
        d="M5.8 9.6c-.3-.8-.5-1.6-.5-2.2 0-.6.8-1.4 1.6-1.4.6 0 1 .3 1.2.8"
        stroke="#4D6BFE"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
