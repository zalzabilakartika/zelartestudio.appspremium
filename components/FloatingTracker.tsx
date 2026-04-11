"use client";
import { useEffect, useState, useCallback } from "react";

const navItems = [
  { id: "intro", label: "intro" },
  { id: "rules", label: "rules" },
  { id: "catalog", label: "catalog" },
];

export default function FloatingTracker() {
  const [activeId, setActiveId] = useState("intro");
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if(el) {
          el.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next);
    setTheme(next);
  }, [theme]);

  return (
    <>
      <nav
        className="fixed top-6 left-6 z-90 w-20 md:w-32 flex flex-col items-start gap-8 transition-all duration-500 ease-out"
      >
        <button
          onClick={() => document.getElementById("intro")?.scrollIntoView({ behavior: 'smooth' })}
          className="text-left group"
        >
          <h2 className="font-sans text-[0.60rem] tracking-[0.25em] text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] group-active:text-[#1A1A1A] dark:text-white/40 dark:group-hover:text-white uppercase font-medium transition-colors duration-300">
            Zelarte Studio
          </h2>
        </button>

        <div className="flex flex-col items-start">
          <ul className="flex flex-col gap-6 md:gap-8">
            {navItems.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id} className="relative flex items-center h-full">
                  <a
                    href={`#${id}`}
                    onClick={(e) => handleClick(e, id)}
                    className={`flex items-center text-[0.45rem] md:text-[0.60rem] font-sans tracking-[0.25em] uppercase transition-all duration-300 ease-out relative ${
                      isActive ? 'text-[#F472B6]' : 'text-gray-400 dark:text-gray-300 dark:hover:text-white hover:text-[#1A1A1A] font-light'
                    }`}
                  >
                    <span className={`transition-all duration-300 overflow-hidden inline-flex items-center justify-end ${isActive ? 'w-4 mr-1 opacity-100' : 'w-0 mr-0 opacity-0'}`}>
                      —
                    </span>
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {theme !== null && (
        <button
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="fixed left-6 bottom-6 z-90 bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 rounded-full p-2.5 transition-all duration-300 shadow-lg dark:bg-[#1a1a1a] dark:text-white dark:border-white/15 flex items-center justify-center hover:scale-110 active:scale-95"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.41 1.41M7.05 16.95l-1.41 1.41M18.36 18.36l-1.41-1.41M7.05 7.05L5.64 5.64M12 7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}
