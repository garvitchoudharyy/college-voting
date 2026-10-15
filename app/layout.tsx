import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Shell from "@/components/Shell";
import "./globals.css";
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
export const metadata: Metadata = { title: "Campus Vote | College Election 2026", description: "Student demo college voting website." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" suppressHydrationWarning><body className={`${jakarta.variable} font-sans`}><Shell>{children}</Shell></body></html>);
}
