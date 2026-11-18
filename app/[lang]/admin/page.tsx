import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminApp from "@/components/admin/AdminApp";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AdminApp lang={lang} />;
}
