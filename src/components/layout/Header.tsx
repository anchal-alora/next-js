"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight, Search, Bookmark } from "lucide-react";
import { getContactFormLink } from "@/lib/routes";
import { trackClick } from "@/lib/gtm";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { useSavedInsights } from "@/hooks/useSavedInsights";
import { SearchCombobox } from "@/components/search/SearchCombobox";

const utilityNavLinks = [
  { name: "Insights Library", path: "/insights/explore" },
  { name: "Newsroom", path: "/newsroom" },
  { name: "Careers", path: "/careers" },
] as const;

const primaryNavLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Industries", path: "/industries" },
  { name: "Insights", path: "/insights" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
] as const;

const mobileNavLinks = [...primaryNavLinks, ...utilityNavLinks] as const;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { savedCount } = useSavedInsights();
  const router = useRouter();
  const pathname = usePathname();
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    requestAnimationFrame(() => setIsMobileMenuOpen(false));
    requestAnimationFrame(() => setIsSearchOpen(false));
    // Ensure header state matches current scroll position after route transitions.
    requestAnimationFrame(() => setIsScrolled(window.scrollY > 20 || !!window.location.hash));
  }, [pathname]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSearchOpen(false);
    };

    const onMouseDown = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;
      const clickedSearchButton = !!searchButtonRef.current?.contains(targetNode);
      const clickedSearchPanel = !!searchPanelRef.current?.contains(targetNode);
      if (!clickedSearchButton && !clickedSearchPanel) setIsSearchOpen(false);
    };

    const onScroll = () => setIsSearchOpen(false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    requestAnimationFrame(() => searchInputRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const shouldReserveSpace = isSearchOpen && window.innerWidth >= 1024;
    root.style.setProperty("--header-search-height", shouldReserveSpace ? "80px" : "0px");
    return () => {
      root.style.setProperty("--header-search-height", "0px");
    };
  }, [isSearchOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen || isSearchOpen ? "shadow-elegant-sm" : ""
      }`}
    >
      <nav className="navbar market">
        <div className="nav-container">
          <div className="utility-nav clearfix relative lg:bg-secondary/70 lg:backdrop-blur-sm lg:h-10">
            <div className="grid-norm un-container container-wide lg:max-w-[1251px] relative z-10 hidden lg:flex items-center justify-end gap-1 h-full">
              <div className="dropdown icon-container login-icon-container globalsite cmp-globalsite-globaluser hidden"></div>

              <div className="dropdown icon-container search-icon-container flex items-center relative">
                <Button asChild variant="ghost-nav" size="icon" className="h-9 w-9">
                  <button
                    id="search-button-util-nav"
                    type="button"
                    className="btn dropdown-toggle group"
                    ref={searchButtonRef}
                    aria-label="Access Search"
                    aria-haspopup="true"
                    aria-expanded={isSearchOpen}
                    aria-controls="header-search-panel"
                    onClick={() => setIsSearchOpen((open) => !open)}
                  >
                    <span className="nav-icon gcom-icon-search">
                      <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-500 transition-colors" />
                    </span>
                  </button>
                </Button>

                <span className="vert-bar mx-1.5 hidden lg:inline-block h-4 w-px bg-slate-200" aria-hidden="true"></span>
              </div>

	              <div className="dropdown icon-container utility-icon-container flex items-center">
	                {utilityNavLinks.map((link, index) => (
	                  <Fragment key={link.path}>
                    <Button
                      asChild
                      variant="ghost-nav"
                      size="sm"
                      className={`text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-transparent ${
                        pathname === link.path ? "text-slate-900 [&>span]:after:scale-x-100" : ""
                      }`}
                    >
                      <Link
                        href={link.path}
                        className="icon-label hidden-sm hidden-xs utility-link"
                        onClick={() => {
                          trackClick(`${link.name} Utility Navigation`, "link", { click_url: link.path });
                        }}
                      >
                        <span>{link.name}</span>
                      </Link>
                    </Button>
                    {index < utilityNavLinks.length - 1 ? (
                      <span
                        className="vert-bar hidden-sm hidden-xs mx-1.5 hidden lg:inline-block h-4 w-px bg-slate-200"
                        aria-hidden="true"
                      ></span>
                    ) : null}
	                  </Fragment>
	                ))}
	              </div>

	              <span
	                className="vert-bar mx-1.5 hidden lg:inline-block h-4 w-px bg-slate-200"
	                aria-hidden="true"
	              ></span>

	              <Button
	                asChild
	                variant="ghost-nav"
	                size="sm"
	                className="relative text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-transparent"
	              >
	                <Link
	                  href="/insights/explore?saved=1"
	                  className="flex items-center gap-1.5"
	                  aria-label="Saved items"
	                  onClick={() => {
	                    trackClick("Saved Items (Header)", "link", { click_url: "/insights/explore?saved=1" });
	                  }}
	                >
	                  <Bookmark className="h-4 w-4 text-slate-500" aria-hidden="true" />
	                  <span>Saved items</span>
	                  {savedCount > 0 ? (
	                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] leading-[18px] text-center">
	                      {savedCount > 99 ? "99+" : savedCount}
	                    </span>
	                  ) : null}
	                </Link>
	              </Button>
	            </div>
	          </div>

          <div className="navbar-sticky-bg"></div>

	          <div className="navbar-container">
	            <div className="grid-norm navbar-header container-wide lg:max-w-[1251px] flex items-center justify-between gap-4 h-20 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <div
                id="global-navbar"
                className="dropdown dropdown-accordion global-toggler relative lg:hidden"
                data-accordion="#globalNavAccordion"
              >
                <Button asChild variant="ghost-nav" size="icon">
                  <button
                    id="global-nav-toggle"
                    type="button"
                    className="gcom-icon-menu"
                    aria-label="Access Menu"
                    aria-haspopup="true"
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                  >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </Button>

                <ul
                  className={`dropdown-menu global-nav-menu absolute left-0 top-full mt-2 w-64 rounded-md border border-border bg-background shadow-elegant-lg ${
                    isMobileMenuOpen ? "block" : "hidden"
                  }`}
                  role="menu"
                  aria-labelledby="global-nav-toggle"
                >
                  <li className="p-2">
                    <div className="flex flex-col gap-1">
                      {mobileNavLinks.map((link) => (
                        <Link
                          key={link.path}
                          href={link.path}
                          className="nav-link block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                          onClick={() => {
                            trackClick(`${link.name} Navigation (Mobile)`, "link", { click_url: link.path });
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </li>
                  <li className="bac-btn-container p-2">
                    <Link
                      href={getContactFormLink("header-button-mobile")}
                      onClick={() => {
                        trackClick("Get in Touch Button (Mobile)", "button", {
                          click_url: getContactFormLink("header-button-mobile"),
                        });
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Button variant="default" className="w-full group relative overflow-hidden" size="lg">
                        <span className="relative z-10 text-white">Connect</span>
                        <ArrowUpRight className="relative z-10 text-white group-hover:animate-arrow-bounce" />
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                      </Button>
                    </Link>
                  </li>
                </ul>
              </div>

	              <div className="gartner-logo lg:justify-self-start">
	                <Link
	                  href="/"
	                  className="flex items-center gap-3 group"
	                  aria-label="Home"
                  onClick={() => {
                    trackClick("Logo", "link", { click_url: "/" });
                  }}
                >
                  <OptimizedPicture
                    imageKey="logo/alora-logo-full"
                    alt="Alora Advisory"
                    className="h-14 md:h-16 w-auto max-w-[200px] md:max-w-[240px] object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                    sizes="240px"
                    loading="eager"
                  />
	                </Link>
	              </div>

	              <nav aria-label="Primary" className="hidden lg:flex justify-center">
	                <ul id="primarynav" className="nav navbar-nav central-menu flex items-center justify-center gap-1">
	                  {primaryNavLinks.map((link) => (
	                    <li key={link.path} className="dropdown primary-dropdown">
	                      <Button
	                        asChild
	                        variant="ghost-nav"
	                        className={`text-sm font-medium ${
	                          pathname === link.path ? "text-foreground [&>span]:after:scale-x-100" : ""
	                        }`}
	                      >
	                        <Link
	                          href={link.path}
	                          className="dropdown-toggle nav-link primary-link"
	                          onClick={() => {
	                            trackClick(`${link.name} Navigation`, "link", { click_url: link.path });
	                          }}
	                        >
	                          <span>{link.name}</span>
	                        </Link>
	                      </Button>
	                    </li>
	                  ))}
	                </ul>
	              </nav>

	              <ul className="nav navbar-nav nav-right hidden lg:flex items-center gap-3 lg:justify-self-end">
	                <li className="bac-btn-container">
	                  <Link
	                    href={getContactFormLink("header-button")}
	                    onClick={() => {
                      trackClick("Get in Touch Button (Header)", "button", {
                        click_url: getContactFormLink("header-button"),
                      });
                    }}
                  >
                    <Button variant="default" size="sm" className="gap-1.5">
                      <span className="relative z-10 text-white">Connect</span>
                      <ArrowUpRight className="relative z-10 text-white group-hover:animate-arrow-bounce" />
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                    </Button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

	          {isSearchOpen ? (
	            <div
	              id="header-search-panel"
	              ref={searchPanelRef}
	              className="hidden lg:block bg-white border-t border-slate-200"
	            >
	              <div className="container-wide lg:max-w-[1251px] h-20 flex items-center justify-center">
	                <div className="dropdown-menu search-container w-full max-w-3xl">
	                  <div className="cmp-globalsite-search ac_box relative w-full">
	                    <SearchCombobox
	                      scope="all"
	                      value={searchValue}
	                      onValueChange={setSearchValue}
	                      placeholder="Search"
	                      inputRef={searchInputRef}
	                      containerClassName="relative w-full"
	                      inputWrapperClassName="relative"
	                      inputClassName="form-control searchString ac_input w-full h-10 pl-0 pr-12 text-xl bg-transparent border-0 border-b-2 border-primary focus:ring-0 focus:outline-none text-foreground placeholder:text-primary/60"
	                      onSubmit={(raw) => {
	                        const q = raw.trim();
	                        if (!q) return;
	                        trackClick("Header Search Submit", "other", { search_query: q });
	                        router.push(`/search?q=${encodeURIComponent(q)}`);
	                        setIsSearchOpen(false);
	                      }}
	                      onResultSelect={(result) => {
	                        trackClick("Header Search Result Click", "link", {
	                          search_query: searchValue.trim(),
	                          click_url: result.href,
	                        });

	                        if (typeof window !== "undefined") {
	                          const url = new URL(result.href, window.location.origin);
	                          if (url.pathname === window.location.pathname && url.hash) {
	                            const id = url.hash.slice(1);
	                            const element = id ? document.getElementById(id) : null;
	                            if (element) {
	                              element.scrollIntoView({ behavior: "smooth", block: "start" });
	                              window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
	                              setIsSearchOpen(false);
	                              return;
	                            }
	                          }
	                        }

	                        router.push(result.href);
	                        setIsSearchOpen(false);
	                      }}
	                      trailing={
	                        <button
	                          type="button"
	                          disabled={!searchValue.trim()}
	                          className="searchHead btn absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
	                          aria-label="Search"
	                          onClick={() => {
	                            const q = searchValue.trim();
	                            if (!q) return;
	                            trackClick("Header Search Submit", "other", { search_query: q });
	                            router.push(`/search?q=${encodeURIComponent(q)}`);
	                            setIsSearchOpen(false);
	                          }}
	                        >
	                          <span className="nav-icon gcom-icon-search">
	                            <Search className="h-5 w-5 text-primary" />
	                          </span>
	                        </button>
	                      }
	                    />
	                  </div>
	                </div>
	              </div>
	            </div>
	          ) : null}
        </div>
      </nav>
    </header>
  );
}
