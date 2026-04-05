"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashMist() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide mist after 2 seconds based on user prompt
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none flex"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: [0.85, 0, 0.15, 1], delay: 0.5 } }} 
        >
          {/* Left Door */}
          <motion.div
            className="w-1/2 h-full bg-white relative overflow-hidden flex justify-end"
            initial={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 2, ease: [0.85, 0, 0.15, 1] }}
          >
            {/* White-pink mist particle effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-pink-50/70 opacity-80 blur-2xl"></div>
            {/* Subtle cubic shapes for the 'Minecraft pixel' reference */}
            <div className="absolute right-0 top-1/4 w-10 h-10 bg-pink-100/30 backdrop-blur-md"></div>
            <div className="absolute right-10 top-1/2 w-6 h-6 bg-pink-100/20 backdrop-blur-md"></div>
          </motion.div>
          
          {/* Right Door */}
          <motion.div
            className="w-1/2 h-full bg-white relative overflow-hidden"
            initial={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 2, ease: [0.85, 0, 0.15, 1] }}
          >
             <div className="absolute inset-0 bg-gradient-to-l from-transparent to-pink-50/70 opacity-80 blur-2xl"></div>
             {/* Subtle cubic shapes */}
             <div className="absolute left-0 bottom-1/4 w-12 h-12 bg-pink-100/30 backdrop-blur-md"></div>
             <div className="absolute left-8 bottom-1/2 w-4 h-4 bg-pink-100/20 backdrop-blur-md"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
