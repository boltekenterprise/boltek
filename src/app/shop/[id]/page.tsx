import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { ArrowLeft, Settings, HelpCircle, ShieldAlert, Award } from 'lucide-react';
import { Metadata } from "next";

export const revalidate = 3600; // ISR: refresh every hour

interface Product {
  title: string;
  category: string;
  price?: string;
  image: string;
  details: string;
  specs: string;
  howToUse: string;
  essay: string;
}

async function getProductData(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'shop_products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Product;
    }
  } catch (err) {
    console.error("Error fetching product data:", err);
  }
  return null;
}

export async function generateStaticParams() {
  try {
    const snap = await getDocs(collection(db, 'shop_products'));
    return snap.docs.map(doc => ({ id: doc.id }));
  } catch (err) {
    console.error("Error in generateStaticParams:", err);
    return [];
  }
}

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductData(params.id);
  if (!product) {
    return {
      title: "Product Not Found | BolteK Enterprise Shop",
    };
  }
  return {
    title: `${product.title} | Buy Fire Safety Equipment Nepal`,
    description: product.details || product.title,
    alternates: {
      canonical: `https://boltekenterprise.com/shop/${params.id}`,
    },
  };
}

export default async function ProductDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const product = await getProductData(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-32 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-burgundy/10">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">The product you are looking for does not exist or has been removed from our catalog.</p>
            <Link
              href="/shop"
              className="bg-[#6B1724] hover:bg-[#6B1724]/90 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse specifications (newline separated)
  const specList = product.specs
    ? product.specs.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#6B1724] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>

          {/* Product Header & Main Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Left: Product Image & Spec Card (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-auto max-h-[450px] object-contain rounded-xl mx-auto"
                />
              </div>

              {/* Specifications Card */}
              {specList.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#6B1724]" />
                    Technical Specifications
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {specList.map((spec, i) => {
                      const parts = spec.split(':');
                      const name = parts[0]?.trim();
                      const value = parts.slice(1).join(':')?.trim();

                      return (
                        <div key={i} className="py-2.5 flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-500 font-medium">{name}</span>
                          <span className="text-gray-900 font-semibold text-right pl-4">{value || 'N/A'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instructions Card */}
              {product.howToUse && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#6B1724]" />
                    How to Operate / Use
                  </h3>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.howToUse}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Title, Price, Details, and Full Essay (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-[#6B1724] border border-red-200">
                    {product.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-2 leading-tight">
                    {product.title}
                  </h1>
                  {product.price ? (
                    <p className="text-xl font-extrabold text-[#6B1724]">{product.price}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Price on request</p>
                  )}
                </div>

                <div className="border-t border-gray-150 pt-5">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Overview
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {product.details}
                  </p>
                </div>
              </div>

              {/* Full Safety & Educational Essay */}
              {product.essay && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#6B1724]" />
                    Comprehensive Guide & Safety Insights
                  </h2>
                  <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line space-y-4 font-normal">
                    {product.essay}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
