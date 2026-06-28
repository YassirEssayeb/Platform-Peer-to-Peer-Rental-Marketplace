'use client';

import Link from 'next/link';
import { Star, MapPin, Shield } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  daily_price: string | number;
  security_deposit: string | number;
  city: string;
  images: string | null;
  owner_name: string;
  category_name: string;
  avg_rating: number | null;
  review_count: number;
  is_premium: number | boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  let images: string[] = [];
  if (typeof product.images === 'string') {
    try { images = JSON.parse(product.images); } catch { images = []; }
  } else if (Array.isArray(product.images)) {
    images = product.images;
  }
  const imgSrc = images[0] || '/placeholder.svg';
  const hasImage = images.length > 0;

  return (
    <Link href={`/products/${product.id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden card-shadow-hover cursor-pointer">
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {hasImage ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              const target = e.currentTarget;
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-emerald-50 to-teal-50';
                fallback.innerHTML = '<span class="text-4xl opacity-50">' + (product.category_name?.charAt(0) || '📦') + '</span>';
                parent.replaceChild(fallback, target);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-emerald-50 to-teal-50">
            <span className="text-4xl opacity-50">{product.category_name?.charAt(0) || '📦'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.is_premium ? (
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Premium
            </span>
          ) : null}
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-gray-700 shadow-sm">
            {product.category_name}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2 mb-1.5 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{product.city}</span>
        </div>
        {product.avg_rating ? (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900">{parseFloat(product.avg_rating as any).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.review_count})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-400">No reviews</span>
          </div>
        )}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-emerald-600">{parseFloat(product.daily_price as any).toFixed(2)} DH</span>
            <span className="text-gray-400 text-sm"> /day</span>
          </div>
          {parseFloat(product.security_deposit as any) > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              {parseFloat(product.security_deposit as any).toFixed(0)} DH
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
