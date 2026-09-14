import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Match AI — Resume Intelligence",
  description: "Analyze resume-to-job fit with explainable NLP scoring, skill-gap insights, and tailored career tools.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
