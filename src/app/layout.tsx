import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { StudyLiteProvider } from "@/components/providers/studylite-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "StudyLite — Study. Level Up. Repeat.",
  description:
    "Gamified student learning platform with daily missions, quizzes, XP, streaks, and AI tutoring.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <StudyLiteProvider>
            <ToastProvider>{children}</ToastProvider>
          </StudyLiteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
