import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, BookOpen, Flame, Share2 } from 'lucide-react';
import { Metadata } from "next";

export const revalidate = 60; // ISR: refresh every 1 minute

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  createdAt?: { seconds: number } | unknown;
}

async function getBlogData(slug: string): Promise<Blog | null> {
  try {
    const q = query(collection(db, 'blogs'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        slug: data.slug || '',
        category: data.category || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        image: data.image || '',
        createdAt: data.createdAt ? { seconds: data.createdAt.seconds } : undefined,
      } as Blog;
    }
  } catch (err) {
    console.error("Error fetching blog data:", err);
  }
  return null;
}

export async function generateStaticParams() {
  try {
    const snap = await getDocs(collection(db, 'blogs'));
    return snap.docs.map(doc => {
      const data = doc.data();
      return { slug: data.slug || doc.id };
    });
  } catch (err) {
    console.error("Error in generateStaticParams:", err);
    return [];
  }
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const blog = await getBlogData(params.slug);
  if (!blog) {
    return {
      title: "Article Not Found | BolteK Enterprise",
    };
  }
  return {
    title: `${blog.title} | BolteK Enterprise`,
    description: blog.excerpt || blog.title,
    alternates: {
      canonical: `https://boltekenterprise.com/education/blogs/${params.slug}`,
    },
  };
}

function formatDate(value: unknown): string {
  try {
    if (!value) return '';
    const val = value as { seconds?: number };
    const ts = val.seconds ? val.seconds * 1000 : new Date(value as string | number | Date).getTime();
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return ''; }
}

function readTime(content?: string, excerpt?: string): string {
  const words = ((content || '') + ' ' + (excerpt || '')).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function renderMarkdownToHtml(md: string): string {
  if (!md) return '';
  let html = md;
  
  // Escape HTML tags to prevent cross-site issues
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Headers (H3, H2, H1)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold font-heading mt-6 mb-2 text-stone-850">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-black font-heading mt-8 mb-4 border-l-4 border-[#6B1724] pl-3 text-stone-900">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-black font-heading mt-10 mb-6 text-stone-950">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="border-stone-200 my-8" />');

  // Blockquotes
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-[#6B1724] bg-red-50/50 p-4 rounded-r-lg italic my-4">$1</blockquote>');

  // Tables
  const lines = html.split('\n');
  let inTable = false;
  const parsedLines = lines.map(line => {
    const isRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isRow) {
      if (line.includes('---|') || line.includes(':---|') || line.includes('---:|')) {
        return '';
      }
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const cellTag = !inTable ? 'th' : 'td';
      const cellClass = !inTable ? 'px-4 py-2 bg-stone-100 font-bold border border-stone-200 text-left' : 'px-4 py-2 border border-stone-200';
      const row = `<tr>${cells.map(c => `<${cellTag} class="${cellClass}">${c}</${cellTag}>`).join('')}</tr>`;
      
      if (!inTable) {
        inTable = true;
        return `<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-stone-200 text-sm"><thead>${row}</thead><tbody>`;
      } else {
        return row;
      }
    } else {
      if (inTable) {
        inTable = false;
        return '</tbody></table></div>' + '\n' + line;
      }
      return line;
    }
  });
  html = parsedLines.filter(l => l !== '').join('\n');

  // Bullet Lists
  html = html.replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc text-stone-600 my-1">$1</li>');
  html = html.replace(/(<li.*?>.*?<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`);

  // Paragraphs
  const finalLines = html.split('\n');
  const processed = finalLines.map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('<') && !trimmed.endsWith('>')) {
      return `<p class="text-stone-600 leading-relaxed text-base my-4">${trimmed}</p>`;
    }
    return line;
  });
  
  return processed.join('\n');
}

const CATEGORY_COLORS: Record<string, string> = {
  Safety:       'bg-red-50   text-red-700   border-red-200',
  Training:     'bg-blue-50  text-blue-700  border-blue-200',
  Maintenance:  'bg-green-50 text-green-700 border-green-200',
  Installation: 'bg-amber-50 text-amber-700 border-amber-200',
  Regulation:   'bg-purple-50 text-purple-700 border-purple-200',
};
function categoryColor(cat?: string): string {
  return CATEGORY_COLORS[cat || ''] ?? 'bg-stone-50 text-stone-600 border-stone-200';
}

export default async function BlogDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const blog = await getBlogData(params.slug);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {!blog ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
            <h2 className="font-heading font-black text-2xl text-stone-800 mb-2">Article not found</h2>
            <p className="text-stone-500 text-sm mb-6">This article may have been moved or deleted.</p>
            <Link href="/education/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1724] border border-[#6B1724] px-5 py-2.5 rounded-full hover:bg-[#6B1724] hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Articles
            </Link>
          </div>
        ) : (
          <>
            {blog.image ? (
              <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden pt-16">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="absolute top-20 left-0 right-0 max-w-3xl mx-auto px-6">
                  <Link href="/education/blogs" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> All Articles
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative bg-[#6B1724] h-40 pt-16 overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                <div className="max-w-3xl mx-auto px-6 pt-6 relative">
                  <Link href="/education/blogs" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> All Articles
                  </Link>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
              <div className={`bg-white rounded-2xl shadow-xl border border-stone-100 p-8 ${blog.image ? '-mt-16 relative z-10' : 'mt-8'}`}>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {blog.category && (
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryColor(blog.category)}`}>
                      {blog.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    {readTime(blog.content, blog.excerpt)}
                  </span>
                </div>

                <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-snug mb-4">
                  {blog.title}
                </h1>

                <div className="flex items-center justify-between border-t border-stone-100 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#6B1724] flex items-center justify-center text-white">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">BolteK Safety Team</p>
                      <p className="text-xs text-stone-400">Certified Fire Safety Engineers</p>
                    </div>
                  </div>
                  <ShareButton
                    title={blog.title}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#6B1724] border border-stone-200 hover:border-[#6B1724]/40 px-3 py-1.5 rounded-full transition-all"
                  />
                </div>
              </div>

              <div
                className="mt-8 prose prose-stone prose-lg max-w-none
                  prose-headings:font-heading prose-headings:font-black prose-headings:text-stone-900
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-[#6B1724] prose-h2:pl-4
                  prose-h3:text-xl prose-h3:mt-8
                  prose-p:text-stone-600 prose-p:leading-relaxed prose-p:text-[1.05rem]
                  prose-a:text-[#6B1724] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-stone-800
                  prose-ul:my-4 prose-li:text-stone-600 prose-li:my-1
                  prose-blockquote:border-[#6B1724] prose-blockquote:bg-red-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-hr:border-stone-200"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(blog.content || blog.excerpt || '') }}
              />

              <div className="mt-12 pt-8 border-t border-stone-200 flex items-center justify-between">
                <Link
                  href="/education/blogs"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1724] border border-[#6B1724] px-5 py-2.5 rounded-full hover:bg-[#6B1724] hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" /> All Articles
                </Link>
                <ShareButton
                  title={blog.title}
                  className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-[#6B1724] border border-stone-200 hover:border-[#6B1724]/40 px-5 py-2.5 rounded-full transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" /> Share this article
                </ShareButton>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
