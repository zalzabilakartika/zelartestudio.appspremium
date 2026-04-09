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
} from "lucide-react";

type ProductModalData = {
  subtitle: string;
  packages?: string[];
  benefits: string[];
  notes?: string[];
  warning?: string;
  guarantee: string;
  definition?: string;
};

type ProductVariant = {
  label: string;
  price: number;
};

type Product = {
  name: string;
  price: string;
  basePrice: number;
  hot: boolean;
  logoUrl: string;
  bg: string;
  variants?: ProductVariant[];
  modal: ProductModalData;
};

const PRODUCTS: Product[] = [
  {
    name: "Netflix Premium UHD",
    price: "Rp 35.000",
    basePrice: 35000,
    hot: true,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Netflix Premium Sharing 1P1U ✦",
      benefits: [
        "Login 1 Device.",
        "Plan Premium UHD 4K.",
        "OTP HH Fast -- Anti On-Hold.",
        "Bisa diperpanjang tiap bulan tanpa ganti akun.",
      ],
      notes: ["Bonus: Free YouTube & Music Premium"],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Vidio Premier Platinum",
    price: "Mulai Rp 25.000",
    basePrice: 48000,
    hot: true,
    logoUrl: "https://id.wikipedia.org/wiki/Special:FilePath/Logo_Vidio.png",
    bg: "bg-[#F8F8F8]",
    variants: [
      { label: "All Device", price: 48000 },
      { label: "Mobile / Tab", price: 30000 },
      { label: "Android TV 12 Bln", price: 25000 },
    ],
    modal: {
      subtitle: "Premier Platinum Private ✦",
      benefits: [
        "Vidio Original, Acara TV",
        "Film & Series Hollywood, Korea, Anime, Thai, dll.",
        "BRI Liga 1, UCL, La Liga, UEL, UECL.",
      ],
      notes: [
        "Screen: All Dev (2 active), Mobile/TV (1 active).",
        "Tips: Paket TV bisa di HP (via APK khusus) atau Emulator PC.",
      ],
      warning: "TIDAK BISA UNTUK NONTON EPL (English Premier League).",
      guarantee: "Vidio All Dev/Mobile Full Garansi. Paket TV No Garansi.",
      definition: "Platinum tidak termasuk tayangan Express.",
    },
  },
  {
    name: "Google One - AI Pro",
    price: "Rp 28.000",
    basePrice: 28000,
    hot: true,
    logoUrl:
      "https://id.wikipedia.org/wiki/Special:FilePath/Google_One_logo.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Familiy Member ✦",
      benefits: [
        "YouTube & Music Premium Included.",
        "5TB Storage (Photos, Drive, Gmail).",
        "Access to Gemini 3 Pro | Veo 3.1 | Lyria.",
        "Analysis up to 1.5K Pages of Files.",
        "Unlimited Google Meet Duration.",
        "Limit ekstra di NotebookLM.",
        "1000 AI Credits.",
      ],
      notes: [
        "System: Via Invite (Pakai akun pribadimu).",
        "Verif: Akses Gemini Pro wajib verifikasi usia 18+ (Akun Old biasanya aman).",
      ],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Microsoft 365",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Microsoft_365_(2022).svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Family Member ✦",
      benefits: [
        "1 TB Storage OneDrive & Outlook.",
        "Copilot 365 (Word, Excel, PPT, Outlook, Edge).",
        "Word, PowerPoint, OneNote, Designer, Clipchamp.",
        "Unlock All Software on Windows/Mac/iOS/Android.",
        "Bisa perpanjangan tiap bulan di akun yang sama tanpa kenak limit.",
      ],
      notes: ["System: Via Invite (Pakai akun pribadimu)."],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "YouTube & Music Premium",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: true,
    logoUrl:
      "https://id.wikipedia.org/wiki/Special:FilePath/YouTube_Logo_2017.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Youtube Family Member ✦",
      benefits: [
        "YouTube Premium & YouTube Music.",
        "Bebas iklan & Background Play.",
        "Download & Offline Play.",
      ],
      notes: [
        "System: Via Invite (Pakai akun pribadimu).",
        "Privacy: Hanya berbagi benefit, riwayat tontonan tetap pribadi.",
      ],
      warning:
        "Tidak bisa tumpuk durasi. Order lagi bulan depan untuk perpanjang.",
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Canva Pro",
    price: "Rp 3.000",
    basePrice: 3000,
    hot: true,
    logoUrl: "https://en.wikipedia.org/wiki/Special:FilePath/Canva_Logo.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Member Pro ✦",
      benefits: [
        "Privasi aman, team hanya berbagi features, tidak berbagi desain by default",
        "Akses semua fitur & aset Pro premium.",
      ],
      notes: ["Note: Member wajib tulis email Canva setelah pembayaran."],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Adobe Creative Cloud",
    price: "Mulai Rp 45.000",
    basePrice: 45000,
    hot: true,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Adobe_Creative_Cloud_rainbow_icon.svg",
    bg: "bg-[#F8F8F8]",
    variants: [
      { label: "1 Bulan", price: 45000 },
      { label: "4 Bulan", price: 140000 },
    ],
    modal: {
      subtitle: "Private Account ✦",
      benefits: [
        "100% Original & Aktivasi Cepat.",
        "Photo & Design: Photoshop, Lightroom, Illustrator.",
        "Video & Motion: Premiere Pro, After Effects.",
        "Layout & PDF: InDesign, Acrobat.",
        "Dan puluhan aplikasi Adobe lainnya.",
      ],
      notes: [
        "Device & Account: Bisa dipakai di Laptop/Mac maupun Smartphone. Khusus paket 4 Bulan, aktivasi bisa langsung menggunakan akun pribadimu.",
      ],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Amazon Prime Video",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: false,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Prime Video Private ✦",
      benefits: [
        "Private Account dari kami (Bukan Sharing).",
        "Kualitas Video 1080p HD.",
        "Akses Series & Movie Eksklusif.",
      ],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "CapCut Pro",
    price: "Mulai Rp 10.000",
    basePrice: 10000,
    hot: true,
    logoUrl: "https://id.wikipedia.org/wiki/Special:FilePath/CapCut_logo.png",
    bg: "bg-[#F8F8F8]",
    variants: [
      { label: "7 Hari", price: 10000 },
      { label: "1 Bulan", price: 20000 },
    ],
    modal: {
      subtitle: "Capcut Pro Private ✦",
      benefits: [
        "Akses semua fitur, efek, & font Pro.",
        "Android/Desktop bisa login 2-3 device",
        "IOS hanya bisa login 1 device, jangan login di device lain, nanti kenak limit",
      ],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Apple Music",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_Music_logo.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Family Member ✦",
      benefits: [
        "Audio Lossless & Dolby Atmos.",
        "Lebih dari 100 juta lagu tanpa iklan.",
        "Listen Offline & Lyrics.",
      ],
      notes: ["System: Via Invite (Pakai akun pribadimu)."],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Disney+ Hotstar",
    price: "Rp 28.000",
    basePrice: 28000,
    hot: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Disney%2B_Hotstar_2024.svg",
    bg: "bg-[#F8F8F8]",
    modal: {
      subtitle: "Disney+ Hotstar Sharing ✦",
      benefits: [
        "Akun sharing dari kami (Bukan Private).",
        "Login 1 device only.",
        "Plan Premium 4K UHD.",
        "Akses Series & Movie Eksklusif.",
      ],
      guarantee: "Full Garansi - Legal Bill Indonesia.",
    },
  },
];

export default function Home() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isOpenTimer, setIsOpenTimer] = useState(true);
  const [showClosedError, setShowClosedError] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [checkoutData, setCheckoutData] = useState<{
    name: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    const checkTime = () => {
      // OVERRIDDEN: Developer testing (force True)
      // const hour = new Date().getHours();
      // setIsOpenTimer(hour >= 11 && hour < 21);
      setIsOpenTimer(true);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Open product modal and atomically reset variant selection
  const openProductModal = (prod: Product) => {
    setSelectedVariantIdx(0);
    setSelectedProduct(prod);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = () => {
    if (!isOpenTimer) {
      setShowClosedError(true);
      return;
    }
    setHasEntered(true);
    setTimeout(() => {
      document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Derived price & name that react to variant selection
  const currentVariantPrice = selectedProduct
    ? selectedProduct.variants
      ? (selectedProduct.variants[selectedVariantIdx]?.price ??
        selectedProduct.basePrice)
      : selectedProduct.basePrice
    : 0;

  const currentProductName = selectedProduct
    ? selectedProduct.variants
      ? `${selectedProduct.name} - ${selectedProduct.variants[selectedVariantIdx]?.label ?? ""}`
      : selectedProduct.name
    : "";

  return (
    <main
      className={`relative ${!hasEntered ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"}`}
    >
      {/* Minimalist Top Nav removed — moved into FloatingTracker */}

      <SplashMist />
      <FloatingTracker isVisible={hasEntered} />

      {/* ========== ENTRANCE (PHASE 1) ========== */}
      <section
        id="intro"
        className="min-h-[100dvh] flex flex-col items-center justify-center relative px-6 sticky top-0 z-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full px-4"
        >
          <h1 className="font-serif text-3xl md:text-5xl lg:text-[3vw] xl:text-[3vw] tracking-[0.10em] md:tracking-[0.15em] lg:tracking-[0.2em] xl:tracking-[0.25em] text-[#1A1A1A] dark:text-white font-light uppercase leading-[1.3] md:leading-[1.4]">
            <span className="block whitespace-nowrap">READY FOR YOUR</span>
            <span className="block whitespace-nowrap mt-1 md:mt-2">
              PREMIUM APPS TODAY?
            </span>
          </h1>

          <p className="mt-8 md:mt-12 text-[0.55rem] md:text-[0.65rem] text-gray-400 dark:text-gray-300 tracking-[0.3em] font-sans uppercase">
            Explore The Collection <span className="ml-1 text-gray-300 dark:text-gray-400">✦</span>
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16 md:mt-24">
            <button
              onClick={handleOpen}
              className={`px-10 py-3 text-[0.65rem] tracking-[0.25em] font-medium uppercase border transition-colors duration-500 ${
                showClosedError
                  ? "border-[#1A1A1A]/20 text-[#1A1A1A]/40 cursor-not-allowed bg-transparent"
                  : "border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white/10 cursor-pointer"
              }`}
            >
              {showClosedError ? "CLOSED" : "OPEN"}
            </button>
            <span className="text-[0.65rem] text-gray-400 dark:text-gray-300 tracking-widest font-sans uppercase">
              11.00 AM — 09.00 PM
            </span>
          </div>
        </motion.div>
      </section>

      <div className="relative z-10 bg-[#F8F8F8] dark:bg-[#090909] shadow-[0_-20px_60px_rgba(0,0,0,0.03)] dark:shadow-[0_-20px_60px_rgba(255,255,255,0.04)]">
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
              className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-12 bg-[#1A1A1A]/10 border border-[#1A1A1A]/10"
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
                  text: "1 - 15 Menit Process",
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
              PROSES OTOMATIS: Pesanan diproses setelah bukti transfer dikirim.
              Estimasi: 1 - 120 menit.
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
                  desc: "Pilih layanan digital premium favoritmu di katalog kami.",
                },
                {
                  icon: <CreditCard size={24} strokeWidth={0.5} />,
                  title: "2. Payment",
                  desc: "Selesaikan pembayaran melalui payment gateway kami yang aman.",
                },
                {
                  icon: <MessageSquare size={24} strokeWidth={0.5} />,
                  title: "3. Confirm",
                  desc: "Kirim bukti ke WhatsApp. Akses premium akan siap dalam 1-15 menit.",
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
          className="min-h-screen px-6 py-24 border-t border-[#1A1A1A]/5 flex items-center justify-center"
        >
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {PRODUCTS.map((prod, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="w-full h-[460px] flex flex-col bg-white dark:bg-[#111] border border-[#E5E7EB]/70 dark:border-[#333] transition-all duration-500 group relative"
              >
                {/* Invisible overlay button over the image area */}
                <button
                  onClick={() => openProductModal(prod)}
                  className="absolute inset-0 w-full h-[300px] z-20 cursor-pointer"
                />

                {/* Logo Container */}
                <div
                  className={`w-full h-[220px] relative shrink-0 ${prod.bg} flex items-center justify-center bg-[#F8F8F8] dark:bg-[#111] border-b border-[#E5E7EB]/50 dark:border-[#333] overflow-hidden`}
                >
                  <img
                    src={prod.logoUrl}
                    alt={prod.name}
                    className="w-[50%] h-[50%] object-contain opacity-70 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="p-8 flex-1 flex flex-col items-center justify-between text-center relative z-10">
                  <div>
                    <h3 className="font-serif text-sm md:text-base tracking-[0.25em] mb-4 uppercase text-black dark:text-white font-medium">
                      {prod.name}
                    </h3>
                    <div className="font-sans text-[0.65rem] md:text-xs mb-6 flex items-center justify-center gap-2 text-black dark:text-gray-300 tracking-[0.2em] uppercase font-medium">
                      {prod.price}{" "}
                      {prod.hot && (
                        <span className="text-black dark:text-gray-300 text-[0.60rem]">✦</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full flex-col flex items-center gap-5 mt-auto">
                    <button
                      onClick={() => openProductModal(prod)}
                      className="text-[0.55rem] tracking-[0.25em] uppercase font-sans text-gray-400 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-black/20 dark:after:bg-white/20 hover:after:bg-black"
                    >
                      VIEW DETAILS
                    </button>

                    <button
                      onClick={() => openProductModal(prod)}
                      className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] dark:border-[#ffffff30] dark:text-white text-[0.65rem] tracking-[0.2em] font-medium hover:bg-[#1A1A1A] dark:hover:bg-white/10 hover:text-white transition-colors duration-500 uppercase"
                    >
                      CONFIRM PAYMENT
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
            </div>
          </div>
        </section>

        {/* Checkout hero removed as requested */}
      </div>

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
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />

            {/* Modal Card */}
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

              {/* App Logo */}
              <div className="w-full flex items-center justify-center border-b border-[#1A1A1A]/5 dark:border-[#333] py-12 bg-[#F8F8F8] dark:bg-[#111]">
                <img
                  src={selectedProduct.logoUrl}
                  alt={selectedProduct.name}
                  className="h-16 w-16 object-contain grayscale opacity-80"
                />
              </div>

              <div className="px-8 md:px-14 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <h2 className="font-serif font-light text-2xl md:text-3xl tracking-[0.15em] text-[#1A1A1A] dark:text-white uppercase mb-4">
                    {selectedProduct.name}
                  </h2>
                  <div className="font-sans text-[0.65rem] text-[#1A1A1A]/50 dark:text-[#d4d4d4] tracking-[0.25em] uppercase font-medium">
                    {selectedProduct.modal.subtitle.replace(" ✦", "")}
                  </div>
                </div>

                {/* Legacy Packages (only for products without a variants array) */}
                {selectedProduct.modal.packages &&
                  selectedProduct.modal.packages.length > 0 &&
                  !selectedProduct.variants && (
                    <div className="flex flex-col gap-3 mb-10">
                      <p className="font-serif text-[0.65rem] tracking-[0.25em] uppercase text-[#1A1A1A]/60 mb-1">
                        AVAILABLE PACKAGES
                      </p>
                      {selectedProduct.modal.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="font-sans font-light text-[0.8rem] md:text-sm text-[#1A1A1A] dark:text-[#f8f8f8] bg-[#FBFBFB] dark:bg-[#111] border border-[#1A1A1A]/10 dark:border-[#333] px-5 py-4"
                        >
                          {pkg}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Benefits */}
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

                {/* Notes */}
                {selectedProduct.modal.notes &&
                  selectedProduct.modal.notes.length > 0 && (
                    <div className="border border-[#1A1A1A]/10 dark:border-[#333] px-6 py-5 mb-10 bg-[#FBFBFB] dark:bg-[#111]">
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

                {/* Warning */}
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

                {/* ——— VARIANT SELECTOR ——— */}
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
                            className={`px-5 py-2.5 text-[0.58rem] tracking-[0.2em] font-sans font-medium uppercase border transition-colors duration-200 ${
                              selectedVariantIdx === idx
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-white text-[#1A1A1A] dark:bg-[#111] dark:text-[#f8f8f8] border-[#1A1A1A]/30 dark:border-[#333] hover:border-[#1A1A1A]"
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* ——— DYNAMIC PRICE DISPLAY ——— */}
                <div className="border-y border-[#1A1A1A]/10 py-6 mb-8 text-center">
                  <p className="font-sans text-[0.48rem] tracking-[0.35em] text-[#1A1A1A]/35 dark:text-[#d4d4d4] uppercase mb-2">
                    TOTAL
                  </p>
                  <motion.p
                    key={currentVariantPrice}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-[#1A1A1A] dark:text-white font-light"
                  >
                    Rp {currentVariantPrice.toLocaleString("id-ID")}
                  </motion.p>
                </div>

                {/* ——— CONFIRM PAYMENT BUTTON ——— */}
                <button
                  onClick={() => {
                    setCheckoutData({
                      name: currentProductName,
                      price: currentVariantPrice,
                    });
                    setSelectedProduct(null);
                  }}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-black/80 transition-colors duration-300 mb-10"
                >
                  CONFIRM PAYMENT
                </button>

                {/* Footer Guarantee */}
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
