import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource-variable/fredoka/index.css";
import "@fontsource-variable/dynapuff/index.css";
import "@fontsource-variable/nunito/index.css";
import "@fontsource/capriola/400.css";
import "@fontsource/schoolbell/400.css";
import "@fontsource/patrick-hand/latin-ext-400.css";
import "@fontsource/patrick-hand/latin-400.css";
import "@fontsource-variable/playfair-display/index.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, isLocale } from "@/lib/i18n";
import "../globals.css";

// one copy of the whole site per language
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.site.name, template: `%s · ${t.site.name}` },
    description: t.site.description,
    alternates: { languages: { en: "/en", bs: "/bs" } },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang}>
      <body>
        <a href="#main" className="skip-link">
          {t.nav.skip}
        </a>
        <SiteHeader lang={lang} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
