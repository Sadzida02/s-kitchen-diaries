import type { Locale } from "@/lib/i18n";

// Small flags for the language toggle: Bosnia and Herzegovina for Bosnian, the United Kingdom for English.
export default function Flag({ lang, className }: { lang: Locale; className?: string }) {
  if (lang === "bs") {
    return (
      <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
        <rect width="60" height="30" fill="#002395" />
        <polygon points="12,0 48,0 48,30" fill="#fecb00" />
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <circle key={n} cx={3 + n * 6} cy={1 + n * 4.6} r="1.7" fill="#fff" />
        ))}
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}
