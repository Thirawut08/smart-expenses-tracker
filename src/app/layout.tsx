import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from '@/components/main-nav';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-sans-thai',
  weight: ['400', '500', '600', '700'],
});


export const metadata: Metadata = {
  title: 'Ledger AI',
  description: 'Effortlessly track your income and expenses with AI-powered slip scanning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn(inter.variable, notoSansThai.variable)} suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen bg-background">
            <MainNav />
            <main className="flex-1 container mx-auto p-4 md:p-8">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
