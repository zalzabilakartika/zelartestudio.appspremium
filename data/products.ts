export type ProductModalData = {
  subtitle: string;
  packages?: string[];
  benefits: string[];
  notes?: string[];
  warning?: string;
  guarantee: string;
  definition?: string;
};

export type ProductVariant = {
  label: string;
  price: number;
};

export type Product = {
  name: string;
  price: string;
  basePrice: number;
  hot: boolean;
  outOfStock?: boolean;
  logoUrl: string;
  bg: string;
  category: "streaming" | "productivity" | "creative";
  variants?: ProductVariant[];
  modal: ProductModalData;
};

// ─── STREAMING ──────────────────────────────────────────────────────────────────

const STREAMING: Product[] = [
  {
    name: "Netflix Premium UHD",
    price: "Rp 35.000",
    basePrice: 35000,
    hot: true,
    outOfStock: false,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
    outOfStock: false,
    logoUrl: "https://id.wikipedia.org/wiki/Special:FilePath/Logo_Vidio.png",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
    name: "YouTube & Music Premium",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: true,
    outOfStock: false,
    logoUrl:
      "https://id.wikipedia.org/wiki/Special:FilePath/YouTube_Logo_2017.svg",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
    name: "Amazon Prime Video",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: false,
    outOfStock: false,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
    name: "Disney+ Hotstar",
    price: "Rp 28.000",
    basePrice: 28000,
    hot: false,
    outOfStock: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Disney%2B_Hotstar_2024.svg",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
  {
    name: "Apple Music",
    price: "Rp 10.000",
    basePrice: 10000,
    hot: false,
    outOfStock: false,
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg",
    bg: "bg-[#F8F8F8]",
    category: "streaming",
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
];

// ─── PRODUCTIVITY ───────────────────────────────────────────────────────────────

const PRODUCTIVITY: Product[] = [
  {
    name: "Google One - AI Pro",
    price: "Rp 28.000",
    basePrice: 28000,
    hot: true,
    outOfStock: false,
    logoUrl:
      "https://id.wikipedia.org/wiki/Special:FilePath/Google_One_logo.svg",
    bg: "bg-[#F8F8F8]",
    category: "productivity",
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
    outOfStock: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Microsoft_365_(2022).svg",
    bg: "bg-[#F8F8F8]",
    category: "productivity",
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
  
];

// ─── CREATIVE ───────────────────────────────────────────────────────────────────

const CREATIVE: Product[] = [
  {
    name: "Canva Pro",
    price: "Rp 3.000",
    basePrice: 3000,
    hot: true,
    outOfStock: false,
    logoUrl: "https://en.wikipedia.org/wiki/Special:FilePath/Canva_Logo.svg",
    bg: "bg-[#F8F8F8]",
    category: "creative",
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
    outOfStock: false,
    logoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Adobe_Creative_Cloud_rainbow_icon.svg",
    bg: "bg-[#F8F8F8]",
    category: "creative",
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
    name: "CapCut Pro",
    price: "Mulai Rp 10.000",
    basePrice: 10000,
    hot: true,
    outOfStock: false,
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Capcut-icon.png",
    bg: "bg-[#F8F8F8]",
    category: "creative",
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
    name: "Meitu Private Account-Limited Stock",
    price: "Rp 20.000",
    basePrice: 20000,
    hot: true,
    outOfStock: false,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/c3/Meitu.svg",
    bg: "bg-[#F8F8F8]",
    category: "creative",
    modal: {
      subtitle: "Meitu Private 21 Days ✦",
      benefits: [
        "Akun Private dari kami",
        "Login 1 device",
        "Unlocked VIP+Package",
      ],
      guarantee: "Full Garansi.",
    },
  },
  {
    name: "Meitu Private Account-Limited Stock",
    price: "Rp 1.000",
    basePrice: 1000,
    hot: true,
    outOfStock: false,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/c3/Meitu.svg",
    bg: "bg-[#F8F8F8]",
    category: "creative",
    modal: {
      subtitle: "Meitu Private 21 Days ✦",
      benefits: [
        "Akun Private dari kami",
        "Login 1 device",
        "Unlocked VIP+Package",
      ],
      guarantee: "Full Garansi.",
    },
  },
];

// ─── CATEGORY CONFIG ────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { key: "streaming" as const, label: "Streaming" },
  { key: "productivity" as const, label: "Productivity" },
  { key: "creative" as const, label: "Creative" },
];

export const PRODUCTS: Product[] = [...STREAMING, ...PRODUCTIVITY, ...CREATIVE];

export function getProductsByCategory(category: Product["category"]): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}
