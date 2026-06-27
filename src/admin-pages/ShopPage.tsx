"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Loader, ShoppingBag, Eye, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Product {
  id: string;
  title: string;
  category: string;
  price?: string;
  image: string;
  details: string;
}

interface ShopPageProps {
  initialProducts?: Product[];
}

export default function ShopPage({ initialProducts }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (initialProducts) return;
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'shop_products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Product));
        setProducts(data);
      } catch (err) {
        console.error('Error fetching shop catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [initialProducts]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-flame-700 text-sm font-semibold uppercase tracking-widest font-heading">
              Safety Equipment Catalog
            </span>
            <h1 className="font-heading font-black text-4xl sm:text-5xl text-gray-900 mt-3 mb-4">
              Fire Safety <span className="gradient-text">Shop</span>
            </h1>
            <div className="section-divider mx-auto mb-5" />
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Explore our range of certified fire safety and response equipment. Click on any product to view full specifications, operating instructions, and safety essays.
            </p>
          </div>

          {/* Filtering Tabs */}
          {!loading && products.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                    activeCategory === category
                      ? 'bg-flame-700 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-flame-700 hover:text-flame-700 shadow-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Catalog Content */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Loader className="w-8 h-8 text-flame-700 animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Products Found</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {products.length === 0 
                  ? 'There are currently no products uploaded to our shop catalog.' 
                  : `No products matching the category "${activeCategory}" could be found.`}
              </p>
              {products.length > 0 && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-4 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-5 py-2 rounded-lg text-xs transition-colors"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-flame-100 transition-all duration-300 flex flex-col"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* View Details hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-xs shadow-md">
                        <Eye className="w-3.5 h-3.5 text-flame-700" />
                        View Guide & Specs
                      </span>
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-flame-700 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight group-hover:text-flame-700 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
                        {product.details}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                        {product.price || <span className="text-gray-400 font-normal italic">Contact for price</span>}
                      </span>
                      <span className="text-flame-700 font-bold text-xs group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
