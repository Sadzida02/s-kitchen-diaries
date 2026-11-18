import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).auth.metaTitle, robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).auth;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <LoginForm lang={lang} />
      </div>
    </section>
  );
}
