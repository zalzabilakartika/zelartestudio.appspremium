"use client";

import SplashMist from "@/components/SplashMist";
import FloatingTracker from "@/components/FloatingTracker";
import CheckoutModal from "@/components/CheckoutModal";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Check,
  Clock,
  Wallet,
  Zap,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  getProductsByCategory,
} from "@/data/products";
import type { Product } from "@/data/products";

export default function Home() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkoutData, setCheckoutData] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "all" | Product["category"]
  >("all");

  const openProductModal = (prod: Product) => {
    setSelectedVariantIdx(0);
    setCurrentImageIndex(0);
    setSelectedProduct(prod);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : getProductsByCategory(activeCategory);

  const currentVariantPrice = selectedProduct
    ? selectedProduct.variants
      ? (selectedProduct.variants[selectedVariantIdx]?.price ??
        selectedProduct.originalPrice)
      : (selectedProduct.discountPrice ?? selectedProduct.originalPrice)
    : 0;

  const currentProductName = selectedProduct
    ? selectedProduct.variants
      ? `${selectedProduct.name} - ${selectedProduct.variants[selectedVariantIdx]?.label ?? ""}`
      : selectedProduct.name
    : "";

  return (
    <main className="relative min-h-screen overflow-clip flex flex-col">
      <SplashMist />
      <FloatingTracker />

      {/* ========== STICKY TOP BARS ========== */}
      <div className="sticky top-0 z-[100] w-full flex flex-col">
        {/* Announcement Bar */}
        <div className="w-full overflow-hidden h-8 bg-[#FDFBF7]/80 dark:bg-black/40 backdrop-blur-md border-b border-rose-200/20 flex items-center">
           <div className="animate-marquee whitespace-nowrap flex w-max">
             {[...Array(2)].map((_, idx) => (
               <div key={idx} className="flex gap-4 items-center pr-4">
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">PAYDAY SALE 5.5 IS COMING! EXCLUSIVE DIGITAL DEALS AHEAD.</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">-</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">PAYDAY SALE 5.5 IS COMING! EXCLUSIVE DIGITAL DEALS AHEAD.</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">-</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">PAYDAY SALE 5.5 IS COMING! EXCLUSIVE DIGITAL DEALS AHEAD.</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">-</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">PAYDAY SALE 5.5 IS COMING! EXCLUSIVE DIGITAL DEALS AHEAD.</span>
                 <span className="text-[10px] md:text-xs tracking-widest uppercase text-[#1A1A1A]/80 dark:text-white/80 font-medium">-</span>
               </div>
             ))}
           </div>
        </div>

        {/* ========== MOBILE HEADER ========== */}
        <header className="md:hidden w-full bg-[#F8F8F8]/80 backdrop-blur-md dark:bg-[#090909]/80 border-b border-[#1A1A1A]/10 dark:border-white/10">
          <div className="h-16 flex items-center justify-center">
            <button
              onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-sans text-[0.60rem] tracking-[0.3em] text-[#1A1A1A]/70 dark:text-white/70 uppercase font-medium"
            >
              ZELARTE STUDIO
            </button>
          </div>
        </header>
      </div>

      {/* ========== ENTRANCE (PHASE 1) ========== */}
      <section
        id="intro"
        className="flex flex-col items-center justify-center w-full min-h-[calc(100dvh-96px)] relative px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full px-4"
        >
          <h1 className="font-serif text-[5.5vw] sm:text-[4vw] md:text-5xl lg:text-6xl tracking-[0.05em] min-[375px]:tracking-[0.08em] md:tracking-[0.15em] lg:tracking-[0.2em] xl:tracking-[0.25em] text-[#1A1A1A] dark:text-white font-light uppercase leading-snug text-center flex flex-col items-center">
            <span className="whitespace-nowrap">READY FOR YOUR</span>
            <span className="whitespace-nowrap">DIGITAL ESSENTIALS TODAY?</span>
          </h1>

          <p className="mt-6 md:mt-12 text-[1.8vw] sm:text-[1.6vw] md:text-[0.65rem] text-gray-400 dark:text-gray-300 tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] font-sans uppercase whitespace-nowrap text-center">
            PREMIUM APPS | DIGITAL PLANNERS | STICKERS & DECO | BUDGETING{" "}

          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16 md:mt-24">
            <button
              onClick={() =>
                document
                  .getElementById("rules")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-10 py-3.5 rounded-full border border-gray-900 text-gray-900 bg-transparent dark:border-white/50 dark:text-white dark:bg-transparent transition-all duration-300 ease-out active:scale-95 hover:bg-gray-900 hover:text-white active:bg-gray-900 active:text-white dark:hover:bg-white dark:hover:text-black dark:active:bg-white dark:active:text-black text-xs md:text-sm tracking-[0.2em] uppercase font-medium cursor-pointer"
            >
              EXPLORE
            </button>
            <span className="text-[0.65rem] text-gray-400 dark:text-gray-300 tracking-widest font-sans uppercase">
              11.00 AM — 08.00 PM
            </span>
          </div>
        </motion.div>
      </section>

      <div className="relative z-10 bg-transparent">
        {/* ========== THE GUIDE (PHASE 2 & 3) ========== */}
        <section
          id="rules"
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="max-w-4xl w-full">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="font-serif font-light text-xl md:text-2xl tracking-[0.25em] text-center mb-20 text-[#1A1A1A] dark:text-white uppercase"
            >
              The Guide
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-12 bg-[#1A1A1A]/10 dark:bg-white/10 border border-[#1A1A1A]/10 dark:border-white/10"
            >
              {[
                {
                  icon: <Clock size={14} strokeWidth={1} />,
                  text: "11.00 AM — 09.00 PM",
                },
                {
                  icon: <Wallet size={14} strokeWidth={1} />,
                  text: "Pemakaian / Resell",
                },
                {
                  icon: <Zap size={14} strokeWidth={1} />,
                  text: "1 - 120 Menit Process",
                },
                {
                  icon: <ShieldCheck size={14} strokeWidth={1} />,
                  text: "Full Guarantee (SnK)",
                },
              ].map((note, i) => (
                <div
                  key={i}
                  className="p-5 text-[0.65rem] md:text-xs flex flex-col items-center text-center gap-3 text-[#1A1A1A] dark:text-[#F8F8F8] tracking-wider font-light bg-[#F8F8F8] dark:bg-[#111]"
                >
                  <span className="opacity-50">{note.icon}</span>
                  {note.text}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center font-sans text-[0.60rem] md:text-xs font-semibold tracking-widest text-[#1A1A1A] dark:text-[#f8f8f8] mb-20 uppercase border-y border-[#1A1A1A]/10 dark:border-[#ffffff10] py-5 w-fit mx-auto px-8"
            >
              MANUAL PROCESS : Pesanan dikirim setelah konfirmasi pembayaran via WhatsApp.
              Estimasi antrean: 1 - 120 menit.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col md:flex-row gap-12 justify-between items-start relative"
            >
              <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-[#1A1A1A]/10 -z-10"></div>

              {[
                {
                  icon: <ShoppingBag size={24} strokeWidth={0.5} />,
                  title: "1. Select",
                  desc: "Pilih premium apps favoritmu dari katalog kami dan tentukan durasi subscription yang sesuai dengan kebutuhanmu.",
                },
                {
                  icon: <CreditCard size={24} strokeWidth={0.5} />,
                  title: "2. Payment",
                  desc: "Selesaikan transaksi dengan aman via automated payment gateway. Proses instan tanpa perlu transfer manual.",
                },
                {
                  icon: <MessageSquare size={24} strokeWidth={0.5} />,
                  title: "3. Claim",
                  desc: "Payment terverifikasi otomatis secara real-time. Klik tautan WhatsApp yang muncul untuk langsung mengklaim akses akunmu.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center text-center z-10 w-full relative group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F8F8F8] dark:bg-[#111] border border-[#1A1A1A]/10 dark:border-[#ffffff10] flex items-center justify-center mb-8 transition-transform duration-500 hover:scale-105">
                    <span className="text-[#1A1A1A] dark:text-[#f8f8f8] opacity-60">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="font-serif font-light uppercase tracking-[0.2em] text-lg text-[#1A1A1A] dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[0.70rem] text-gray-500 dark:text-gray-300 leading-[1.8] max-w-[220px] font-light">
                    {step.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ========== THE LOOKBOOK GRID (PHASE 4) ========== */}
        <section
          id="catalog"
          className="min-h-screen px-6 py-24 border-t border-[#1A1A1A]/5 dark:border-white/5"
        >
          <div className="max-w-5xl w-full mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="font-serif font-light text-xl md:text-2xl tracking-[0.25em] text-center mb-16 text-[#1A1A1A] dark:text-white uppercase"
            >
              Catalog
            </motion.h2>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-16">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 ease-out active:scale-95 text-[11px] md:text-xs tracking-widest uppercase font-sans border ${activeCategory === "all"
                  ? "bg-black text-white border-black font-semibold dark:bg-white dark:text-black dark:border-white dark:font-semibold"
                  : "bg-transparent border-gray-300 text-gray-500 dark:border-white/20 dark:text-white/60 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white font-medium"
                  }`}
              >
                All
              </button>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-6 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 ease-out active:scale-95 text-[11px] md:text-xs tracking-widest uppercase font-sans border ${activeCategory === cat.key
                    ? "bg-black text-white border-black font-semibold dark:bg-white dark:text-black dark:border-white dark:font-semibold"
                    : "bg-transparent border-gray-300 text-gray-500 dark:border-white/20 dark:text-white/60 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white font-medium"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-x-12 md:gap-y-16"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => (
                  <motion.article
                    key={prod.name}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={`w-full aspect-[2/3] md:aspect-auto h-full md:h-[460px] flex flex-col bg-white dark:bg-white/[0.02] backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 relative ${prod.outOfStock
                      ? "opacity-60 grayscale pointer-events-none"
                      : "group"
                      }`}
                  >
                    {!prod.outOfStock && (
                      <button
                        onClick={() => openProductModal(prod)}
                        className="absolute inset-0 w-full h-1/2 md:h-[300px] z-20 cursor-pointer"
                      />
                    )}

                    {prod.hot && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] md:text-[9px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-bl-lg rounded-tr-2xl md:rounded-tr-3xl z-30 pointer-events-none">
                        🔥 HOT!
                      </div>
                    )}

                    <div
                      className={`w-full h-1/2 md:h-[220px] p-6 md:pt-10 md:px-8 md:pb-0 relative shrink-0 flex items-center justify-center bg-transparent border-b border-transparent overflow-hidden`}
                    >
                      <img
                        src={prod.logoUrl}
                        alt={prod.name}
                        className="w-[60%] h-[60%] md:w-[50%] md:h-[50%] object-contain transition-all duration-700 opacity-100 grayscale-0 md:opacity-70 md:grayscale md:group-hover:scale-105 md:group-hover:opacity-100 md:group-hover:grayscale-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {prod.outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/50">
                          <span className="font-sans text-[0.45rem] md:text-[0.65rem] tracking-[0.2em] md:tracking-[0.3em] font-semibold uppercase text-[#1A1A1A]/70 dark:text-white/70 border border-[#1A1A1A]/30 dark:border-white/30 px-3 py-1.5 md:px-5 md:py-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="px-3 pb-5 md:pb-6 md:px-8 flex-1 flex flex-col items-center text-center relative z-10">
                      <div className="md:mt-10">
                        <h3 className="font-sans text-[13px] md:text-base leading-tight md:leading-normal tracking-[0.05em] md:tracking-[0.05em] mb-0.5 md:mb-4 normal-case text-gray-900 dark:text-white font-semibold">
                          {prod.name}
                        </h3>
                        <div className="font-sans text-[10px] md:text-xs leading-none md:leading-normal mt-1 mb-2 md:mb-6 flex flex-wrap items-center justify-center gap-1 md:gap-2 text-gray-600 dark:text-white/80 tracking-[0.1em] uppercase font-normal md:font-medium">
                          {prod.outOfStock ? (
                            <span className="text-[#1A1A1A]/40 dark:text-white/40 line-through">
                              {prod.price.replace(/Mulai\s*/gi, "")}
                            </span>
                          ) : (
                            <>
                              {prod.discountPrice ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-gray-500/50 dark:text-white/40 line-through">
                                    {prod.price.replace(/Mulai\s*/gi, "")}
                                  </span>
                                  <span className="text-rose-500 dark:text-rose-300 font-medium">
                                    Rp {prod.discountPrice.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ) : (
                                <span>{prod.price.replace(/Mulai\s*/gi, "")}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-full flex-col flex items-center justify-center gap-2 md:gap-5 mt-auto">
                        <button
                          disabled={prod.outOfStock}
                          onClick={() => !prod.outOfStock && openProductModal(prod)}
                          className={`w-[85%] md:w-[80%] mx-auto py-2 px-4 md:py-3 border rounded-full text-[10px] md:text-[0.65rem] tracking-[0.1em] md:tracking-[0.2em] font-medium transition-all duration-300 uppercase ${prod.outOfStock
                            ? "border-black/20 dark:border-white/20 text-gray-400 dark:text-white/30 cursor-not-allowed bg-transparent"
                            : "bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                            }`}
                        >
                          {prod.outOfStock ? "OUT OF STOCK" : "VIEW DETAILS"}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="w-full py-6 text-center text-xs tracking-widest text-[#1A1A1A]/50 dark:text-white/50 border-t border-[#1A1A1A]/10 dark:border-white/10">
        © 2026 ZELARTE STUDIO
      </footer>

      {/* ========== PRODUCT DETAILS MODAL ========== */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          >
            <div
              className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-white dark:bg-[#111] border border-[#1A1A1A]/10 dark:border-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_100px_rgba(255,255,255,0.05)] p-0 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 text-[#1A1A1A]/40 dark:text-[#f8f8f8]/40 hover:text-[#1A1A1A] dark:hover:text-white hover:rotate-90 hover:opacity-70 transition-all duration-300 z-10"
              >
                <X strokeWidth={0.5} size={36} />
              </button>

              <div className="w-full relative flex items-center justify-center border-b border-[#1A1A1A]/5 dark:border-[#333] bg-[#F8F8F8] dark:bg-[#111] overflow-hidden group min-h-[160px]">
                {selectedProduct.gallery && selectedProduct.gallery.length > 0 ? (
                  <>
                    <img
                      key={currentImageIndex}
                      src={selectedProduct.gallery[currentImageIndex]}
                      alt={`${selectedProduct.name} - slide ${currentImageIndex + 1}`}
                      className="w-full h-auto max-h-[400px] object-cover transition-opacity duration-500"
                    />

                    {/* Navigation Arrows */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? selectedProduct.gallery!.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-2 cursor-pointer hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === selectedProduct.gallery!.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-2 cursor-pointer hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {selectedProduct.gallery.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/30"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-12">
                    <img
                      src={selectedProduct.logoUrl}
                      alt={selectedProduct.name}
                      className="h-16 w-16 object-contain grayscale opacity-80"
                    />
                  </div>
                )}
              </div>

              <div className="px-8 md:px-14 py-12">
                <div className="text-center mb-10">
                  <h2 className="font-serif font-light text-2xl md:text-3xl tracking-[0.15em] text-[#1A1A1A] dark:text-white uppercase mb-4">
                    {selectedProduct.name}
                  </h2>
                  <div className="font-sans text-[0.65rem] text-[#1A1A1A]/50 dark:text-[#d4d4d4] tracking-[0.25em] uppercase font-medium">
                    {selectedProduct.modal.subtitle}
                  </div>
                </div>

                {selectedProduct.modal.packages &&
                  selectedProduct.modal.packages.length > 0 &&
                  !selectedProduct.variants && (
                    <div className="flex flex-col gap-3 mb-10">
                      <p className="font-serif text-[0.65rem] tracking-[0.25em] uppercase text-[#1A1A1A]/60 dark:text-[#d4d4d4] mb-1">
                        AVAILABLE PACKAGES
                      </p>
                      {selectedProduct.modal.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="font-sans font-light text-[0.8rem] md:text-sm text-[#1A1A1A] dark:text-[#f8f8f8] bg-[#FBFBFB] dark:bg-[#1a1a1a] border border-[#1A1A1A]/10 dark:border-[#333] px-5 py-4"
                        >
                          {pkg}
                        </div>
                      ))}
                    </div>
                  )}

                <div className="flex flex-col gap-4 mb-12">
                  {selectedProduct.modal.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <Check
                        size={16}
                        strokeWidth={1}
                        className="text-[#1A1A1A]/50 dark:text-[#f8f8f8]/60 mt-[0.1rem] shrink-0"
                      />
                      <span className="font-sans font-light text-sm text-[#1A1A1A] dark:text-[#f8f8f8] leading-relaxed tracking-[0.05em]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedProduct.modal.notes &&
                  selectedProduct.modal.notes.length > 0 && (
                    <div className="border border-[#1A1A1A]/10 dark:border-[#333] px-6 py-5 mb-10 bg-[#FBFBFB] dark:bg-[#1a1a1a]">
                      {selectedProduct.modal.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="font-sans font-light text-[0.75rem] text-[#1A1A1A]/80 dark:text-[#d4d4d4] tracking-wider mb-2 last:mb-0 leading-relaxed"
                        >
                          {note}
                        </div>
                      ))}
                    </div>
                  )}

                {selectedProduct.modal.warning && (
                  <div className="border border-[#1A1A1A] dark:border-[#444] p-4 text-center mb-10">
                    <p className="font-sans font-bold text-[0.60rem] tracking-[0.25em] text-[#1A1A1A] dark:text-[#f8f8f8] uppercase">
                      {selectedProduct.modal.warning
                        .replace("‼️ PENTING: ", "")
                        .replace("‼️ Warning: ", "")
                        .replace("‼️ ", "")}
                    </p>
                  </div>
                )}

                {selectedProduct.variants &&
                  selectedProduct.variants.length > 0 && (
                    <div className="mb-8">
                      <p className="font-serif text-[0.60rem] tracking-[0.25em] uppercase text-[#1A1A1A]/50 dark:text-[#d4d4d4] mb-5">
                        SELECT OPTION
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedProduct.variants.map((v, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedVariantIdx(idx)}
                            className={`px-5 py-2.5 text-[0.58rem] tracking-[0.2em] font-sans font-medium uppercase border transition-colors duration-200 ${selectedVariantIdx === idx
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-white dark:text-black dark:border-white"
                              : "bg-white text-[#1A1A1A] dark:bg-[#111] dark:text-[#f8f8f8] border-[#1A1A1A]/30 dark:border-[#333] hover:border-[#1A1A1A] dark:hover:border-white/50"
                              }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="border-y border-[#1A1A1A]/10 dark:border-[#333] py-6 mb-8 text-center">
                  <p className="font-sans text-[0.48rem] tracking-[0.35em] text-[#1A1A1A]/35 dark:text-[#d4d4d4] uppercase mb-2">
                    TOTAL
                  </p>
                  <motion.div
                    key={currentVariantPrice}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4"
                  >
                    {selectedProduct.discountPrice && !selectedProduct.variants ? (
                      <>
                        <p className="font-serif text-xl md:text-2xl tracking-[0.08em] text-[#1A1A1A]/40 dark:text-white/40 font-light line-through">
                          Rp {selectedProduct.originalPrice.toLocaleString("id-ID")}
                        </p>
                        <p className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-rose-500 dark:text-rose-300 font-light">
                          Rp {currentVariantPrice.toLocaleString("id-ID")}
                        </p>
                      </>
                    ) : (
                      <p className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-[#1A1A1A] dark:text-white font-light">
                        Rp {currentVariantPrice.toLocaleString("id-ID")}
                      </p>
                    )}
                  </motion.div>
                </div>

                <button
                  disabled={selectedProduct.outOfStock}
                  onClick={() => {
                    if (selectedProduct.outOfStock) return;
                    setCheckoutData({
                      name: currentProductName,
                      price: currentVariantPrice,
                    });
                    setSelectedProduct(null);
                  }}
                  className={`w-full py-4 text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase transition-colors duration-300 mb-10 ${selectedProduct.outOfStock
                    ? "bg-[#1A1A1A]/20 dark:bg-white/20 text-[#1A1A1A]/40 dark:text-white/40 cursor-not-allowed"
                    : "bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90"
                    }`}
                >
                  {selectedProduct.outOfStock ? "OUT OF STOCK" : "CONFIRM PAYMENT"}
                </button>

                <div className="border-t border-[#1A1A1A]/10 dark:border-[#333] pt-10 text-center">
                  <p className="font-serif text-[0.75rem] tracking-[0.25em] uppercase text-[#1A1A1A] dark:text-white mb-3">
                    Guaranteed Excellence
                  </p>
                  <p className="font-sans font-light text-[0.70rem] text-[#1A1A1A]/60 dark:text-[#d4d4d4] tracking-widest">
                    {selectedProduct.modal.guarantee}
                  </p>

                  {selectedProduct.modal.definition && (
                    <p className="font-serif italic text-[0.65rem] text-[#1A1A1A]/40 dark:text-[#d4d4d4]/70 tracking-wider mt-8">
                      — {selectedProduct.modal.definition}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== CHECKOUT MODAL ========== */}
      <AnimatePresence>
        {checkoutData && (
          <CheckoutModal
            productName={checkoutData.name}
            price={checkoutData.price}
            onClose={() => setCheckoutData(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
