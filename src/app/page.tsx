'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, TrendingUp, Star, Package, ArrowRight, Leaf, Users, BadgePercent, Calendar, Shield, Sparkles, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Category { id: number; name: string; slug: string; icon: string; }

const categoryIcons: Record<string, string> = {
  electronics: '📷', 'tools-diy': '🔧', 'camping-outdoor': '⛺',
  'clothing-fashion': '👔', 'sports-fitness': '🏋️', 'books-media': '📚',
  'party-events': '🎉', 'garden-outdoor': '🌻', 'musical-instruments': '🎵', 'baby-kids': '👶'
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetch('/api/products/featured').then(r => r.json()).then(d => setFeaturedProducts(d.products || [])).catch(() => {});
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (searchCity) params.set('city', searchCity);
    window.location.href = `/products?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-emerald-100 mb-6 border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>The smarter way to rent things</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-[1.1] tracking-tight">
              Rent Anything.<br />
              <span className="text-emerald-200">Own Less. Live More.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/90 mb-8 max-w-xl leading-relaxed">
              The sustainable peer-to-peer marketplace. Rent tools, electronics, camping gear, and more from people near you.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What do you need to rent?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-lg shadow-emerald-900/20"
                />
              </div>
              <div className="sm:w-48 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-lg shadow-emerald-900/20"
                />
              </div>
              <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
                Search
              </button>
            </form>
            <div className="flex items-center gap-4 mt-6 text-sm text-emerald-200">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> 50+ items available</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Secure payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 mb-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Leaf, label: 'Sustainable', desc: 'Reduce waste, share more', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
            { icon: Users, label: 'Community', desc: 'Trusted local network', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
            { icon: BadgePercent, label: 'Save Money', desc: 'Pay only when you need', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
            { icon: TrendingUp, label: 'Earn Income', desc: 'List your idle items', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 flex items-center gap-3 md:gap-4 card-shadow-hover">
              <div className={`${item.bg} p-2.5 rounded-xl shrink-0`}>
                <item.icon className={`w-5 h-5 bg-gradient-to-br ${item.color} bg-clip-text`} style={{ color: item.color.includes('emerald') ? '#059669' : item.color.includes('blue') ? '#2563eb' : item.color.includes('amber') ? '#d97706' : '#9333ea' }} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-500 truncate">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find exactly what you need</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-emerald-200 card-shadow-hover transition-all duration-200"
              >
                <div className="text-3xl mb-2">{categoryIcons[cat.slug] || '📦'}</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50/80 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Featured Items</h2>
                <p className="section-subtitle">Popular rentals chosen by our community</p>
              </div>
              <Link href="/products" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group">
                View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/products" className="btn-secondary">
                View All Items <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle max-w-xl mx-auto">Three simple steps to rent or list items</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Find What You Need', desc: 'Browse items by category or search for specific products available near you.', step: '01' },
            { icon: Calendar, title: 'Book & Pay', desc: 'Select your dates, see the total cost, and send a booking request to the owner.', step: '02' },
            { icon: Star, title: 'Enjoy & Review', desc: 'Pick up the item, use it, return it, and leave a review for the community.', step: '03' },
          ].map((step) => (
            <div key={step.title} className="relative text-center group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {step.step}
              </div>
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-5 mt-2 group-hover:border-emerald-200 group-hover:shadow-md transition-all duration-200">
                <step.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="gradient-hero rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Have items sitting idle?</h2>
            <p className="text-emerald-100/90 mb-8 max-w-md mx-auto leading-relaxed">
              Turn your underutilized belongings into income. List your items on RentAll and start earning today.
            </p>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
            >
              Start Earning <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
