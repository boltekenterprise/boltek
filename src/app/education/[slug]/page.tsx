import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { hardcodedBlogs } from "@/lib/hardcodedBlogs";
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
  const hardcoded = hardcodedBlogs.find(b => b.slug === slug);
  if (hardcoded) return hardcoded;

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
  const params = hardcodedBlogs.map(b => ({ slug: b.slug }));

  try {
    const snap = await getDocs(collection(db, 'blogs'));
    const firebaseParams = snap.docs.map(doc => {
      const data = doc.data();
      return { slug: data.slug || doc.id };
    });
    return [...params, ...firebaseParams];
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
  
  // 1. Escape HTML to prevent XSS but preserve safe entities
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // 2. Code Blocks (Expert Formatting for technical blogs/data)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<div class="my-8 rounded-xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
      <div class="flex items-center px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div class="flex gap-1.5"><div class="w-3 h-3 rounded-full bg-red-500/80"></div><div class="w-3 h-3 rounded-full bg-yellow-500/80"></div><div class="w-3 h-3 rounded-full bg-green-500/80"></div></div>
        <span class="ml-4 text-xs font-mono text-gray-400 uppercase tracking-widest">${lang || 'Data'}</span>
      </div>
      <pre class="p-5 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // 3. Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-stone-100 text-[#6B1724] font-mono text-[0.9em] font-semibold border border-stone-200">$1</code>');

  // 4. Headers (H3, H2, H1)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold font-heading mt-10 mb-4 text-stone-900">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-3xl font-black font-heading mt-12 mb-6 border-b-2 border-stone-100 pb-2 text-stone-900 flex items-center gap-3"><span class="w-2 h-8 bg-[#6B1724] rounded-full inline-block"></span>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-black font-heading mt-14 mb-8 text-stone-950">$1</h1>');
  
  // 5. Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic text-stone-900 block mt-4 mb-1">$1</strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-stone-900 block mt-4 mb-1">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-stone-700">$1</em>');
  
  // 6. Horizontal rule
  html = html.replace(/^---$/gm, '<div class="w-full flex justify-center my-12"><div class="w-24 h-1 bg-stone-200 rounded-full"></div></div>');

  // 7. Blockquotes (Expert Callouts)
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote class="relative border-l-4 border-[#6B1724] bg-gradient-to-r from-red-50/80 to-transparent p-6 rounded-r-2xl italic my-8 text-stone-700 font-medium shadow-sm"><span class="absolute top-2 left-2 text-4xl text-[#6B1724]/10 font-serif font-black">"</span><div class="relative z-10">$1</div></blockquote>');

  // 8. Tables (Data presentation)
  const lines = html.split('\n');
  let inTable = false;
  const parsedLines = lines.map(line => {
    const isRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isRow) {
      if (line.includes('---|') || line.includes(':---|') || line.includes('---:|')) return '';
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const cellTag = !inTable ? 'th' : 'td';
      const cellClass = !inTable 
        ? 'px-6 py-4 bg-stone-900 text-white font-semibold text-left tracking-wider text-sm uppercase' 
        : 'px-6 py-4 border-b border-stone-100 text-stone-600 text-sm';
      const row = `<tr class="${!inTable ? '' : 'hover:bg-stone-50 transition-colors'}">${cells.map(c => `<${cellTag} class="${cellClass}">${c}</${cellTag}>`).join('')}</tr>`;
      
      if (!inTable) {
        inTable = true;
        return `<div class="overflow-x-auto my-10 rounded-xl shadow-lg border border-stone-200"><table class="min-w-full border-collapse text-left"><thead>${row}</thead><tbody class="bg-white">`;
      } else {
        return row;
      }
    } else {
      if (inTable) {
        inTable = false;
        return '</tbody></table></div>\n' + line;
      }
      return line;
    }
  });
  html = parsedLines.filter(l => l !== '').join('\n');

  // 9. Lists (Ordered and Unordered)
  html = html.replace(/^(\d+)\.\s+(.*?)$/gm, '<li class="ml-6 pl-2 list-decimal marker:text-[#6B1724] marker:font-bold text-stone-600 my-2 leading-relaxed" data-type="ol">$2</li>');
  html = html.replace(/^[\-\*]\s+(.*?)$/gm, '<li class="ml-6 pl-2 list-disc marker:text-[#6B1724] text-stone-600 my-2 leading-relaxed" data-type="ul">$1</li>');
  
  html = html.replace(/(<li[^>]*data-type="ol".*?>.*?<\/li>\n?)+/g, (match) => `<ol class="my-6 space-y-2 bg-stone-50/50 p-6 rounded-2xl border border-stone-100">${match}</ol>`);
  html = html.replace(/(<li[^>]*data-type="ul".*?>.*?<\/li>\n?)+/g, (match) => `<ul class="my-6 space-y-2 bg-stone-50/50 p-6 rounded-2xl border border-stone-100">${match}</ul>`);

  // 10. Paragraphs (Split by double newline for accurate plain text rendering)
  const blocks = html.split(/\n\n+/);
  const processed = blocks.map(block => {
    const trimmed = block.trim();
    if (trimmed && !trimmed.startsWith('<') && !trimmed.endsWith('>')) {
      // Allow single newlines inside a paragraph to become <br>
      const formattedText = trimmed.replace(/\n/g, '<br/>');
      return `<p class="text-stone-600 leading-[1.8] text-[1.1rem] my-6 font-light tracking-wide">${formattedText}</p>`;
    }
    return block;
  });
  
  return processed.join('\n\n');
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
