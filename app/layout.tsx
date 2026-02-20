import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/src/lib/registry";
import { A2UISurfaceProvider } from "@/src/components/SurfaceContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A2UI + Common Origin Demo",
  description: "Agent-generated UI rendered through a trusted component catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: 'light' }}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>
          <A2UISurfaceProvider>
            {children}
          </A2UISurfaceProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
