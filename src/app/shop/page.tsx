import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import ShopPage from "@/admin-pages/ShopPage";
import { Metadata } from "next";

export const revalidate = 60; // ISR: refresh every 1 minute

export const metadata: Metadata = {
  title: 'Fire Fighting Equipment Shop Nepal | Fire Extinguishers & Alarms | BolteK',
  description: 'Buy certified fire fighting equipment in Nepal. Premium fire extinguishers, UL-listed fire doors, smoke detectors, addressable fire alarm panels, and safety gear.',
  keywords: ["boltek", "boltek enterprise", "boltekenterprise", "boltek shop", "buy fire extinguisher nepal", "fire door price nepal", "smoke detector nepal"],
  alternates: { canonical: 'https://boltekenterprise.com/shop' }
};

interface Product {
  id: string;
  title: string;
  category: string;
  price?: string;
  image: string;
  details: string;
}

async function getProducts() {
  try {
    const q = query(collection(db, 'shop_products'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(docSnap => {
      const p = docSnap.data();
      return {
        id: docSnap.id,
        title: p.title || '',
        category: p.category || '',
        price: p.price || '',
        image: p.image || '',
        details: p.details || '',
      } as Product;
    });
    return data;
  } catch (err) {
    console.error("Error fetching products server-side:", err);
    return [];
  }
}

export default async function Page() {
  const products = await getProducts();
  return <ShopPage initialProducts={products} />;
}
