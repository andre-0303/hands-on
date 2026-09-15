import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Logo } from "@/components/Logo";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Hands On", template: "%s | Hands On" },
  description: "Projetos práticos por área para treinar programação: cenário real, passo a passo, dicas e gabarito.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
              <Logo className="size-6 text-orange" />
              hands on
            </Link>
            <nav className="text-sm text-muted">
              <Link href="/#areas" className="-m-2 inline-block p-2 hover:text-fg">
                Áreas
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted">
            Feito por estudante, para quem aprende fazendo.
          </div>
        </footer>
      </body>
    </html>
  );
}
