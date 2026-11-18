import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfileApp from "@/components/ProfileApp";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).profile.metaTitle, robots: { index: false, follow: false } };
}

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ProfileApp lang={lang} />;
}
