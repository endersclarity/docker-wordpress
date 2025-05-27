import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Narissa Real Estate - Magical Property Search',
  description: 'Discover your perfect property with AI-powered semantic search. Find cottages, homes, and estates in Nevada County, CA.',
  keywords: ['real estate', 'property search', 'Nevada County', 'cottages', 'homes', 'AI search'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="magical-bg min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="glass sticky top-0 z-50 border-b border-white/20">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-magical-purple to-magical-pink rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <h1 className="text-xl font-bold text-white font-serif">
                    Narissa Real Estate
                  </h1>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-white hover:text-magical-gold transition-colors">
                    Home
                  </a>
                  <a href="/properties" className="text-white hover:text-magical-gold transition-colors">
                    Properties
                  </a>
                  <a href="/search" className="text-white hover:text-magical-gold transition-colors">
                    Search
                  </a>
                  <a href="/about" className="text-white hover:text-magical-gold transition-colors">
                    About
                  </a>
                </div>
              </nav>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="glass border-t border-white/20 mt-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-white/80">
                <p className="mb-2">© 2024 Narissa Real Estate. All rights reserved.</p>
                <p className="text-sm">Powered by headless WordPress and AI semantic search</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}