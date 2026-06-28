'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package, MapPin, User, Calendar, DollarSign, Shield,
  Star, ChevronLeft, ChevronRight, MessageCircle, Clock,
  CheckCircle, AlertCircle, Share2, Tag, ArrowLeft, Info
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const productId = params?.id as string;

  useEffect(() => {
    if (!productId) return;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        const raw = data.product || data;
        setProduct({
          ...raw,
          title: raw.name,
          price: parseFloat(raw.daily_price || raw.price || 0),
          category: raw.category_name,
          deposit: parseFloat(raw.security_deposit || 0),
          images: typeof raw.images === 'string' ? JSON.parse(raw.images) : (raw.images || []),
          owner: {
            id: raw.owner_id,
            name: raw.owner_name,
            email: raw.owner_email,
          },
          rating: parseFloat(raw.avg_rating || 0),
          reviewCount: parseInt(raw.review_count || 0),
          createdAt: raw.created_at,
        });
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    async function fetchReviews() {
      setReviewLoading(true);
      try {
        const res = await fetch(`/api/reviews?type=product&productId=${productId}`);
        const data = await res.json();
        setReviews(data.reviews || data.data || []);
      } catch (err) { console.error(err); }
      setReviewLoading(false);
    }
    fetchReviews();
  }, [productId]);

  const days = (() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  const totalPrice = product ? product.price * days : 0;
  const totalWithDeposit = totalPrice + (product?.deposit || 0);

  const handleBooking = async () => {
    if (!user) { router.push(`/auth/login?redirect=/products/${productId}`); return; }
    if (!startDate || !endDate) { setBookingError('Please select start and end dates'); return; }
    if (days <= 0) { setBookingError('End date must be after start date'); return; }
    setBookingLoading(true); setBookingError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id, startDate, endDate, totalPrice }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Booking failed'); }
      setBookingSuccess(true);
    } catch (err: any) { setBookingError(err.message); }
    setBookingLoading(false);
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-100 rounded-xl w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-100 rounded-2xl" />
              <div className="space-y-3">
                <div className="h-6 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
        <p className="text-gray-500 mt-1 mb-6">This item may have been removed or doesn't exist.</p>
        <button onClick={() => router.push('/products')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Browse items
        </button>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push('/products')} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Products
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden card-shadow">
            <div className="relative h-80 sm:h-[450px] bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[currentImage]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}
              {product.images && product.images.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
                  <button onClick={() => setCurrentImage(p => p === 0 ? product.images!.length - 1 : p - 1)} className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                    {product.images.map((_: string, i: number) => (
                      <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-emerald-600 w-3' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                  <button onClick={() => setCurrentImage(p => p === product.images!.length - 1 ? 0 : p + 1)} className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 card-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-600/10">{product.category}</span>
                  {product.is_premium && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/10">Premium</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">{product.price.toFixed(2)} DH</div>
                <div className="text-sm text-gray-500">per day</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {product.city}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-gray-900 font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.reviewCount} reviews)</span>
                </div>
              )}
              {product.deposit > 0 && (
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>{product.deposit.toFixed(0)} DH deposit</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Owner Card */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {product.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.owner?.name || 'Owner'}</p>
                    <p className="text-sm text-gray-500">Item owner</p>
                  </div>
                </div>
                {user && user.id !== product.owner?.id && (
                  <button
                    onClick={() => router.push(`/chat/${product.owner?.id}`)}
                    className="btn-secondary text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Contact
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 card-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Reviews ({product.reviewCount || reviews.length})
            </h2>
            {reviewLoading ? (
              <div className="space-y-4">
                {Array.from({length:2}).map((_,i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((r: any) => (
                  <div key={r.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {r.reviewer?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{r.reviewer?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({length: 5}).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 ml-12">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 card-shadow sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Book this item</h2>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Booking sent!</h3>
                <p className="text-sm text-gray-500 mb-4">The owner will review your request.</p>
                <button onClick={() => { setBookingSuccess(false); setStartDate(''); setEndDate(''); }} className="btn-secondary text-sm w-full">
                  Book another
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="font-semibold text-gray-900">{product.price.toFixed(2)} DH / day</span>
                  </div>
                  {product.deposit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deposit</span>
                      <span className="font-medium text-gray-700">{product.deposit.toFixed(0)} DH</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date" value={startDate}
                      min={minDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date" value={endDate}
                      min={startDate || minDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {days > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{product.price.toFixed(2)} DH x {days} day{days > 1 ? 's' : ''}</span>
                      <span className="text-gray-900">{totalPrice.toFixed(2)} DH</span>
                    </div>
                    {product.deposit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Security deposit</span>
                        <span className="text-gray-900">{product.deposit.toFixed(0)} DH</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-emerald-600">{totalWithDeposit.toFixed(2)} DH</span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {bookingError}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="btn-primary w-full py-3"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : user ? (
                    'Request to Book'
                  ) : (
                    'Sign in to Book'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Your payment is secure
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
