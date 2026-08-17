"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Search, Tag, MessageSquare, ArrowRight, CornerDownRight, User, Calendar } from "lucide-react";
import { useGlobalContext } from "@/context/global-context";

interface Comment {
  author: string;
  text: string;
  date: string;
}

interface BlogPost {
  id: string;
  title: string;
  category: "Retail" | "Pharmacy" | "Accounting";
  author: string;
  date: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  comments: Comment[];
}

export default function BlogPage() {
  const { theme } = useGlobalContext();
  const isLight = theme === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // Comment Form States
  const [commentForm, setCommentForm] = useState({ author: "", text: "" });

  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "POST-101",
      title: "Streamlining Supermarket Checkout Speed: Hardware & UI Best Practices",
      category: "Retail",
      author: "Mian Talal",
      date: "2026-05-20",
      slug: "streamlining-supermarket-checkout-speed",
      summary: "Explore how weight-scale APIs, multi-lane barcode buffering, and fluid keyboard shortcuts combine in MT Core to reduce transaction queues by 40%.",
      content: `In high-volume departmental stores, cashier bottlenecks represent the single greatest source of customer dissatisfaction. Every extra second spent searching for an unbarcoded item, waiting for a receipt printer buffer, or manual taxing calculations accumulates into massive queues during peak hours.

      To solve this, MT Core introduces key hardware abstractions:
      1. Dual-Core Barcode Buffer Buffers: Rather than querying the centralized network database on every single scan, the POS client maintains an offline-first indexed cache, recognizing products in less than 5 milliseconds.
      2. Automated Weight-Scale APIs: Fresh products are weighed directly at checkout, with the scale transmitting weight outputs directly to the cart, eliminating human manual entry errors.
      3. Custom Hotkey Matrix: Cashiers can close out standard cash checkouts using the spacebar or number pads without needing to touch a mouse.

      By optimizing the interface to require minimal visual shifts, MT Core enables cashiers to process up to 35 transactions per hour, compared to the industry average of 22.`,
      tags: ["Checkout Velocity", "Hardware", "Super Markets"],
      comments: [
        { author: "Hassan Cashier", text: "The spacebar hotkey is a lifesaver in rush hours! Super helpful guide.", date: "2026-05-21" }
      ]
    },
    {
      id: "POST-102",
      title: "Batch Expiry Compliance in Pharmacies: Zero Waste Strategy",
      category: "Pharmacy",
      author: "Dr. Zainab Ghafoor",
      date: "2026-05-25",
      slug: "pharmacy-expiry-compliance",
      summary: "Manual pharmacy logs fail when managing 10,000+ medicine SKU lines. Learn how batch-tracking registry databases prevent waste.",
      content: `Expired medicines are not just financial losses; they represent extreme regulatory liability. For pharmacies managing thousands of drug lines, traditional physical checks lead to human errors.

      MT Core features a dedicated Pharmaceutical Batch Registry:
      - Multi-Batch Product Records: A single drug SKU (e.g. Panadol) can have multiple batches (PAN-01, PAN-02) each tied to a distinct expiration date.
      - First-Expiry First-Out (FEFO): The POS screen automatically suggests the batch closest to expiration when cashiers search, ensuring older stock clears first.
      - 60-Day Expiry Warnings: The dashboard features a real-time warning grid listing drugs expiring soon, triggering automatic wholesale return forms.

      Through digital batch management, MedCare networks successfully reduced drug wastage write-offs to zero in less than 3 months.`,
      tags: ["Healthcare", "Expiry Warnings", "FEFO"],
      comments: []
    },
    {
      id: "POST-103",
      title: "Double-Entry Ledger Bookkeeping vs Basic Cash Registers",
      category: "Accounting",
      author: "Mian Talal",
      date: "2026-05-29",
      slug: "double-entry-bookkeeping-vs-cash-registers",
      summary: "Why simple cash drawers hold retail businesses back, and how live debit-credit POS journals automate Balance Sheets.",
      content: `Many store owners assume a POS is simply a fast cash register. However, at the end of the month, they are forced to manually reconcile cashier receipts, supplier invoices, and utility payments in separate accounting books.

      MT Core operates as a real-time ERP using direct Double-Entry Bookkeeping:
      - Automatic Journal Entries: The instant a cashier clicks 'Confirm Sale', MT Core fires a live Journal Entry. It debits Cash/Bank assets, credits POS Revenue, debits Cost of Goods Sold (COGS), and credits Product Stock Asset Valuation.
      - Instant Profit & Loss: Since the general ledger updates in real-time, owners can access their exact P&L statement, Trial Balance, and Balance Sheet instantly.
      - Supplier Credit Tracking: Stock purchases are logged under Accounts Payable, automatically recording debt ledgers.

      By eliminating manual bookkeeping, retail owners save up to 40 hours of accounting time each month.`,
      tags: ["Double Entry", "ERP Books", "Accounting Ledger"],
      comments: [
        { author: "Zahid Ali", text: "This is exactly why we switched our mobile shop branches to MT Core. The real-time general ledger is perfect.", date: "2026-05-30" }
      ]
    }
  ]);

  const categories = ["All", "Retail", "Pharmacy", "Accounting"];

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.text) return;

    const newComment: Comment = {
      author: commentForm.author,
      text: commentForm.text,
      date: new Date().toISOString().split("T")[0]
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setCommentForm({ author: "", text: "" });
  };

  const activePost = posts.find(p => p.id === activePostId);

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-black text-gray-100"
    }`}>
      <SiteHeader />

      {/* Hero Banner */}
      <section className={`relative pt-20 pb-16 border-b text-center overflow-hidden transition-colors duration-200 ${
        isLight ? "bg-white border-slate-200" : "border-brand-dark-border"
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className={`text-3xl sm:text-5xl font-black mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
            MT Core <span className="sky-gradient-text">Commercial Blog</span>
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            The core technology behind your business — technical guides, compliance standards, and ERP strategies.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Sidebar Filters */}
        <div className="space-y-6 lg:col-span-1">
          {/* Search Box */}
          <div className="relative">
            <Search className={`absolute left-3 top-3.5 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs focus:outline-none transition border ${
                isLight
                  ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs"
                  : "bg-brand-dark-surface border-brand-dark-border text-white focus:border-brand-sky"
              }`}
            />
          </div>

          {/* Categories */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-brand-dark-surface/50 border-brand-dark-border"
          }`}>
            <h4 className={`font-bold text-xs uppercase tracking-wider mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>Categories</h4>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setActivePostId(null); }}
                  className={`text-left text-xs py-2 px-3 rounded-lg transition font-medium cursor-pointer ${
                    activeCategory === cat
                      ? "bg-sky-500 text-white font-bold shadow-xs"
                      : isLight
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-gray-400 hover:text-white hover:bg-brand-dark-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Posts list or Details */}
        <div className="lg:col-span-3 space-y-8">
          {activePostId && activePost ? (
            /* Post Detail View */
            <article className={`p-6 sm:p-8 rounded-2xl animate-fade-in-up space-y-6 border ${
              isLight ? "bg-white border-slate-200 shadow-md text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-white"
            }`}>
              <button
                onClick={() => setActivePostId(null)}
                className="text-sky-600 hover:underline text-xs flex items-center gap-1.5 font-bold cursor-pointer"
              >
                ← Back to all posts
              </button>

              <div className="space-y-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border w-fit ${
                  isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-brand-sky/15 text-brand-sky border-brand-sky/20"
                }`}>
                  {activePost.category}
                </span>
                <h2 className={`text-xl sm:text-3xl font-black leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{activePost.title}</h2>
                <div className={`flex flex-wrap gap-4 text-[10px] font-mono ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                  <span className="flex items-center gap-1"><User size={12} /> {activePost.author}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {activePost.date}</span>
                </div>
              </div>

              {/* Tag links */}
              <div className="flex gap-2">
                {activePost.tags.map(t => (
                  <span key={t} className={`text-[9px] px-2 py-0.5 rounded border ${
                    isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-black/60 border-brand-dark-border text-gray-400"
                  }`}>#{t}</span>
                ))}
              </div>

              {/* Content */}
              <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line border-t border-b py-6 ${
                isLight ? "text-slate-700 border-slate-200" : "text-gray-300 border-brand-dark-border/60"
              }`}>
                {activePost.content}
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                <h3 className={`font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <MessageSquare size={16} />
                  Comments ({activePost.comments.length})
                </h3>

                <div className="space-y-4">
                  {activePost.comments.map((comm, idx) => (
                    <div key={idx} className={`p-4 rounded-xl space-y-1 border ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/60 border-brand-dark-border text-white"
                    }`}>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-sky-600 font-bold flex items-center gap-1">
                          <CornerDownRight size={12} />
                          {comm.author}
                        </span>
                        <span className={`font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>{comm.date}</span>
                      </div>
                      <p className={`text-xs leading-relaxed pl-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{comm.text}</p>
                    </div>
                  ))}
                  {activePost.comments.length === 0 && (
                    <p className={`text-[10px] italic ${isLight ? "text-slate-400" : "text-gray-600"}`}>No comments yet. Be the first to share your thoughts.</p>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={(e) => handleAddComment(e, activePost.id)} className={`p-4 rounded-xl space-y-3 border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-brand-dark-surface/80 border-brand-dark-border"
                }`}>
                  <h4 className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Join the Discussion</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                      className={`p-2.5 rounded-lg text-xs focus:outline-none transition border ${
                        isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write your feedback..."
                    value={commentForm.text}
                    onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })}
                    className={`w-full p-2.5 rounded-lg text-xs focus:outline-none resize-none transition border ${
                      isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Submit Comment
                  </button>
                </form>

              </div>

            </article>
          ) : (
            /* Blog list view */
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                    isLight
                      ? "bg-white border-slate-200 hover:border-sky-300 shadow-xs text-slate-900"
                      : "bg-brand-dark-surface/40 border-brand-dark-border hover:border-brand-sky/20 text-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-brand-sky/15 text-brand-sky border-brand-sky/20"
                      }`}>
                        {post.category}
                      </span>
                      <span className={`text-[10px] font-mono flex items-center gap-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                        <Calendar size={10} /> {post.date}
                      </span>
                    </div>

                    <h3 className={`text-lg font-black leading-tight transition cursor-pointer ${
                      isLight ? "text-slate-900 hover:text-sky-600" : "text-white hover:text-brand-sky"
                    }`} onClick={() => setActivePostId(post.id)}>
                      {post.title}
                    </h3>

                    <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>{post.summary}</p>
                  </div>

                  <div className={`flex items-center justify-between mt-6 pt-4 border-t ${
                    isLight ? "border-slate-100" : "border-brand-dark-border/40"
                  }`}>
                    <button
                      onClick={() => setActivePostId(post.id)}
                      className="inline-flex items-center gap-1.5 text-sky-600 font-bold text-xs hover:underline cursor-pointer"
                    >
                      Read Technical Article
                      <ArrowRight size={14} />
                    </button>
                    <span className={`text-[10px] flex items-center gap-1 font-mono ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                      <MessageSquare size={12} /> {post.comments.length} Comments
                    </span>
                  </div>
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className={`text-center py-12 rounded-2xl border ${
                  isLight ? "bg-white border-slate-200 text-slate-500" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-500"
                }`}>
                  <p className="text-xs italic">No articles found matching the filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <SiteFooter />
    </div>
  );
}
