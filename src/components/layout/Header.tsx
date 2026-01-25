"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { getContactFormLink } from "@/lib/routes";
import { trackClick } from "@/lib/gtm";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Industries", path: "/industries" },
  { name: "Who We Are", path: "/who-we-are" },
  { name: "Insights", path: "/insights" },
  { name: "Newsroom", path: "/newsroom" },
  { name: "Contact", path: "/contact" },
];


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateScrolledState = () => {
      // Keep header readable when restoring scroll position (e.g., back/forward navigation)
      // and when using in-page anchors.
      setIsScrolled(window.scrollY > 20 || !!window.location.hash);
    };

    const handlePopState = () => {
      // Scroll restoration can happen after popstate; defer measurement.
      requestAnimationFrame(updateScrolledState);
    };

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    window.addEventListener("hashchange", updateScrolledState);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("scroll", updateScrolledState);
      window.removeEventListener("hashchange", updateScrolledState);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Ensure header state matches current scroll position after route transitions.
    requestAnimationFrame(() => setIsScrolled(window.scrollY > 20 || !!window.location.hash));
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? "bg-background/95 backdrop-blur-md shadow-elegant-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            onClick={() => { trackClick('Logo', 'link', { click_url: '/' }); }}
          >
            <OptimizedPicture
              imageKey="logo/alora-logo-full"
              alt="Alora Advisory"
              className="h-14 md:h-16 w-auto max-w-[200px] md:max-w-[240px] object-contain transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="240px"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => { trackClick(`${link.name} Navigation`, 'link', { click_url: link.path }); }}
              >
                <Button
                  variant="ghost-nav"
                  className={`text-sm font-medium ${
                    pathname === link.path
                      ? "text-foreground [&>span]:after:scale-x-100"
                      : ""
                  }`}
                >
                  <span>{link.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link 
              href={getContactFormLink("header-button")}
              onClick={() => { trackClick('Get in Touch Button (Header)', 'button', { click_url: getContactFormLink("header-button") }); }}
            >
              <Button variant="default" size="sm" className="gap-1.5">
                <span className="relative z-10 text-white">Connect</span>
                <ArrowUpRight className="relative z-10 text-white group-hover:animate-arrow-bounce" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? "max-h-screen pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                onClick={() => { trackClick(`${link.name} Navigation (Mobile)`, 'link', { click_url: link.path }); }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-base ${
                    pathname === link.path
                      ? "bg-secondary text-foreground"
                      : ""
                  }`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
            <Link 
              href={getContactFormLink("header-button-mobile")} 
              className="mt-4"
              onClick={() => { trackClick('Get in Touch Button (Mobile)', 'button', { click_url: getContactFormLink("header-button-mobile") }); }}
            >
              <Button variant="default" className="w-full group relative overflow-hidden" size="lg">
                <span className="relative z-10 text-white">Connect</span>
                <ArrowUpRight className="relative z-10 text-white group-hover:animate-arrow-bounce" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
