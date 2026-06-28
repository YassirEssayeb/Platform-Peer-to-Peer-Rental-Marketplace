'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Search, SlidersHorizontal, X, MapPin, Tag, DollarSign, ChevronDown, ChevronUp, Star, Loader, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Category { id: number; name: string; slug: string; }

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [cityInput, setCityInput] = useState(city);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (updates.page === undefined && !updates.hasOwnProperty('page')) {
      params.set('page', '1');
    }
    router.push(`/products?${params.toString()}`);
  }, [router, searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (city) params.set('city', city);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sort) params.set('sort', sort);
        params.set('page', String(page));
        params.set('limit', '12');

        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products?${params.toString()}`),
          fetch('/api/categories'),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(productsData.products || productsData.data || []);
        setTotal(productsData.total || productsData.count || 0);
        setCategories(categoriesData.categories || categoriesData.data || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search, category, city, minPrice, maxPrice, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: '1' });
  };

  const clearFilters = () => {
    router.push('/products');
    setSearchInput('');
    setCityInput('');
  };

  const totalPages = Math.ceil(total / 12);
  const hasFilters = search || category || city || minPrice || maxPrice;

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Browse Items</h1>
          <p className="section-subtitle">{total} item{total !== 1 ? 's' : ''} available to rent</p>
        </div>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search items..."
                className="input-field w-48 sm:w-56 pl-10"
              />
            </div>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 border rounded-xl transition lg:hidden ${showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:block lg:w-64 shrink-0`}>
          {showFilters && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)} />
          )}
          <div className={`relative ${showFilters ? 'w-80 max-w-[85vw] ml-auto' : ''} bg-white lg:bg-transparent lg:rounded-none rounded-2xl lg:border-0 border border-gray-200 p-5 lg:p-0 lg:sticky lg:top-24 overflow-y-auto`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-emerald-600 hover:underline font-medium">
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</label>
                <div className="space-y-0.5">
                  <button
                    onClick={() => updateParams({ category: '', page: '1' })}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams({ category: cat.slug, page: '1' })}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === cat.slug ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={e => setCityInput(e.target.value)}
                    onBlur={() => updateParams({ city: cityInput, page: '1' })}
                    onKeyDown={e => e.key === 'Enter' && updateParams({ city: cityInput, page: '1' })}
                    placeholder="Any city"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number" min="0" placeholder="Min"
                      value={minPrice}
                      onChange={e => updateParams({ minPrice: e.target.value, page: '1' })}
                      className="input-field pl-8"
                    />
                  </div>
                  <span className="text-gray-300 shrink-0">—</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number" min="0" placeholder="Max"
                      value={maxPrice}
                      onChange={e => updateParams({ maxPrice: e.target.value, page: '1' })}
                      className="input-field pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sort By</label>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={sort}
                    onChange={e => updateParams({ sort: e.target.value, page: '1' })}
                    className="select-field pl-10 appearance-none bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="border-t border-gray-100 pt-4 lg:hidden">
                  <button onClick={() => setShowFilters(false)} className="btn-primary w-full">
                    Show Results ({total})
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 btn-secondary">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    onClick={() => updateParams({ page: String(page - 1) })}
                    disabled={page <= 1}
                    className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-300 px-1">...</span>}
                          <button
                            onClick={() => updateParams({ page: String(p) })}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                  </div>
                  <button
                    onClick={() => updateParams({ page: String(page + 1) })}
                    disabled={page >= totalPages}
                    className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="page-container py-20 flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
