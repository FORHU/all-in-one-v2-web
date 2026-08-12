import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";
import { getTenantConfig } from "@/tenants/registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";
  const tenant = getTenantConfig(slug);

  return {
    title: {
      template: `%s | ${tenant?.name ?? "Storefront"}`,
      default: tenant?.seo.title ?? "Storefront",
    },
    description: tenant?.seo.description,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const slug = (await headers()).get("x-tenant-slug") ?? "fashion";

  return (
    <html lang="en" data-tenant={slug} suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background-primary text-text-primary`}
      >
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" theme="system" richColors />
          <AuthListener />
        </QueryProvider>
      </body>
    </html>
  );
}
