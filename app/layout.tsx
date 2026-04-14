import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: '--font-serif' 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: "Zelarte Studio",
  description: "Ready For Your Premium Apps Today?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${cormorant.variable} ${jakarta.variable} antialiased selection:bg-[#1A1A1A] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
