"use client";

import { useState, useRef, useEffect } from "react";
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
            ? "top-0 text-[0.48rem] text-[#1A1A1A]/50"
            : "top-4 text-[0.62rem] text-[#1A1A1A]/35"
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
        className="w-full bg-transparent border-none outline-none font-sans text-sm text-[#1A1A1A] tracking-wide pt-5 pb-2"
      />

      {/* Static baseline */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1A1A1A]/15">
        {/* Animated fill */}
        <div
          className={`h-full bg-[#1A1A1A] transition-transform duration-300 origin-left ${
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
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Step 1 → 2: Generate invoice ────────────────────────────────────────────
  const handleGenerateInvoice = async () => {
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          product_name: productName,
          amount: price,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorText =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
        const detailText =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);

        const errorMessage = detailText
          ? `${errorText || "Upstream payment error."} ${detailText}`
          : errorText || "Something went wrong.";
        throw new Error(errorMessage);
      }
      setInvoiceId(data.id);
      setPaymentUrl(data.payment_url);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Poll for payment confirmation ───────────────────────────────────
  useEffect(() => {
    if (step !== 2 || !invoiceId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?id=${invoiceId}`);
        const data = await res.json();
        if (data.status === "paid") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStep(3);
        }
      } catch {
        // silently ignore transient polling errors
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, invoiceId]);

  // ── Shared step transition variants ─────────────────────────────────────────
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

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-md bg-white border border-[#1A1A1A]/10 shadow-[0_40px_100px_rgba(0,0,0,0.06)] max-h-[90vh] overflow-y-auto"
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
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:rotate-90 transition-all duration-300"
        >
          <X strokeWidth={0.5} size={32} />
        </button>

        <AnimatePresence mode="wait">
          {/* ──────────────────────────────────────────────────────────────────
              Step 1 — Billing Details
          ────────────────────────────────────────────────────────────────── */}
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
              {/* Header */}
              <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 uppercase mb-2">
                Checkout
              </p>
              <h2 className="font-serif font-light text-base tracking-[0.1em] text-[#1A1A1A] uppercase leading-relaxed">
                {productName}
              </h2>
              <p className="font-sans text-[0.65rem] tracking-[0.2em] text-[#1A1A1A]/60 mt-1 uppercase mb-10">
                — Rp {price.toLocaleString("id-ID")}
              </p>

              {/* Fields */}
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

              {/* Error */}
              {error && (
                <p className="font-sans text-[0.60rem] tracking-[0.15em] text-red-500 mb-6 -mt-2">
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleGenerateInvoice}
                disabled={isLoading}
                className="w-full py-4 bg-[#1A1A1A] text-white text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </button>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              Step 2 — Payment Window
          ────────────────────────────────────────────────────────────────── */}
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
              {/* Header */}
              <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 uppercase mb-2">
                Step 2 of 2
              </p>
              <h2 className="font-serif font-light text-lg tracking-[0.15em] text-[#1A1A1A] uppercase mb-8">
                Complete Your Payment
              </h2>

              {/* Invoice box */}
              <div className="border border-[#1A1A1A]/10 p-6 mb-8 text-center bg-[#FBFBFB]">
                <p className="font-sans text-[0.48rem] tracking-[0.3em] text-[#1A1A1A]/40 uppercase mb-2">
                  Invoice
                </p>
                <p className="font-sans text-sm tracking-[0.1em] text-[#1A1A1A]">
                  {invoiceId}
                </p>
              </div>

              {/* Payment gateway link */}
              <a
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 border border-[#1A1A1A] text-[#1A1A1A] text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 flex items-center justify-center gap-3 mb-10"
              >
                <ExternalLink size={12} strokeWidth={1.5} />
                Open Payment Gateway
              </a>

              {/* Pulsing status */}
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="font-sans text-[0.58rem] tracking-[0.2em] text-[#1A1A1A]/50 uppercase text-center"
              >
                Awaiting payment confirmation...
              </motion.p>
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              Step 3 — Success
          ────────────────────────────────────────────────────────────────── */}
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
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-16 h-16 border border-[#1A1A1A]/20 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Check size={24} strokeWidth={1} />
              </motion.div>

              <h2 className="font-serif font-light text-2xl tracking-[0.15em] text-[#1A1A1A] uppercase mb-2">
                Payment Verified.
              </h2>
              <p className="font-sans text-[0.60rem] tracking-[0.2em] text-[#1A1A1A]/50 uppercase mb-10">
                Your order is being processed.
              </p>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/6285353669369?text=${encodeURIComponent(
                  "Halo Admin Zelarte, saya sudah membayar invoice " +
                    invoiceId +
                    " untuk produk " +
                    productName +
                    ". Mohon diproses!",
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-[#1A1A1A] text-white text-[0.60rem] tracking-[0.3em] font-sans font-medium uppercase hover:bg-black/80 transition-all duration-300 flex items-center justify-center gap-3"
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
