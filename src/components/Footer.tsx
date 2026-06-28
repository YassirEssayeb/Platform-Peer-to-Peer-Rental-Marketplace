import { Package } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <Package className="w-4 h-4 text-white" />
              </div>
              RentAll
            </div>
            <p className="text-sm leading-relaxed">
              The sustainable peer-to-peer rental marketplace. Rent items from people near you instead of buying new. Save money, reduce waste.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Browse</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products?category=electronics" className="hover:text-emerald-400 transition-colors duration-200">Electronics</Link></li>
              <li><Link href="/products?category=tools-diy" className="hover:text-emerald-400 transition-colors duration-200">Tools & DIY</Link></li>
              <li><Link href="/products?category=camping-outdoor" className="hover:text-emerald-400 transition-colors duration-200">Camping & Outdoor</Link></li>
              <li><Link href="/products?category=clothing-fashion" className="hover:text-emerald-400 transition-colors duration-200">Clothing & Fashion</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">For Owners</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard/products/new" className="hover:text-emerald-400 transition-colors duration-200">List an Item</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors duration-200">Owner Dashboard</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-emerald-400 transition-colors duration-200">Manage Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors duration-200">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors duration-200">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p>&copy; 2026 RentAll. All rights reserved.</p>
          <p>Made for a sustainable future</p>
        </div>
      </div>
    </footer>
  );
}
