"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink, MessageCircle } from "lucide-react";

// ─── FloatingInput ─────────────────────────────────────────────────────────────

type FloatingInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
};

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative pb-1 mb-8">
      <label
        className={`absolute left-0 font-sans tracking-[0.2em] uppercase transition-all duration-300 pointer-events-none ${
          isFloating
            ? "top-0 text-[0.48rem] text-[#1A1A1A]/50 dark:text-white/50"
            : "top-4 text-[0.62rem] text-[#1A1A1A]/35 dark:text-white/35"
        }`}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-transparent border-none outline-none font-sans text-sm text-[#1A1A1A] dark:text-white tracking-wide pt-5 pb-2"
      />

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1A1A1A]/15 dark:bg-white/15">
        <div
          className={`h-full bg-[#1A1A1A] dark:bg-white transition-transform duration-300 origin-left ${
            isFocused ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </div>
    </div>
  );
}

// ─── CheckoutModal ─────────────────────────────────────────────────────────────

type CheckoutModalProps = {
  productName: string;
  price: number;
  onClose: () => void;
};

export default function CheckoutModal({
  productName,
  price,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [amountUnique, setAmountUnique] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sheetsLoggedRef = useRef(false);

  useEffect(() => {
    if (!qrString) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    import("qrcode")
      .then((QR) =>
        QR.default.toDataURL(qrString, {
          width: 260,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [qrString]);

  const handleGenerateInvoice = async () => {
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setError("Mohon lengkapi semua field.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          product_name: productName,
          amount: price,
        }),
      });

      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server mengembalikan response tidak valid.");
      }

      if (!res.ok) {
        const detail =
          typeof data.detail === "string" ? data.detail : "";
        const msg =
          typeof data.error === "string" ? data.error : "Terjadi kesalahan.";
        throw new Error(detail ? `${msg} — ${detail}` : msg);
      }

      if (typeof data.id !== "string") {
        throw new Error("Response tidak lengkap dari payment service.");
      }

      const pUrl =
        typeof data.payment_url === "string" ? data.payment_url : null;
      const qStr =
        typeof data.qr_string === "string" ? data.qr_string : null;
      const qImg =
        typeof data.qr_image_url === "string" ? data.qr_image_url : null;

      if (!pUrl && !qStr && !qImg) {
        throw new Error("Tidak ada tautan pembayaran atau QR dari payment service.");
      }

      setInvoiceId(data.id);
      setPaymentUrl(pUrl);
      setQrString(qStr);
      setQrImageUrl(qImg);
      setInvoiceNumber(
        typeof data.invoice_number === "string" ? data.invoice_number : null
      );
      setAmountUnique(
        typeof data.amount_unique === "number" ? data.amount_unique : null
      );
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [pollStatus, setPollStatus] = useState<string>("");
  const failCountRef = useRef(0);

  useEffect(() => {
    if (step !== 2 || !invoiceId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/status?id=${encodeURIComponent(invoiceId)}`
        );
        if (!res.ok || cancelled) return;
        const d = (await res.json()) as Record<string, unknown>;
        if (cancelled) return;
        if (typeof d.qr_string === "string" && d.qr_string.length > 0) {
          setQrString((prev) => prev ?? d.qr_string as string);
        }
        if (typeof d.qr_image_url === "string" && d.qr_image_url.length > 0) {
          setQrImageUrl((prev) => prev ?? (d.qr_image_url as string));
        }
        if (typeof d.payment_url === "string" && d.payment_url.length > 0) {
          setPaymentUrl((prev) => prev ?? (d.payment_url as string));
        }
      } catch {
        /* ignore enrichment errors */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, invoiceId]);

  const logPaidToSheets = useCallback((id: string) => {
    if (sheetsLoggedRef.current) return;
    sheetsLoggedRef.current = true;
    void fetch("/api/checkout/log-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: id,
        product_name: productName,
      }),
    }).catch(() => {
      sheetsLoggedRef.current = false;
    });
  }, [productName]);

  useEffect(() => {
    if (step !== 2 || !invoiceId) return;

    failCountRef.current = 0;
    const maxConsecutiveFailures = 10;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/checkout/status?id=${encodeURIComponent(invoiceId)}`
        );
        if (!res.ok) {
          failCountRef.current++;
          if (failCountRef.current >= maxConsecutiveFailures) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPollStatus("error");
          }
          return;
        }

        const data = await res.json();
        failCountRef.current = 0;

        if (data.status === "paid") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          logPaidToSheets(invoiceId);
          setStep(3);
        } else if (data.status === "expired") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPollStatus("expired");
        }
      } catch {
        failCountRef.current++;
        if (failCountRef.current >= maxConsecutiveFailures) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPollStatus("error");
        }
      }
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, invoiceId, logPaidToSheets]);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const step3Variants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, x: -20 },
  };

  const hasInlineQr = Boolean(qrDataUrl || qrImageUrl);
  const displayAmount =
    amountUnique != null ? amountUnique : price;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md bg-white dark:bg-[#111] border border-[#1A1A1A]/10 dark:border-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.06)] dark:shadow-[0_40px_100px_rgba(255,255,255,0.04)] max-h-[90vh] overflow-y-auto"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 text-[#1A1A1A]/40 dark:text-white/40 hover:text-[#1A1A1A] dark:hover:text-white hover:rotate-90 transition-all duration-300"
        >
          <X strokeWidth={0.5} size={32} />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="px-8 md:px-12 pt-12 pb-10"
            >
              <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 dark:text-white/40 uppercase mb-2">
                Checkout
              </p>
              <h2 className="font-serif font-light text-base tracking-[0.1em] text-[#1A1A1A] dark:text-white uppercase leading-relaxed">
                {productName}
              </h2>
              <p className="font-sans text-[0.65rem] tracking-[0.2em] text-[#1A1A1A]/60 dark:text-white/50 mt-1 uppercase mb-10">
                — Rp {price.toLocaleString("id-ID")}
              </p>

              <FloatingInput
                label="Full Name"
                value={name}
                onChange={setName}
              />
              <FloatingInput
                label="Email Address"
                value={email}
                onChange={setEmail}
                type="email"
              />
              <FloatingInput
                label="WhatsApp Number"
                value={whatsapp}
                onChange={setWhatsapp}
                type="tel"
              />

              {error && (
                <p className="font-sans text-[0.60rem] tracking-[0.15em] text-red-500 mb-6 -mt-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerateInvoice}
                disabled={isLoading}
                className="w-full py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-black/80 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="px-8 md:px-12 pt-12 pb-10"
            >
              <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 dark:text-white/40 uppercase mb-2">
                Step 2 of 2
              </p>
              <h2 className="font-serif font-light text-lg tracking-[0.15em] text-[#1A1A1A] dark:text-white uppercase mb-6">
                Complete Your Payment
              </h2>

              <div className="border border-[#1A1A1A]/10 dark:border-[#333] p-6 mb-6 text-center bg-[#FBFBFB] dark:bg-[#1a1a1a]">
                <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 dark:text-white/40 uppercase mb-2">
                  {invoiceNumber ? "Invoice" : "Reference"}
                </p>
                <p className="font-sans text-sm tracking-[0.1em] text-[#1A1A1A] dark:text-white break-all">
                  {invoiceNumber ?? invoiceId}
                </p>
                <p className="font-sans text-[0.55rem] tracking-[0.2em] text-[#1A1A1A]/50 dark:text-white/45 uppercase mt-4">
                  Total bayar
                </p>
                <p className="font-serif text-xl tracking-[0.08em] text-[#1A1A1A] dark:text-white font-light mt-1">
                  Rp {displayAmount.toLocaleString("id-ID")}
                </p>
              </div>

              {hasInlineQr && (
                <div className="mb-6 flex flex-col items-center">
                  <p className="font-sans text-[0.52rem] tracking-[0.25em] text-[#1A1A1A]/45 dark:text-white/45 uppercase mb-4 text-center">
                    Scan QRIS
                  </p>
                  <div className="rounded-lg border border-[#1A1A1A]/10 dark:border-[#333] bg-white p-4 shadow-sm">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QRIS"
                        width={260}
                        height={260}
                        className="w-[220px] h-[220px] md:w-[260px] md:h-[260px]"
                      />
                    ) : qrImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrImageUrl}
                        alt="QRIS"
                        width={260}
                        height={260}
                        className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="font-sans text-[0.55rem] text-[#1A1A1A]/50 dark:text-white/50 text-center mt-4 leading-relaxed max-w-[280px]">
                    Gunakan aplikasi e-wallet atau m-banking yang mendukung QRIS.
                  </p>
                </div>
              )}

              {!hasInlineQr && (
                <p className="font-sans text-[0.58rem] text-[#1A1A1A]/55 dark:text-white/50 text-center mb-6 leading-relaxed">
                  API belum mengembalikan data QR. Buka halaman pembayaran untuk scan QRIS atau pilih metode lain.
                </p>
              )}

              {paymentUrl ? (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-4 border border-[#1A1A1A] dark:border-white/30 text-[#1A1A1A] dark:text-white text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white/10 transition-all duration-500 flex items-center justify-center gap-3 ${
                    hasInlineQr ? "mb-4" : "mb-10"
                  }`}
                >
                  <ExternalLink size={12} strokeWidth={1.5} />
                  {hasInlineQr
                    ? "Atau buka halaman pembayaran"
                    : "Open Payment Gateway"}
                </a>
              ) : null}

              {pollStatus === "expired" ? (
                <p className="font-sans text-[0.58rem] tracking-[0.2em] text-red-500 uppercase text-center">
                  Invoice expired. Silakan buat ulang.
                </p>
              ) : pollStatus === "error" ? (
                <p className="font-sans text-[0.58rem] tracking-[0.2em] text-red-500 uppercase text-center">
                  Gagal mengecek status. Coba refresh halaman.
                </p>
              ) : (
                <motion.p
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="font-sans text-[0.58rem] tracking-[0.2em] text-[#1A1A1A]/50 dark:text-white/50 uppercase text-center"
                >
                  Menunggu konfirmasi pembayaran...
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={step3Variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="px-8 md:px-12 pt-12 pb-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-16 h-16 border border-[#1A1A1A]/20 dark:border-white/20 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Check size={24} strokeWidth={1} className="text-[#1A1A1A] dark:text-white" />
              </motion.div>

              <h2 className="font-serif font-light text-2xl tracking-[0.15em] text-[#1A1A1A] dark:text-white uppercase mb-2">
                Payment Verified.
              </h2>
              <p className="font-sans text-[0.60rem] tracking-[0.2em] text-[#1A1A1A]/50 dark:text-white/50 uppercase mb-10">
                Your order is being processed.
              </p>

              <a
                href={`https://wa.me/6285353669369?text=${encodeURIComponent(
                  "Halo Admin Zelarte, saya sudah membayar invoice " +
                    (invoiceNumber ?? invoiceId) +
                    " untuk produk " +
                    productName +
                    ". Mohon diproses!",
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-black/80 dark:hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <MessageCircle size={12} strokeWidth={1.5} />
                Claim Account Via WA
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
