"use client";
import { useEffect, useState } from "react";

const navItems = [
  { id: "intro", label: "intro" },
  { id: "rules", label: "rules" },
  { id: "catalog", label: "catalog" },
  { id: "checkout", label: "checkout" },
];

export default function FloatingTracker({ isVisible = true }: { isVisible?: boolean }) {
  const [activeId, setActiveId] = useState("intro");

  useEffect(() => {    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                setActiveId(entry.target.id);
            }
        });
    }, { rootMargin: "-20% 0px -70% 0px" });

    navItems.forEach(link => {
        const el = document.getElementById(link.id);
        if(el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if(el) {
          el.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <nav className={`fixed top-1/2 left-2 md:left-8 -translate-y-1/2 z-[90] transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
      <ul className="flex flex-col gap-6 md:gap-8">
        {navItems.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className="relative flex items-center h-full">
              <a 
                href={`#${id}`} 
                onClick={(e) => handleClick(e, id)}
                className={`flex items-center text-[0.45rem] md:text-[0.60rem] font-sans tracking-[0.25em] uppercase transition-all duration-300 ease-out relative ${
                  isActive ? 'text-[#F472B6]' : 'text-gray-400 hover:text-[#1A1A1A] font-light'
                }`}
              >
                {/* Active Line '—' */}
                <span className={`transition-all duration-300 overflow-hidden inline-flex items-center justify-end ${isActive ? 'w-4 mr-1 opacity-100' : 'w-0 mr-0 opacity-0'}`}>
                  —
                </span>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
