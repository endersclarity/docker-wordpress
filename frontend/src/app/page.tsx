'use client';

import { useState } from 'react';
import { Search, Home, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative inline-block mb-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 relative z-10">
            Find Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-magical-pink to-magical-gold">
              Dream Home
            </span>
          </h1>
          <div className="absolute -top-4 -right-4 w-8 h-8 text-magical-gold animate-sparkle">
            <Sparkles className="w-full h-full" />
          </div>
        </div>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Discover magical properties in Nevada County with our AI-powered semantic search. 
          From cozy cottages to luxury estates, find the perfect place to call home.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative glass p-2 rounded-2xl">
            <div className="flex items-center">
              <Search className="w-6 h-6 text-white/70 ml-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your ideal property... 'cozy cottage with mountain views'"
                className="flex-1 bg-transparent text-white placeholder-white/60 px-4 py-3 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-magical-purple to-magical-pink text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            'Mountain cottage',
            'Luxury estate',
            'Family home',
            'Waterfront property',
            'Cabin retreat'
          ].map((suggestion) => (
            <Link
              key={suggestion}
              href={`/search?q=${encodeURIComponent(suggestion)}`}
              className="glass px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              {suggestion}
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="glass p-8 rounded-2xl text-center group hover:bg-white/20 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-magical-purple to-magical-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Search</h3>
          <p className="text-white/80">
            Use natural language to describe your perfect property. Our AI understands context and finds matches beyond keywords.
          </p>
        </div>

        <div className="glass p-8 rounded-2xl text-center group hover:bg-white/20 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-magical-pink to-magical-gold rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Curated Properties</h3>
          <p className="text-white/80">
            Every property is carefully selected and verified. From charming cottages to sprawling estates in Nevada County.
          </p>
        </div>

        <div className="glass p-8 rounded-2xl text-center group hover:bg-white/20 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-magical-gold to-magical-pink rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Magical Experience</h3>
          <p className="text-white/80">
            Enjoy a delightful property search experience with beautiful visuals, smooth interactions, and instant results.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="glass p-8 rounded-2xl max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-white/90 mb-6">
            Browse our complete collection of properties or try our advanced search features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-gradient-to-r from-magical-purple to-magical-pink text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Browse All Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="glass border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Advanced Search
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}