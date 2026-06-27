import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "BolteK Enterprise Pvt. Ltd. | Fire Protection Company Nepal | Fire Hydrant, Sprinkler & Alarm Systems",
  description: "BolteK Enterprise Pvt. Ltd. is Nepal's leading fire protection company. We specialize in fire hydrant system design & installation, fire alarm systems, sprinkler systems, fire suppression, and fire safety training. Serving Kathmandu, Nepal and beyond.",
  keywords: [
    "boltek",
    "boltek enterprise",
    "boltekenterprise",
    "boltek nepal",
    "boltek enterprise nepal",
    "fire protection company nepal",
    "fire hydrant system kathmandu",
    "fire alarm installation nepal",
    "sprinkler system nepal",
    "fire suppression system nepal",
    "fire safety training nepal",
    "AMC fire systems nepal",
    "fire risk assessment nepal",
    "fire fighting system nepal",
    "building fire safety nepal"
  ],
  authors: [{ name: "BolteK Enterprise Pvt. Ltd." }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://boltekenterprise.com",
  },
  openGraph: {
    type: "website",
    url: "https://boltekenterprise.com",
    title: "BolteK Enterprise | Nepal's Leading Fire Protection Company",
    description: "Fire hydrant systems, sprinklers, alarms, suppression & safety training across Nepal. Serving hotels, hospitals, offices & industries.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-ivory text-stone-900 flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
