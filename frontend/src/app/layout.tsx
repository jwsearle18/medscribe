import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter carries every operational surface: labels, buttons, fields, tables.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Newsreader is reserved for the patient name and the note title. The serif
// says: this record is about a person. (See DESIGN.md, Serif-Is-Sacred Rule.)
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

// Mono is used for verbatim transcript excerpts and identifiers, where
// character-level precision reads as evidence.
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedScribe",
  description: "Record doctor-patient visits and auto-generate structured medical notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
