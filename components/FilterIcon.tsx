// Small line icons for the filter chips on the recipes page, one for each filter.
// They take their colour from the surrounding text (the CSS sets it to brown).
const icons: Record<string, React.ReactNode> = {
  all: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  // taste
  sweet: (
    <>
      <path d="M5.5 12.5h13l-1.4 7.5H6.9z" />
      <path d="M6.5 12.5a5.5 4.5 0 0 1 11 0" />
      <path d="M12 8V5.5" />
    </>
  ),
  salty: (
    <>
      <path d="M8 8.5h8l1 11.5H7z" />
      <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
      <path d="M10.5 12.5h.01M13.5 12.5h.01M12 15.5h.01" />
    </>
  ),
  // style
  healthy: (
    <>
      <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" />
      <path d="M5 19l8-8" />
    </>
  ),
  nosugar: (
    <>
      <rect x="6" y="8.5" width="12" height="10" rx="2" />
      <path d="M4 4l16 16" />
    </>
  ),
  guilty: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9h.01M14.5 8.5h.01M15 14h.01M9.5 14.5h.01M12 12h.01" />
    </>
  ),
  // meal
  breakfast: (
    <>
      <path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M16 10.5h1.5a2 2 0 0 1 0 4H16" />
      <path d="M8 3.5v3M12 3.5v3" />
    </>
  ),
  lunch: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  desserts: (
    <>
      <path d="M7 11a5 5 0 0 1 10 0z" />
      <path d="M8 11l4 10 4-10" />
    </>
  ),
  // cuisines
  traditional: (
    <>
      <path d="M5 10h14v5a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" />
      <path d="M3 10h18M9 5.5v2M15 5.5v2" />
    </>
  ),
  middleeast: <path d="M19 14.5A8 8 0 1 1 9.5 5a6.5 6.5 0 0 0 9.5 9.5z" />,
  asian: (
    <>
      <path d="M4 12.5h16a8 6.5 0 0 1-16 0z" />
      <path d="M8.5 3.5l3 7.5M13.5 3.5L12 11" />
    </>
  ),
  others: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
};

export default function FilterIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      {icons[name] ?? icons.others}
    </svg>
  );
}
