// A small line drawing of a whisk (handle on top, wire loops below). It takes its colour
// from the surrounding text.
export default function WhiskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1.8v7" />
      <path d="M12 8.8C5.2 11 5.2 19.8 12 22.2 18.8 19.8 18.8 11 12 8.8Z" />
      <path d="M12 8.8c-3.6 3.2-3.6 10.2 0 13.4M12 8.8c3.6 3.2 3.6 10.2 0 13.4" />
    </svg>
  );
}
