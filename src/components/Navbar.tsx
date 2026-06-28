'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Menu, X, User, LogOut, LayoutDashboard, Shield, MessageCircle, Wallet, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">RentAll</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/products" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200">
                Browse
              </Link>
              {user?.role === 'owner' && (
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200">
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Link href="/chat" className="relative p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors duration-200" title="Messages">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link href="/wallet" className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors duration-200" title="Wallet">
                  <Wallet className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 ml-1.5 py-1.5 pl-2 pr-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200 border border-transparent hover:border-emerald-200"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4 text-gray-400" /> Profile
                        </Link>
                        {user.role === 'owner' && (
                          <Link href="/dashboard/products/new" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Plus className="w-4 h-4 text-gray-400" /> List an Item
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-5 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden relative z-50 p-2.5 -mr-2 text-gray-600 hover:text-emerald-600 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-40 md:hidden">
            <div className="pt-20 px-4 pb-6 flex flex-col h-full">
              <div className="space-y-1 flex-1">
                <Link href="/products" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                  Browse Items
                </Link>
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>
                    {user.role === 'owner' && (
                      <>
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                          Dashboard
                        </Link>
                        <Link href="/dashboard/products/new" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                          List an Item
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/chat" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                      Messages
                    </Link>
                    <Link href="/wallet" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                      Wallet
                    </Link>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-medium transition-colors">
                      Sign In
                    </Link>
                    <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
              {user && (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full mt-auto">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
