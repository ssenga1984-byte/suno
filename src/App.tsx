import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Facebook,
  Filter,
  FileText,
  HelpCircle,
  HeartHandshake,
  Info,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Sprout,
  Target,
  Trees,
  Utensils,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { diagnosticKeywords } from "./data/diagnosticKeywords";
import { consultContent, isConsultType } from "./data/consultContent";
import {
  contactChannels,
  faqItems,
  getRouteByPath,
  imagePaths,
  officialLinks,
  permanentInitiatives,
  primaryRoutePaths,
  regionActivityGroups,
  recruitmentSnapshot,
  siteRoutes,
} from "./data/siteContent";
import { staffGroups, staffInfo } from "./data/staffData";
import type {
  ActivityDetailColumn,
  ActivityIconKey,
  ActivityStorySection as ActivityStorySectionData,
  CtaLink,
  PermanentInitiative,
  RecruitmentItem,
  RegionActivityGroup,
  SiteRoute,
} from "./types";
import type { DiagnosticKeywordId } from "./data/diagnosticKeywords";
import type { ConsultContentItem, ConsultIconKey, ConsultType } from "./data/consultContent";

const routePaths = new Set(siteRoutes.map((route) => route.path));
const primaryPathSet = new Set<string>(primaryRoutePaths);

function normalizeHash(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.split("?")[0] || "/";
  return routePaths.has(path) ? raw : "/";
}

function hashFor(path: string) {
  return path === "/" ? "#/" : `#${path}`;
}

function routePathOnly(pathWithQuery: string) {
  return pathWithQuery.split("?")[0] || "/";
}

function routeSearchParams(pathWithQuery: string) {
  const query = pathWithQuery.split("?")[1] ?? "";
  return new URLSearchParams(query);
}

function isExternalLink(href: string) {
  return /^https?:\/\//.test(href);
}

function linkHref(link: CtaLink) {
  if (link.external || isExternalLink(link.href) || link.href.startsWith("#")) {
    return link.href;
  }
  return hashFor(link.href);
}

function scrollWithHeaderOffset(target: HTMLElement) {
  const offsetValue = window.getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset");
  const offset = Number.parseFloat(offsetValue) || 80;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

const navItems = siteRoutes.filter((route) =>
  ["/", "/about", "/first-time", "/activities", "/events", "/voices", "/support", "/consult", "/contact"].includes(route.path),
);

type HeaderNavItem = SiteRoute & {
  children?: SiteRoute[];
};

const headerChildGroups: Record<string, string[]> = {
  "/about": ["/about", "/about/story", "/about/sdgs", "/about/staff", "/about/organization"],
  "/activities": ["/activities", "/forest-school", "/field-school", "/regional", "/waribashi"],
};

const headerNavItems: HeaderNavItem[] = navItems.map((route) => {
  const childPaths = headerChildGroups[route.path];

  return childPaths
    ? {
        ...route,
        children: childPaths.map((path) => getRouteByPath(path)),
      }
    : route;
});

function getHeaderActivePath(path: string) {
  if (path.startsWith("/about/")) {
    return "/about";
  }

  if (["/forest-school", "/field-school", "/regional", "/waribashi"].includes(path)) {
    return "/activities";
  }

  return path;
}

const voicesPageDescription =
  "参加者の声。実際に活動に参加した方の声の一部を、個人が特定されない形で要約・編集して紹介しています。画像は活動の雰囲気を伝えるイメージです。";

// Scroll reveal: each section's content rises up from below as it enters the
// viewport, with a gentle stagger across the content wrapper's direct children.
// Progressive enhancement only — under prefers-reduced-motion or without JS the
// hidden state never applies, so all content stays visible.
function useScrollReveal(routePath: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const main = document.querySelector("main");
    if (!main) {
      return;
    }

    document.documentElement.classList.add("reveal-enabled");

    let observer: IntersectionObserver | null = null;

    const frame = window.requestAnimationFrame(() => {
      const allWrappers = Array.from(main.querySelectorAll<HTMLElement>(".mx-auto"));
      const wrappers = allWrappers.filter(
        (el) =>
          !el.classList.contains("support-hero-copy") &&
          !el.classList.contains("consult-hero-copy") &&
          !allWrappers.some((other) => other !== el && other.contains(el)),
      );

      wrappers.forEach((wrapper) => {
        Array.from(wrapper.children)
          .filter((node): node is HTMLElement => node instanceof HTMLElement)
          .forEach((child, index) => {
            child.setAttribute("data-reveal", "");
            child.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 70}ms`);
          });
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            entry.target
              .querySelectorAll<HTMLElement>(":scope > [data-reveal]")
              .forEach((child) => child.classList.add("is-revealed"));
            observer?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
      );

      wrappers.forEach((wrapper) => observer?.observe(wrapper));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [routePath]);
}

export default function App() {
  const [routePath, setRoutePath] = useState<string>(normalizeHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const routePathRef = useRef(routePath);
  const activeRoute = useMemo(() => getRouteByPath(routePathOnly(routePath)), [routePath]);

  useEffect(() => {
    routePathRef.current = routePath;
  }, [routePath]);

  useEffect(() => {
    const onRouteChange = () => {
      const nextRoutePath = normalizeHash();
      const pathChanged = routePathOnly(routePathRef.current) !== routePathOnly(nextRoutePath);
      setRoutePath(nextRoutePath);
      setMenuOpen(false);
      if (pathChanged) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    return () => {
      window.removeEventListener("hashchange", onRouteChange);
      window.removeEventListener("popstate", onRouteChange);
    };
  }, []);

  useEffect(() => {
    document.title = activeRoute.metaTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        activeRoute.path === "/voices" ? voicesPageDescription : activeRoute.metaDescription,
      );
  }, [activeRoute]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useScrollReveal(routePath);

  return (
    <div className="min-h-screen bg-forest-paper text-forest-ink">
      <SiteHeader
        activePath={getHeaderActivePath(activeRoute.path)}
        currentPath={activeRoute.path}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      {renderRoute(activeRoute, routePath)}
      <SiteFooter />
    </div>
  );
}

function renderRoute(route: SiteRoute, routePath: string) {
  if (route.status === "provisional") {
    return <ProvisionalPage route={route} />;
  }

  switch (route.path) {
    case "/":
      return <HomePage route={route} />;
    case "/first-time":
      return <FirstTimePage route={route} />;
    case "/activities":
      return <ActivitiesPage route={route} />;
    case "/forest-school":
      return <ForestSchoolLandingPage route={route} />;
    case "/field-school":
    case "/regional":
    case "/waribashi":
      return <ActivityDetailPage route={route} />;
    case "/events":
      return <EventsPage route={route} routePath={routePath} />;
    case "/voices":
      return <VoicesPage route={route} />;
    case "/about":
      return <AboutHubPage route={route} />;
    case "/about/story":
      return <AboutStoryPage route={route} />;
    case "/about/sdgs":
      return <AboutSdgsPage route={route} />;
    case "/about/staff":
      return <AboutStaffPage route={route} />;
    case "/about/organization":
      return <AboutOrganizationPage route={route} />;
    case "/support":
      return <SupportPage route={route} />;
    case "/consult":
      return <ConsultPage route={route} routePath={routePath} />;
    case "/contact":
      return <ContactPage route={route} />;
    default:
      return <ProvisionalPage route={route} />;
  }
}

function SiteHeader({
  activePath,
  currentPath,
  menuOpen,
  setMenuOpen,
}: {
  activePath: string;
  currentPath: string;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
}) {
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const headerCta =
    activePath === "/support"
      ? { label: "支援する", href: officialLinks.join, external: true }
      : { label: "相談する", href: "#/consult", external: false };

  useEffect(() => {
    setOpenDesktopMenu(null);
  }, [activePath]);

  useEffect(() => {
    if (!openDesktopMenu) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDesktopMenu]);

  useEffect(() => {
    if (!menuOpen) {
      setMobileExpandedMenu(null);
    }
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-sticky-header border-b border-forest-deep/10 bg-forest-linen">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-10 lg:px-16">
        <a
          href="#/"
          aria-label="JUON NETWORK ホームへ"
          className="flex min-w-0 items-center text-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
        >
          <img
            src="/assets/brand/juon-network-logo.png"
            alt="認定特定非営利活動法人 樹恩ネットワーク JUON NETWORK"
            width={440}
            height={96}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="block h-auto w-[178px] shrink-0 sm:w-[220px]"
          />
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主要ページ">
          {headerNavItems.slice(1).map((item) => {
            const isActive = activePath === item.path;

            if (!item.children?.length) {
              return (
                <a
                  key={item.path}
                  href={hashFor(item.path)}
                  className={[
                    "px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss",
                    isActive ? "bg-forest-deep text-forest-linen" : "text-forest-deep hover:bg-forest-deep/8",
                  ].join(" ")}
                >
                  {item.navLabel}
                </a>
              );
            }

            const menuId = `desktop-subnav-${item.id}`;
            const menuOpenForItem = openDesktopMenu === item.path;

            return (
              <div key={item.path} className="relative flex items-center">
                <a
                  href={hashFor(item.path)}
                  className={[
                    "rounded-l-sm px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss",
                    isActive ? "bg-forest-deep text-forest-linen" : "text-forest-deep hover:bg-forest-deep/8",
                  ].join(" ")}
                >
                  {item.navLabel}
                </a>
                <button
                  type="button"
                  aria-label={`${item.navLabel}のサブメニューを${menuOpenForItem ? "閉じる" : "開く"}`}
                  aria-controls={menuId}
                  aria-expanded={menuOpenForItem}
                  onClick={() => setOpenDesktopMenu(menuOpenForItem ? null : item.path)}
                  className={[
                    "grid h-9 w-8 place-items-center rounded-r-sm border-l border-current/15 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss",
                    isActive ? "bg-forest-deep text-forest-linen" : "text-forest-deep hover:bg-forest-deep/8",
                  ].join(" ")}
                >
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={["transition-transform", menuOpenForItem ? "rotate-180" : ""].join(" ")}
                  />
                </button>
                {menuOpenForItem ? (
                  <div
                    id={menuId}
                    className="absolute left-0 top-full mt-3 w-80 border border-forest-deep/12 bg-forest-paper p-3 text-forest-deep shadow-[0_18px_38px_rgba(22,45,32,.14)]"
                  >
                    <div className="grid gap-1">
                      {item.children.map((child) => (
                        <a
                          key={child.path}
                          href={hashFor(child.path)}
                          className={[
                            "grid gap-1 px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                            currentPath === child.path ? "bg-forest-deep text-forest-linen" : "hover:bg-forest-linen",
                          ].join(" ")}
                        >
                          <span className="text-sm font-bold">{child.navLabel}</span>
                          <span
                            className={[
                              "text-xs leading-5",
                              currentPath === child.path ? "text-forest-linen/80" : "text-forest-muted",
                            ].join(" ")}
                          >
                            {child.metaDescription}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <a
          href={headerCta.href}
          target={headerCta.external ? "_blank" : undefined}
          rel={headerCta.external ? "noreferrer" : undefined}
          className="hidden min-h-11 items-center justify-center bg-forest-gold px-5 py-2.5 text-sm font-bold text-forest-deep transition hover:bg-forest-goldlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss sm:inline-flex"
        >
          {headerCta.label}
        </a>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center border border-forest-deep/20 bg-forest-linen text-forest-deep lg:hidden"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-mobile-menu flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-forest-deep/10 bg-forest-linen px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 lg:hidden"
          aria-label="モバイルメニュー"
        >
          <div className="grid gap-3">
            {headerNavItems.map((item) => {
              const isActive = activePath === item.path;

              if (!item.children?.length) {
                return (
                  <a
                    key={item.path}
                    href={hashFor(item.path)}
                    className={[
                      "flex min-h-14 items-center justify-between border border-forest-deep/12 px-5 py-4 text-base font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                      isActive ? "bg-forest-deep text-forest-linen" : "bg-forest-paper text-forest-deep hover:border-forest-leaf/45",
                    ].join(" ")}
                  >
                    <span>{item.navLabel}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                );
              }

              const menuId = `mobile-subnav-${item.id}`;
              const menuOpenForItem = mobileExpandedMenu === item.path;

              return (
                <div key={item.path} className="border border-forest-deep/12 bg-forest-paper">
                  <button
                    type="button"
                    aria-label={`${item.navLabel}のサブメニューを${menuOpenForItem ? "閉じる" : "開く"}`}
                    aria-controls={menuId}
                    aria-expanded={menuOpenForItem}
                    onClick={() => setMobileExpandedMenu(menuOpenForItem ? null : item.path)}
                    className={[
                      "flex min-h-14 w-full items-center justify-between px-5 py-4 text-left text-base font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                      isActive ? "bg-forest-deep text-forest-linen" : "text-forest-deep hover:border-forest-leaf/45",
                    ].join(" ")}
                  >
                    <span>{item.navLabel}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className={["transition-transform", menuOpenForItem ? "rotate-180" : ""].join(" ")}
                    />
                  </button>
                  {menuOpenForItem ? (
                    <div id={menuId} className="grid gap-2 border-t border-forest-deep/10 p-3">
                      {item.children.map((child) => (
                        <a
                          key={child.path}
                          href={hashFor(child.path)}
                          className={[
                            "grid gap-1 border border-forest-deep/10 px-4 py-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                            currentPath === child.path ? "bg-forest-deep text-forest-linen" : "bg-forest-linen text-forest-deep",
                          ].join(" ")}
                        >
                          <span className="text-sm font-bold">{child.navLabel}</span>
                          <span
                            className={[
                              "text-xs leading-5",
                              currentPath === child.path ? "text-forest-linen/80" : "text-forest-muted",
                            ].join(" ")}
                          >
                            {child.metaDescription}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <a
            href={headerCta.href}
            target={headerCta.external ? "_blank" : undefined}
            rel={headerCta.external ? "noreferrer" : undefined}
            className="mt-auto flex min-h-12 items-center justify-center bg-forest-gold px-5 py-3 text-sm font-bold text-forest-deep transition hover:bg-forest-goldlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
          >
            {headerCta.label}
          </a>
        </nav>
      ) : null}
    </header>
  );
}

function PageBanner({ route }: { route: SiteRoute }) {
  const { banner } = route;
  const isTop = banner.variant === "top";

  return (
    <section
      className={[
        "relative isolate grid overflow-hidden bg-forest-deep text-forest-linen",
        isTop ? "min-h-[660px] items-end md:min-h-[720px]" : "min-h-[420px] items-center md:min-h-[500px]",
      ].join(" ")}
    >
      <img
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={banner.image.src}
        alt={banner.image.alt}
        width={1600}
        height={1000}
        loading={isTop ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={isTop ? "high" : "auto"}
        style={{ objectPosition: banner.imagePosition ?? "center" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,44,31,.88),rgba(9,44,31,.58)_54%,rgba(9,44,31,.18)),linear-gradient(180deg,rgba(9,44,31,.18),rgba(9,44,31,.54))]" />

      <div
        className={[
          "mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20 lg:px-16",
          route.path === "/support" ? "support-hero-copy" : "",
        ].join(" ")}
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss md:text-sm">
          {banner.eyebrow}
        </p>
        <h1
          className={[
            "banner-title w-full max-w-[21rem] whitespace-pre-line font-serif font-medium leading-[1.16] tracking-normal sm:max-w-4xl",
            isTop ? "text-3xl sm:text-4xl md:text-7xl" : "text-3xl md:text-6xl",
            route.path === "/support" ? "whitespace-pre-line" : "",
          ].join(" ")}
          style={{
            overflowWrap: route.path === "/support" ? "normal" : "anywhere",
            wordBreak: route.path === "/support" ? "keep-all" : "normal",
          }}
        >
          {banner.title}
        </h1>
        <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-forest-linen/90 md:text-lg">
          {banner.lead}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ActionLink link={banner.primaryCta} variant="primary" />
          {banner.secondaryCta ? <ActionLink link={banner.secondaryCta} variant="secondary" /> : null}
        </div>
      </div>
    </section>
  );
}

function TextOnlyPageBanner({ route }: { route: SiteRoute }) {
  const { banner } = route;

  return (
    <section className="relative isolate overflow-hidden bg-forest-deep text-forest-linen">
      <div className="absolute inset-0 -z-10 opacity-20" aria-hidden="true">
        <div className="absolute left-8 top-10 h-48 w-48 border border-forest-moss/40" />
        <div className="absolute bottom-8 right-10 h-36 w-36 border border-forest-gold/40" />
      </div>
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss md:text-sm">
          {banner.eyebrow}
        </p>
        <h1 className="banner-title max-w-4xl font-serif text-4xl font-medium leading-[1.16] tracking-normal md:text-7xl">
          {banner.title}
        </h1>
        <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-forest-linen/90 md:text-lg">{banner.lead}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ActionLink link={banner.primaryCta} variant="primary" />
          {banner.secondaryCta ? <ActionLink link={banner.secondaryCta} variant="secondary" /> : null}
        </div>
      </div>
    </section>
  );
}

function ActionLink({ link, variant = "primary" }: { link: CtaLink; variant?: "primary" | "secondary" | "quiet" }) {
  const external = link.external || isExternalLink(link.href);
  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href.startsWith("#") || link.href.startsWith("#/")) {
      return;
    }

    const target = document.getElementById(link.href.slice(1));
    if (!target) {
      return;
    }

    event.preventDefault();
    scrollWithHeaderOffset(target);
  };
  const classes = {
    primary:
      "bg-forest-gold text-forest-deep hover:bg-forest-goldlight border border-forest-gold",
    secondary:
      "border border-forest-linen text-forest-linen hover:bg-forest-linen hover:text-forest-deep",
    quiet:
      "border border-forest-deep/20 text-forest-deep hover:bg-forest-linen",
  }[variant];

  return (
    <a
      href={linkHref(link)}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={handleAnchorClick}
      className={[
        "inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 px-6 py-3 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss sm:w-auto",
        classes,
      ].join(" ")}
    >
      <span className="min-w-0">{link.label}</span>
      {external ? <ExternalLink size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">{eyebrow}</p> : null}
      <h2 className="font-serif text-[1.75rem] font-medium leading-tight text-forest-deep md:text-h2">{title}</h2>
      <span className="mx-auto mt-5 block h-[3px] w-16 bg-forest-gold" />
      {body ? <p className="mx-auto mt-6 max-w-2xl leading-8 text-forest-muted">{body}</p> : null}
    </div>
  );
}

type DiagnosticOption = {
  id: string;
  label: string;
};

type DiagnosticCard = {
  id: string;
  title: string;
  body: string;
  icon: typeof Leaf;
  questions: {
    prompt: string;
    options: DiagnosticOption[];
  }[];
  results: CtaLink[];
  reason: string;
};

const diagnosticCards: DiagnosticCard[] = [
  {
    id: "first",
    title: diagnosticKeywords.first.label,
    body: "一人でも、友だちとでも。まず流れを知りたい方へ。",
    icon: ShieldCheck,
    questions: [
      {
        prompt: "まずはどちらが近いですか？",
        options: [
          { id: "onsite", label: diagnosticKeywords.onsite.label },
          { id: "learn", label: diagnosticKeywords.learn.label },
        ],
      },
      {
        prompt: "どの形が安心ですか？",
        options: [
          { id: "day", label: "日帰りが安心" },
          { id: "stay", label: "宿泊や交流も可" },
        ],
      },
    ],
    results: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "イベント一覧", href: "/events" },
      { label: "森林の楽校", href: "/forest-school" },
    ],
    reason: "はじめての不安を軽くして、行けそうな日程や森の体験へつなぎます。",
  },
  {
    id: "student",
    title: "学生・若者",
    body: "授業、ゼミ、サークル、個人参加など。入り方はいろいろあります。",
    icon: Sprout,
    questions: [
      {
        prompt: "いま関心が近いのはどちらですか？",
        options: [
          { id: "experience", label: "体験したい" },
          { id: "study", label: "学びたい" },
        ],
      },
      {
        prompt: "関わり方はどちらから始めたいですか？",
        options: [
          { id: "single", label: diagnosticKeywords.single.label },
          { id: "continue", label: "継続も知りたい" },
        ],
      },
    ],
    results: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "イベント一覧", href: "/events" },
      { label: "相談する", href: "/consult" },
    ],
    reason: "学生・若者が入りやすい入口を、イベント確認と相談に分けて案内します。",
  },
  {
    id: "family",
    title: "親子",
    body: "子どもと自然や地域に触れる週末を探す方へ。",
    icon: Users,
    questions: [
      {
        prompt: "参加イメージはどちらに近いですか？",
        options: [
          { id: "nature", label: diagnosticKeywords.nature.label },
          { id: "work", label: "作業も体験" },
        ],
      },
      {
        prompt: "確認したい条件はどちらですか？",
        options: [
          { id: "near", label: "近場・日帰り" },
          { id: "ask", label: diagnosticKeywords.ask.label },
        ],
      },
    ],
    results: [
      { label: "イベント一覧", href: "/events" },
      { label: "はじめての方へ", href: "/first-time" },
      { label: "相談する", href: "/consult" },
    ],
    reason: "親子条件は活動ごとに異なるため、日程確認と相談窓口を案内します。",
  },
  {
    id: "continue",
    title: diagnosticKeywords.continue.label,
    body: "森や地域に通いながら、少しずつ関わりを深めたい方へ。",
    icon: Trees,
    questions: [
      {
        prompt: "学び方はどちらが近いですか？",
        options: [
          { id: "field", label: diagnosticKeywords.field.label },
          { id: "basic", label: "まず基礎を知りたい" },
        ],
      },
      {
        prompt: "関心の軸はどちらですか？",
        options: [
          { id: "forest", label: diagnosticKeywords.forest.label },
          { id: "local", label: diagnosticKeywords.local.label },
        ],
      },
    ],
    results: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "森林の楽校", href: "/forest-school" },
      { label: "活動一覧", href: "/activities" },
    ],
    reason: "入門講座ページは暫定のため使わず、DOM正本ページへ案内します。",
  },
  {
    id: "corporate",
    title: "企業・団体",
    body: "社員参加、学校、団体連携、協賛など",
    icon: Building2,
    questions: [
      {
        prompt: "検討内容はどちらですか？",
        options: [
          { id: "staff", label: "社員参加を検討" },
          { id: "partner", label: "協賛・連携を検討" },
        ],
      },
      {
        prompt: "次に必要なのはどちらですか？",
        options: [
          { id: "condition", label: "実施条件を知りたい" },
          { id: "consult", label: "相談したい" },
        ],
      },
    ],
    results: [
      { label: "相談する", href: "/consult" },
      { label: "問い合わせ", href: "/contact" },
      { label: "支援する", href: "/support" },
    ],
    reason: "企業向けは条件整理から問い合わせへ進めます。",
  },
  {
    id: "support",
    title: diagnosticKeywords.support.label,
    body: "寄付、会員、日常の選択から森を支えたい方へ。",
    icon: HeartHandshake,
    questions: [
      {
        prompt: "支援の形はどちらが近いですか？",
        options: [
          { id: "donation", label: "寄付・会員" },
          { id: "daily", label: diagnosticKeywords.daily.label },
        ],
      },
      {
        prompt: "次の行動はどちらがよいですか？",
        options: [
          { id: "now", label: "すぐ確認" },
          { id: "ask", label: "相談したい" },
        ],
      },
    ],
    results: [
      { label: "支援する", href: "/support" },
      { label: "問い合わせ", href: "/contact" },
      { label: "活動一覧", href: "/activities" },
    ],
    reason: "支援を中心に案内しつつ、活動理解にも戻れるようにします。",
  },
];

const diagnosticQuickLinks: CtaLink[] = [
  { label: "イベント一覧", href: "/events" },
  { label: "はじめての方へ", href: "/first-time" },
  { label: "相談する", href: "/consult" },
  { label: "支援する", href: "/support" },
];

function DiagnosticHelperSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const questionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const selectedCard = diagnosticCards.find((card) => card.id === selectedId) ?? null;
  const answeredCount = Object.keys(answers).length;
  const isComplete = Boolean(selectedCard && answeredCount >= selectedCard.questions.length);

  useEffect(() => {
    if (selectedId) {
      window.setTimeout(() => questionRef.current?.focus(), 0);
    }
  }, [selectedId]);

  useEffect(() => {
    if (isComplete) {
      window.setTimeout(() => resultRef.current?.focus(), 0);
    }
  }, [isComplete, selectedId]);

  const selectCard = (id: string) => {
    setSelectedId(id);
    setAnswers({});
  };

  const reset = () => {
    setSelectedId(null);
    setAnswers({});
  };

  return (
    <section className="bg-forest-paper py-14 md:py-20" aria-labelledby="diagnostic-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Guide for choosing</p>
            <h2 id="diagnostic-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              <span className="block">迷ったら</span>
              <span className="block">ここから選ぶ</span>
            </h2>
            <p className="mt-5 break-all leading-8 text-forest-muted">
              まだ目的が決まっていなくても大丈夫。近い気持ちを選ぶだけで、活動一覧や相談ページへ進めます。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {diagnosticQuickLinks.map((link) => (
                <ActionLink key={link.href} link={link} variant="quiet" />
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="関わり方の候補">
              {diagnosticCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={selectedId === card.id}
                  onClick={() => selectCard(card.id)}
                  className={[
                    "group min-h-[10.5rem] rounded-md border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss",
                    selectedId === card.id
                      ? "border-forest-leaf bg-forest-linen shadow-soft"
                      : "border-forest-deep/12 bg-forest-linen hover:border-forest-leaf/45",
                  ].join(" ")}
                >
                  <card.icon className="h-8 w-8 text-forest-leaf" strokeWidth={1.8} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-forest-deep">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-forest-muted">{card.body}</p>
                </button>
              ))}
            </div>

            {selectedCard ? (
              <div
                ref={questionRef}
                tabIndex={-1}
                className="rounded-md border border-forest-deep/12 bg-forest-linen p-5 md:p-7"
              >
                <p className="text-sm font-semibold text-forest-gold">選択中: {selectedCard.title}</p>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {selectedCard.questions.map((question, index) => (
                    <fieldset key={question.prompt} className="rounded-md border border-forest-deep/10 bg-forest-paper p-4">
                      <legend className="px-1 text-sm font-semibold text-forest-deep">
                        質問 {index + 1}/2: {question.prompt}
                      </legend>
                      <div className="mt-4 grid gap-2">
                        {question.options.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={answers[index] === option.id}
                            onClick={() => setAnswers((current) => ({ ...current, [index]: option.id }))}
                            className={[
                              "min-h-11 rounded-md border px-4 py-2 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                              answers[index] === option.id
                                ? "border-forest-deep bg-forest-deep text-forest-linen"
                                : "border-forest-deep/16 bg-forest-linen text-forest-deep hover:border-forest-leaf/50",
                            ].join(" ")}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>

                <div
                  ref={resultRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="mt-6 rounded-md border border-forest-gold/35 bg-forest-cream p-5"
                >
                  <p className="text-sm font-semibold text-forest-deep">
                    {isComplete ? "結果を表示しました" : `質問 ${answeredCount}/2 に回答済み`}
                  </p>
                  {isComplete ? (
                    <>
                      <p className="mt-3 leading-7 text-forest-muted">{selectedCard.reason}</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {selectedCard.results.map((link) => (
                          <ActionLink key={`${selectedCard.id}-${link.href}`} link={link} variant="quiet" />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 leading-7 text-forest-muted">
                      2つの質問に答えると、2〜3件の候補を表示します。候補は入口の一例です。最新情報は募集詳細で確認してください。
                    </p>
                  )}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-deep/20 px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss"
                    >
                      もう一度選ぶ
                    </button>
                    <ActionLink link={{ label: "イベント一覧を見る", href: "/events" }} variant="quiet" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

const homeTrustCards = [
  {
    title: "認定NPO法人",
    body: "認定特定非営利活動法人 JUON NETWORKとして、団体情報や所在地を確認できます。",
    source: "法人概要",
    href: officialLinks.organization,
    icon: ShieldCheck,
  },
  {
    title: "1998年設立",
    body: "全国大学生協連での検討を経て、1998年4月にJUON NETWORKとして創立されたお話。",
    source: "JUON NETWORKの創立",
    href: officialLinks.founding,
    icon: CalendarDays,
  },
  {
    title: "大学生協発のネットワーク",
    body: "大学生協の呼びかけから始まり、都市と農山漁村をつなぐ活動を続けています。",
    source: "JUON NETWORKとは",
    href: officialLinks.about,
    icon: Building2,
  },
  {
    title: "報告書・会員情報誌",
    body: "年次報告書、事業報告書、決算報告書、会員情報誌などを確認できます。",
    source: "法人概要・会員情報誌",
    href: officialLinks.organization,
    icon: FileText,
  },
] as const;

const officialSocialLinks = [
  { label: "Instagram", href: officialLinks.instagram, icon: Instagram },
  { label: "Facebook", href: officialLinks.facebook, icon: Facebook },
  { label: "X", href: officialLinks.x, icon: X },
  { label: "YouTube", href: officialLinks.youtube, icon: Youtube },
] as const;

const homeStorySteps = [
  {
    title: "気になる",
    body: "森や地域の活動に少しでも心が動いたら、まず入口を見てみる。",
    href: "/activities",
    ctaLabel: "活動を見てみる",
    icon: Leaf,
  },
  {
    title: "不安を減らす",
    body: "服装、持ち物、当日の流れを先に見て、参加前の迷いを軽くする。",
    href: "/first-time",
    ctaLabel: "初参加ガイドへ",
    icon: ShieldCheck,
  },
  {
    title: "活動を選ぶ",
    body: "森林、田畑、地域活動、日常の支援から、今の関心に近いものを探す。",
    href: "/activities",
    ctaLabel: "選び方を見る",
    icon: Trees,
  },
  {
    title: "日程を見る",
    body: "参加できそうな時期を、募集情報とあわせて確認する。",
    href: "/events",
    ctaLabel: "日程を見る",
    icon: CalendarDays,
  },
] as const;

function HomeStorySteps() {
  return (
    <section className="bg-forest-linen py-16 md:py-24" aria-labelledby="home-story-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeading
            eyebrow="Start story"
            title={
              <>
                気になった瞬間から、
                <br />
                参加まで。
              </>
            }
            body="まだ迷っている段階でも、一人でも、友だちとでも。参加までの流れを順番にたどれます。"
          />
          <div id="home-story-title" className="sr-only">参加までの流れを</div>

          <div className="grid gap-4 md:grid-cols-2">
            {homeStorySteps.map((step, index) => (
              <article
                key={step.title}
                className="group flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-paper p-6 transition hover:border-forest-leaf/45"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-forest-leaf/30 bg-forest-linen text-forest-leaf">
                    <step.icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold leading-snug text-forest-deep">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-5 grow leading-8 text-forest-muted">{step.body}</p>
                <a
                  href={hashFor(step.href)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                >
                  {step.ctaLabel}
                  <ArrowRight className="transition group-hover:translate-x-1" size={15} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeOriginTeaser() {
  return (
    <section className="bg-forest-paper py-12 md:py-16" aria-labelledby="home-origin-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 rounded-md border border-forest-deep/10 bg-forest-linen p-6 md:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Origin story</p>
            <h2 id="home-origin-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-4xl">
              <span className="block">一つの廃校から</span>
              <span className="block">始まったストーリー</span>
            </h2>
          </div>
          <div>
            <p className="leading-8 text-forest-muted">
              JUON NETWORKのストーリー。全ては、大学生協と農山村の出会い、阪神淡路大震災で生まれたつながり、学生が活動できる場をつくりたいという思いから始まった
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "誕生秘話を読む", href: "/about/story" }} />
              <ActionLink link={{ label: "はじめての方へ", href: "/first-time" }} variant="quiet" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ route }: { route: SiteRoute }) {
  const programRoutes = siteRoutes.filter((item) =>
    ["/first-time", "/activities", "/events", "/consult"].includes(item.path),
  );
  const voicePreviewCards = voiceInsightCards.slice(0, 3);

  return (
    <main>
      <PageBanner route={route} />
      <HomeStorySteps />
      <DiagnosticHelperSection />
      <HomeOriginTeaser />

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Start points"
            title="今の気持ちから選ぶ"
            body={
              <>
                <span className="block">初参加の不安、活動比較、日程確認、相談整理へ。</span>
                <span className="block">まだ決めきれていなくても、近い入口から進めます。</span>
              </>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {programRoutes.map((item) => (
              <RouteCard key={item.path} route={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="home-voices-title">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Voices preview</p>
              <h2 id="home-voices-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                <span className="block">参加した人の声から</span>
                <span className="block">雰囲気を知る</span>
              </h2>
              <p className="mt-5 leading-8 text-forest-muted">
                一人で行った人、仲間と行った人。活動前の不安に近い声から、現場の空気を感じられます。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ActionLink link={{ label: "参加者の声を見る", href: "/voices" }} />
                <ActionLink link={{ label: "最新募集を確認", href: officialLinks.recruitmentList, external: true }} variant="quiet" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {voicePreviewCards.map((card) => (
                <article key={card.title} className="flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-paper p-5">
                  <card.icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-gold">{card.label}</p>
                  <h3 className="mt-4 whitespace-pre-line text-lg font-semibold leading-snug text-forest-deep">{card.title}</h3>
                  <p className="mt-4 grow text-sm leading-7 text-forest-muted">{card.body}</p>
                  <a
                    href={hashFor(card.href)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                  >
                    この活動を見る
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24" aria-labelledby="home-trust-title">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Official sources</p>
              <h2 id="home-trust-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                どんな団体か、情報をチェック
              </h2>
              <p className="mt-5 leading-8 text-forest-muted">
                参加前に見ておきたい法人情報、創立の背景、報告書、活動レポートへのリンクはこちらです。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ActionLink link={{ label: "法人概要を見る", href: officialLinks.organization, external: true }} />
                <ActionLink link={{ label: "JUONとは", href: officialLinks.about, external: true }} variant="quiet" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {homeTrustCards.map((item) => (
                <article key={item.title} className="about-hover-card flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-paper p-5">
                  <item.icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-forest-deep">{item.title}</h3>
                  <p className="mt-3 grow text-sm leading-7 text-forest-muted">{item.body}</p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                    aria-label={`${item.source}の関連ページを開く`}
                  >
                    {item.source}
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-md border border-forest-deep/12 bg-forest-paper p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Official SNS</p>
                <h3 className="mt-2 text-xl font-semibold text-forest-deep">公式SNSはこちらから</h3>
                <p className="mt-2 text-sm leading-7 text-forest-muted">
                  日々の活動や最新のお知らせは、公式SNSでも確認できます。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {officialSocialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest-deep/20 px-4 py-3 text-sm font-semibold text-forest-deep transition hover:bg-forest-linen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
                    aria-label={`${item.label}のJUON NETWORK公式アカウントを開く`}
                  >
                    <item.icon size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="気になったら、まず活動を見てみる。"
        body="週末に行けそうな日程や、自分に近い関わり方をここから探せます。"
        primary={{ label: "気になる活動を探す", href: "/activities" }}
        secondary={{ label: "募集一覧で確認", href: officialLinks.recruitmentList, external: true }}
      />
    </main>
  );
}

const firstTimeFlowSteps = [
  { title: "集合", body: "集合場所、時間、受付方法は募集ページを確認", icon: MapPin },
  { title: "説明を聞く", body: "注意事項や作業内容を確認してから開始", icon: ShieldCheck },
  { title: "作業・体験", body: "体力や経験に合う作業を、無理のない範囲で体験", icon: Trees },
  { title: "休憩・交流", body: "昼食や交流はいちばんの楽しみ。内容は活動ごとに異なります", icon: Utensils },
  { title: "振り返り", body: "感想を伝え合い、片付けをして一日を締めくくる", icon: Info },
  { title: "解散", body: "帰るまでがボランティア。終了時刻の目安などは募集ページをご確認ください。", icon: CheckCircle2 },
];

const firstTimeConcernQuestions = [
  "初心者でも大丈夫ですか？",
  "何を持っていけばいいですか？",
  "一人でも参加できますか？",
  "参加費はどのくらいですか？",
];

const firstTimeSafetyGuides = [
  {
    title: "安全説明・保険",
    body: "作業前の説明、保険の扱い、けがをした場合の連絡方法は活動ごとに案内があります。",
    icon: ShieldCheck,
  },
  {
    title: "服装・持ち物",
    body: "長袖、長ズボン、歩きやすい靴、軍手、雨具、飲み物など、屋外活動に合った服装と持ち物を用意してください。",
    icon: FileText,
  },
  {
    title: "雨天時・集合解散",
    body: "中止判断、集合場所、解散時刻、交通手段は募集ページと案内を優先します。",
    icon: CalendarDays,
  },
  {
    title: "トイレ・着替え",
    body: "現地設備は活動場所で異なります。親子参加や長時間参加では事前確認が特に大切です。",
    icon: Info,
  },
  {
    title: "作業強度の見方",
    body: "能力を問うのではなく、どのくらい体を動かしたいかを基準に、無理のない活動を選びます。",
    icon: Trees,
  },
  {
    title: "一人参加・常連不安",
    body: "初参加で迷わないよう、当日の流れや相談先を先に確認してから参加先を選びます。",
    icon: Users,
  },
];

const studentYoungAdultEntries = [
  {
    title: "週末から試せる",
    body: "日帰りまたは一泊二日程度の活動から、ボランティアを経験しながら地域と関われます。",
    icon: CalendarDays,
    cta: { label: "直近日程を見る", href: "/events" },
  },
  {
    title: "人とのつながり\nを広げる",
    body: "若い参加者や職員、地域の人と関わりながら、就活で語れる経験にもなります。",
    icon: Users,
    cta: { label: "参加前の不安を見る", href: "/first-time" },
  },
  {
    title: "運営側の学びに進む",
    body: "インターン、学生会員、ボランティアリーダーなど、体験後にもう一歩深く関わる選択肢があります。",
    icon: Sprout,
    cta: { label: "学生向け情報を見る", href: officialLinks.students, external: true },
  },
] satisfies {
  title: string;
  body: string;
  icon: typeof CalendarDays;
  cta: CtaLink;
}[];

function FirstTimePage({ route }: { route: SiteRoute }) {
  const concernCards = firstTimeConcernQuestions
    .map((question) => faqItems.find((item) => item.question === question))
    .filter((item): item is (typeof faqItems)[number] => Boolean(item));
  const scrollToFlow = () => {
    const target = document.getElementById("first-time-flow");
    if (target) {
      scrollWithHeaderOffset(target);
    }
  };

  return (
    <main>
      <PageBanner route={route} />

      <section className="about-motion-surface bg-forest-linen py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-8 rounded-md border border-forest-deep/10 bg-forest-paper p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Start guide</p>
              <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                参加前にある不安
              </h2>
              <p className="mt-5 leading-8 text-forest-muted">
                このページでは、活動前に見ておきたい流れ、持ち物、体力、一人参加の不安をまとめています。実際の条件は各募集ページをご確認ください。
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToFlow}
                  aria-label="多くの活動で確認したい流れへ移動"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest-gold bg-forest-gold px-6 py-3 text-sm font-semibold text-forest-deep transition hover:bg-forest-goldlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
                >
                  <span>当日の流れを見る</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <ActionLink link={{ label: "週末の日程を見る", href: "/events" }} variant="quiet" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {route.sections.map((item, index) => {
                const Icon = [CheckCircle2, Leaf, Users][index] ?? CheckCircle2;
                return (
                  <article key={item.title} className="about-hover-card rounded-md border border-forest-deep/10 bg-forest-linen p-5">
                    <Icon className="mb-4 h-7 w-7 text-forest-leaf" aria-hidden="true" />
                    <h3 className="font-semibold text-forest-deep">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-forest-muted">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="first-time-flow" className="about-motion-surface bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            title="当日の流れ"
            body="活動ごとに内容は異なりますが、はじめての方がイメージしやすい流れの一例をご紹介"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {firstTimeFlowSteps.map((step, index) => (
              <article key={step.title} className="about-hover-card rounded-md border border-forest-deep/12 bg-forest-linen p-5 text-center">
                <p className="font-serif text-2xl text-forest-gold">{index + 1}</p>
                <step.icon className="mx-auto mt-3 h-10 w-10 text-forest-leaf" strokeWidth={1.7} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-forest-deep">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-forest-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Common concerns</p>
            <h2 className="font-serif text-4xl font-medium leading-tight text-forest-deep">よくある不安</h2>
            <p className="mt-5 leading-8 text-forest-muted">
              よくある質問をご紹介。費用、持ち物、集合場所、活動強度は各募集ページでご確認ください。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {concernCards.map((item) => (
              <article key={item.question} className="about-hover-card flex gap-4 rounded-md border border-forest-deep/10 bg-forest-paper p-5">
                <HelpCircle className="mt-1 h-6 w-6 shrink-0 text-forest-leaf" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-forest-deep">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-forest-muted">{item.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="first-time-students-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Students & young adults</p>
            <h2 id="first-time-students-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              学生・若手の方へ
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              ここでは、若い仲間が多いこと、短期イベント、インターン、学生会員などの関わり方をご紹介。はじめてでも入りやすいように、見るポイントをまとめています。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "学生向け情報を見る", href: officialLinks.students, external: true }} />
              <ActionLink link={{ label: "はじめての方向け情報", href: officialLinks.firstTime, external: true }} variant="quiet" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {studentYoungAdultEntries.map((item) => (
              <article key={item.title} className="about-hover-card flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-5">
                <item.icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <h3 className="whitespace-pre-line text-lg font-semibold text-forest-deep">{item.title}</h3>
                <p className="mt-3 grow text-sm leading-7 text-forest-muted">{item.body}</p>
                <div className="mt-5">
                  <ActionLink link={item.cta} variant="quiet" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="first-time-safety-title">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Safety checklist"
            title="参加前に確認したい安全と設備"
            body={
              <>
                <span className="block">活動場所や作業内容で条件は変わります。</span>
                <span className="block">ここでは、募集詳細で見ておきたいポイントを先にまとめています。</span>
              </>
            }
          />
          <div id="first-time-safety-title" className="sr-only">参加前に確認したい安全と設備</div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {firstTimeSafetyGuides.map((item) => (
              <article key={item.title} className="about-hover-card rounded-md border border-forest-deep/12 bg-forest-linen p-6">
                <item.icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-forest-deep">{item.title}</h3>
                <p className="mt-3 leading-7 text-forest-muted">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 rounded-md border border-forest-gold/35 bg-forest-cream p-5 text-sm leading-7 text-forest-muted">
            活動ごとに安全条件や保険の扱いは異なります。参加前には、各募集ページと問い合わせページで最新条件を確認してください。
          </p>
        </div>
      </section>

      <CtaBanner
        title="まだ不安が残るときは、問い合わせページへ。"
        body="活動名、日程、不安な点を整理してから、既存の問い合わせページへ進めます。"
        primary={{ label: "既存の問い合わせページへ", href: officialLinks.contact, external: true }}
        secondary={{ label: "気になる活動を探す", href: "/activities" }}
      />
    </main>
  );
}

function ActivitiesPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />
      <ActivityEntrySection />
      <RegionActivityMapSection />
      <PermanentInitiativesSection />
      <CtaBanner
        title="行けそうな日程を見つける。"
        body="活動の種類や地域感が見えてきたら、開催日順のイベント一覧で参加できる日を確認できます。"
        primary={{ label: "週末の日程を見る", href: "/events" }}
        secondary={{ label: "募集一覧で確認", href: officialLinks.recruitmentList, external: true }}
      />
    </main>
  );
}

const activityEntryCards = [
  {
    path: "/forest-school",
    image: "/assets/photos/generated/activity-forest-school.png",
    alt: "森林の楽校の森での活動風景",
    accent: "#2F6B4F",
    icon: Leaf,
  },
  {
    path: "/field-school",
    image: "/assets/photos/generated/activity-field-school.png",
    alt: "田畑の楽校の農作業風景",
    accent: "#8A6A32",
    icon: Sprout,
  },
  {
    path: "/regional",
    image: "/assets/photos/generated/activity-regional-block.png",
    alt: "地域ブロックの里山と集落の風景",
    accent: "#3E6F7F",
    icon: Users,
  },
  {
    path: "/waribashi",
    image: "/assets/photos/generated/activity-waribashi.png",
    alt: "樹恩割り箸の木材を活用した活動風景",
    accent: "#9A7A43",
    icon: Target,
  },
] as const;

const activityEntryPaths = activityEntryCards.map((card) => card.path);

type ActivityOptionalContent = {
  accentColor?: string;
  iconKey?: ActivityIconKey;
  cardText?: string;
  keywordIds?: DiagnosticKeywordId[];
  summary?: string;
  description?: string;
  detailLead?: string;
  image?: { src?: string; alt?: string };
  heroImage?: { src?: string; alt?: string };
  storySection?: ActivityStorySectionData;
  details?: ActivityDetailColumn[];
  detailBlocks?: { title: string; body: string; items?: string[]; icon?: string }[];
  cta?: CtaLink;
};

function getActivityOptionalContent(route: SiteRoute): ActivityOptionalContent {
  const raw = route as SiteRoute & {
    activity?: ActivityOptionalContent;
    activityContent?: ActivityOptionalContent;
    activityUi?: ActivityOptionalContent;
  };

  return raw.activityTheme ?? raw.activity ?? raw.activityContent ?? raw.activityUi ?? {};
}

function getActivityCardData(path: string) {
  return activityEntryCards.find((card) => card.path === path) ?? activityEntryCards[0];
}

function getActivityImage(route: SiteRoute) {
  const fallback = getActivityCardData(route.path);
  const optional = getActivityOptionalContent(route);
  const source = optional.image?.src ?? optional.heroImage?.src ?? fallback.image ?? route.banner.image.src;
  const alt = optional.image?.alt ?? optional.heroImage?.alt ?? fallback.alt ?? route.banner.image.alt;

  return { src: source, alt };
}

function getActivityIcon(iconKey: ActivityIconKey | undefined, fallbackIcon: typeof Leaf) {
  switch (iconKey) {
    case "trees":
      return Trees;
    case "sprout":
      return Sprout;
    case "map":
      return MapPin;
    case "utensils":
      return Utensils;
    default:
      return fallbackIcon;
  }
}

function ActivityKeywordChips({ keywordIds }: { keywordIds?: DiagnosticKeywordId[] }) {
  if (!keywordIds?.length) {
    return null;
  }

  return (
    <div role="group" aria-label="関連キーワード">
      <p className="sr-only">関連キーワード</p>
      <div className="flex flex-wrap gap-2">
        {keywordIds.map((keywordId) => (
          <span
            key={keywordId}
            className="inline-flex max-w-full items-center rounded-full border border-forest-deep/12 bg-forest-linen px-3 py-1.5 text-xs font-semibold leading-5 text-forest-deep"
          >
            {diagnosticKeywords[keywordId].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActivityEntrySection() {
  const entries = activityEntryPaths.map((path, index) => ({
    ...activityEntryCards[index],
    route: getRouteByPath(path),
  }));

  return (
    <section className="bg-forest-linen py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Program sites"
          title="どの入口から関わる？"
          body="森に入る、畑に触れる、地域に通う、日常から支える。気持ちに近い入口を選べます。"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {entries.map((entry, index) => {
            const optional = getActivityOptionalContent(entry.route);
            const Icon = getActivityIcon(optional.iconKey, entry.icon);
            const accent = optional.accentColor ?? entry.accent;
            const image = getActivityImage(entry.route);
            const description =
              optional.cardText ?? optional.summary ?? optional.description ?? entry.route.sections[0]?.body ?? entry.route.banner.lead;

            return (
              <article
                key={entry.route.path}
                className="activity-card-reveal group flex h-full min-h-[25rem] min-w-0 flex-col overflow-hidden rounded-md border border-forest-deep/12 bg-forest-paper shadow-elevation transition duration-300 hover:-translate-y-0.5 hover:border-forest-leaf/45"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <a
                  href={hashFor(entry.route.path)}
                  title={`${entry.route.title}の詳細ページへ移動`}
                  className="block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-forest-moss"
                  aria-label={`${entry.route.title}の詳細ページへ移動`}
                >
                  <figure className="relative aspect-[1.38] overflow-hidden bg-forest-deep">
                    <img
                      src={image.src}
                      alt={image.alt}
                      width={720}
                      height={522}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                    <figcaption
                      className="absolute left-0 top-0 flex min-h-12 w-full items-center gap-3 px-5 py-3 text-forest-linen"
                      style={{ backgroundColor: accent }}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                      <span className="min-w-0 font-serif text-xl font-medium leading-tight">{entry.route.title}</span>
                    </figcaption>
                  </figure>
                </a>
                <div className="flex grow flex-col p-5 md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">{entry.route.banner.eyebrow}</p>
                  <p className="mt-4 grow text-sm leading-7 text-forest-muted">{description}</p>
                  <div className="mt-5">
                    <ActivityKeywordChips keywordIds={optional.keywordIds} />
                  </div>
                  <a
                    href={hashFor(entry.route.path)}
                    className="mt-6 inline-flex min-h-10 w-fit items-center gap-2 border-b-2 pb-1 text-sm font-semibold text-forest-deep transition group-hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
                    style={{ borderColor: accent }}
                  >
                    この活動を見る
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const regionMapHotspots: Record<RegionActivityGroup["id"], { left: number; top: number; width: number; height: number }> = {
  "hokkaido-tohoku": { left: 53, top: 5, width: 32, height: 51 },
  "kanto-koshinetsu": { left: 48, top: 53, width: 24, height: 20 },
  "chubu-hokuriku": { left: 31, top: 51, width: 25, height: 20 },
  kansai: { left: 36, top: 65, width: 16, height: 17 },
  "chugoku-shikoku": { left: 20, top: 61, width: 20, height: 19 },
  kyushu: { left: 8, top: 72, width: 20, height: 23 },
};

const regionMapLabels: Record<RegionActivityGroup["id"], { left: number; top: number; label: string }> = {
  "hokkaido-tohoku": { left: 68, top: 30, label: "北海道・東北" },
  "kanto-koshinetsu": { left: 59, top: 63, label: "関東甲信越" },
  "chubu-hokuriku": { left: 43, top: 59, label: "中部北陸" },
  kansai: { left: 43, top: 72, label: "関西" },
  "chugoku-shikoku": { left: 28, top: 70, label: "中国四国" },
  kyushu: { left: 17, top: 82, label: "九州" },
};

function RegionActivityMapSection() {
  return (
    <section className="bg-forest-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Area guide"
          title="地域で探す"
          body="日程だけでなく、「どの地域なら行けそうか」からも探せます。"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-md border border-forest-deep/12 bg-forest-linen p-4 md:p-6">
            <div className="relative mx-auto w-full max-w-[34rem]" aria-label="地域ブロック地図">
              <img
                src="/assets/illustrations/juon-region-map.png"
                alt="JUON NETWORKの活動地域を7地域に分けた日本地図"
                width={960}
                height={760}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full select-none"
                draggable={false}
              />
              {regionActivityGroups.map((region) => {
                const hotspot = regionMapHotspots[region.id];
                const mapLabel = regionMapLabels[region.id];

                return (
                  <a
                    key={region.id}
                    href={hashFor(`/events?region=${region.id}`)}
                    aria-label={`${region.label}のイベント一覧へ移動`}
                    title={`${region.label}のイベント一覧へ`}
                    className="group absolute rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss"
                    style={{
                      left: `${hotspot.left}%`,
                      top: `${hotspot.top}%`,
                      width: `${hotspot.width}%`,
                      height: `${hotspot.height}%`,
                    }}
                  >
                    <span className="absolute inset-0 rounded-sm border border-transparent bg-forest-leaf/0 transition group-hover:border-forest-leaf/65 group-hover:bg-forest-leaf/12 group-focus-visible:border-forest-moss group-focus-visible:bg-forest-gold/18" />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-forest-paper/80 bg-forest-paper/86 px-2.5 py-1 text-[0.62rem] font-semibold leading-none text-forest-deep shadow-sm transition group-hover:bg-forest-deep group-hover:text-forest-linen sm:text-xs"
                      style={{
                        left: `${((mapLabel.left - hotspot.left) / hotspot.width) * 100}%`,
                        top: `${((mapLabel.top - hotspot.top) / hotspot.height) * 100}%`,
                      }}
                    >
                      {mapLabel.label}
                    </span>
                    <span className="sr-only">{region.label}</span>
                  </a>
                );
              })}
            </div>
            <p className="mt-5 text-sm leading-7 text-forest-muted">
              正確な都道府県地図ではなく、参加を検討しやすいよう地域ブロック単位でまとめています。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {regionActivityGroups.map((region) => (
              <RegionActivityCard key={region.id} region={region} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RegionActivityCard({ region }: { region: RegionActivityGroup }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Region</p>
          <h3 className="mt-2 text-xl font-semibold text-forest-deep">{region.label}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-forest-leaf/35 bg-forest-paper px-3 py-2 text-xs font-semibold text-forest-leaf">
          {region.eventCountLabel}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-forest-leaf">{region.areaNote}</p>
      <p className="mt-3 grow leading-7 text-forest-muted">{region.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {region.themes.map((theme) => (
          <span key={theme} className="rounded-full border border-forest-deep/10 bg-forest-paper px-3 py-1.5 text-xs font-semibold text-forest-deep">
            {theme}
          </span>
        ))}
      </div>
      <a
        href={hashFor(`/events?region=${region.id}`)}
        className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 border border-forest-deep/20 px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss sm:w-fit"
      >
        この地域の日程を見る
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </article>
  );
}

function PermanentInitiativesSection() {
  return (
    <section className="bg-forest-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <SectionHeading
          title="日常でもできること"
          body="現地に行く以外にも、日常の選択から森と地域を支える関わり方があります。"
        />
        <div className="mt-10 grid gap-6">
          {permanentInitiatives.map((item) => (
            <PermanentInitiativeCard key={item.href} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PermanentInitiativeCard({ item }: { item: PermanentInitiative }) {
  return (
    <article className="grid overflow-hidden rounded-md border border-forest-deep/12 bg-forest-linen shadow-elevation lg:grid-cols-[0.95fr_1.05fr]">
      <img src={item.image.src} alt={item.image.alt} width={720} height={540} loading="lazy" decoding="async" className="h-full min-h-[260px] w-full object-cover" />
      <div className="flex flex-col justify-center p-6 md:p-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-forest-gold">{item.category}</p>
            <h3 className="mt-3 font-serif text-3xl font-medium leading-tight text-forest-deep md:text-4xl">
              {item.title}
            </h3>
          </div>
          <span className="w-fit shrink-0 rounded-full border border-forest-leaf/35 bg-forest-paper px-3 py-2 text-xs font-semibold text-forest-leaf">
            詳細ページ確認
          </span>
        </div>

        <p className="mt-5 text-base leading-8 text-forest-muted">{item.description}</p>
        <ul className="mt-5 grid gap-3 text-sm leading-7 text-forest-muted">
          {item.points.map((point) => (
            <li key={point} className="border-l-2 border-forest-gold pl-4">
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm font-semibold text-forest-deep">{item.statusNote}</p>

        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.title}の詳細を見る`}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 border border-forest-deep bg-forest-deep px-5 py-3 text-sm font-semibold text-forest-linen transition hover:bg-forest-leaf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss sm:w-fit"
        >
          詳細を見る
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

const forestSchoolExperienceCards = [
  {
    title: "下刈り",
    body: "草を刈り、苗木に光を届ける",
    image: "/assets/photos/events/pdf-kaminosen-forest.png",
    icon: Sprout,
  },
  {
    title: "間伐",
    body: "森に光を入れ、元気な森林へ",
    image: "/assets/photos/events/pdf-kazenotani-forest.png",
    icon: Trees,
  },
  {
    title: "自然散策",
    body: "森の変化を自分の目で見る",
    image: "/assets/photos/satoyama-walk-no-face.png",
    icon: Leaf,
  },
  {
    title: "地域の人との交流",
    body: "地域の暮らしを知る",
    image: "/assets/photos/events/pdf-forest-volunteer-tokyo.png",
    icon: Users,
  },
];

const forestSchoolReasonCards = [
  { title: "体力に合わせて参加", body: "作業内容や体力目安は募集ごとに異なります。無理のない範囲で参加できるか募集詳細で確認してください。", icon: Trees },
  { title: "説明を聞いて作業", body: "現地スタッフなどの案内に沿って進めるため、初参加でも流れを確認しやすい構成です。", icon: Users },
  { title: "持ち物リストあり", body: "服装、靴、雨具、飲み物など、活動ごとの持ち物を事前にチェックできます。", icon: CheckCircle2 },
  { title: "募集詳細で最新確認", body: "天候や現地状況で内容が変わるため、最終判断は募集詳細を優先します。", icon: ExternalLink },
];

const forestSchoolBelongings = ["長袖・長ズボン", "しっかりした靴", "軍手", "雨具", "飲み物・タオル"];

function ForestSchoolLandingPage({ route }: { route: SiteRoute }) {
  const optional = getActivityOptionalContent(route);
  const forestItems = getSortedRecruitmentItems(
    recruitmentSnapshot.items.filter((item) => item.theme === "森林の楽校" || item.category === "森林の楽校"),
  );
  const months = Array.from(new Set(forestItems.map((item) => item.monthLabel.replace("2026年", "")))).slice(0, 3);
  const dayTypes = Array.from(new Set(forestItems.map((item) => (item.endDate ? "宿泊あり" : "日帰り"))));
  const heroImage = route.banner.image;
  const scrollToBelongings = () => {
    const target = document.getElementById("forest-school-belongings");
    if (target) {
      scrollWithHeaderOffset(target);
    }
  };

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-forest-deep text-forest-linen">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          width={1600}
          height={1000}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          style={{ objectPosition: route.banner.imagePosition ?? "center" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,44,31,.92),rgba(9,44,31,.68)_42%,rgba(9,44,31,.14)),linear-gradient(180deg,rgba(9,44,31,.10),rgba(9,44,31,.40))]" />
        <div className="mx-auto min-h-[560px] max-w-7xl px-5 py-16 md:min-h-[650px] md:px-10 md:py-20 lg:px-16">
          <div className="max-w-[1180px]">
            <p className="mb-5 inline-flex items-center rounded-full bg-forest-leaf px-5 py-2 text-sm font-semibold text-forest-linen">
              森林の楽校
            </p>
            <h1 className="banner-title max-w-[11em] font-serif text-[2.35rem] font-medium leading-[1.12] tracking-normal md:max-w-[1180px] md:text-[4rem]">
              森を守る作業を、
              <br className="md:hidden" />
              体で知る。
            </h1>
            <p className="mt-6 max-w-[21rem] text-sm leading-7 text-forest-linen/92 md:max-w-2xl md:text-lg md:leading-8">
              下刈りや間伐、自然散策、地域の人との交流を通じて、日本の森林の今を学ぶ体験プログラムがあなたを待っている。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["初参加OK", "参加条件を確認", "無理なく検討", "各地で開催"].map((item) => (
                <span key={item} className="rounded-full bg-ui-support-leaf px-4 py-2 text-sm font-semibold text-forest-deep sm:px-5">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "直近のスケジュールを見る", href: "/events" }} />
              <button
                type="button"
                onClick={scrollToBelongings}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest-linen px-6 py-3 text-sm font-semibold text-forest-linen transition hover:bg-forest-linen hover:text-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
              >
                <span>持ち物を確認する</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="about-motion-surface bg-forest-linen py-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 md:px-10 lg:px-16 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-md border border-forest-deep/10 bg-forest-paper p-5 md:p-7">
            <h2 className="flex items-center gap-3 font-serif text-2xl font-medium text-forest-deep md:text-3xl">
              <Sprout className="h-7 w-7 text-forest-leaf" aria-hidden="true" />
              森林の楽校で体験できること
            </h2>
            <div className="mt-5">
              <ActivityKeywordChips keywordIds={optional.keywordIds} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {forestSchoolExperienceCards.map((card) => (
                <article key={card.title} className="about-hover-card overflow-hidden rounded-md border border-forest-deep/10 bg-forest-linen">
                  <img src={card.image} alt={`${card.title}に関する過去活動または活動イメージ`} width={720} height={540} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4 text-center">
                    <card.icon className="mx-auto mb-3 h-12 w-12 rounded-full bg-forest-leaf p-3 text-forest-linen" aria-hidden="true" />
                    <h3 className="text-xl font-semibold text-forest-deep">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-forest-muted">{card.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-md border border-ui-line-hairline bg-ui-surface-sunk p-5 md:p-7">
            <h2 className="flex items-center gap-3 font-serif text-2xl font-medium text-forest-deep md:text-3xl">
              <ShieldCheck className="h-7 w-7 text-forest-leaf" aria-hidden="true" />
              はじめてでも参加しやすい理由
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {forestSchoolReasonCards.map((card) => (
                <div key={card.title} className="rounded-md bg-forest-linen p-4 text-center">
                  <card.icon className="mx-auto mb-3 h-9 w-9 text-forest-leaf" aria-hidden="true" />
                  <h3 className="font-semibold text-forest-deep">{card.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-forest-muted">{card.body}</p>
                </div>
              ))}
            </div>
            <div id="forest-school-belongings" className="mt-5 rounded-md border border-forest-gold/30 bg-forest-cream p-4">
              <h3 className="font-semibold text-forest-deep">基本の持ち物</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {forestSchoolBelongings.map((item) => (
                  <li key={item} className="flex items-center gap-2 rounded-md bg-forest-linen px-3 py-2 text-sm font-semibold text-forest-deep">
                    <CheckCircle2 className="h-4 w-4 text-forest-leaf" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-6 text-forest-muted">実際の持ち物は各募集ページの指定を優先してください。</p>
            </div>
          </article>
        </div>
      </section>

      <section className="about-motion-surface bg-forest-paper py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-5 lg:grid-cols-[0.24fr_1fr]">
            <aside className="space-y-8">
              <div>
                <h2 className="border-b border-dashed border-forest-leaf pb-3 font-serif text-2xl font-medium text-forest-deep">全国の開催スケジュール</h2>
                <p className="mt-5 text-sm leading-7 text-forest-muted">募集一覧から森林の楽校の募集だけを抜粋しています。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {months.map((month) => <span key={month} className="rounded-full bg-forest-linen px-5 py-2 font-semibold text-forest-deep">{month}</span>)}
                {dayTypes.map((type) => <span key={type} className="rounded-full bg-forest-linen px-5 py-2 font-semibold text-forest-deep">{type}</span>)}
              </div>
              <a href={recruitmentSnapshot.officialListUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
                募集詳細で確認
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </aside>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {forestItems.slice(0, 6).map((item) => (
                <RecruitmentCard key={`forest-school-${item.href}-${item.startDate}`} item={item} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="森林の楽校の最新情報を確認する"
        body="ここに載っている募集情報はある時点のもの。開催可否、持ち物、集合場所は募集詳細でチェックしてね。"
        primary={{ label: "イベント一覧へ", href: "/events" }}
        secondary={{ label: "募集一覧を開く", href: recruitmentSnapshot.officialListUrl, external: true }}
      />
    </main>
  );
}

const fieldSchoolExperienceCards = [
  {
    title: "季節の農作業",
    body: "植え付け、草取り、収穫など、時期に合わせた作業を体験します。",
    icon: Sprout,
  },
  {
    title: "食と暮らし",
    body: "作物が食卓へ届くまでの背景や、地域の暮らしの工夫に触れます。",
    icon: Utensils,
  },
  {
    title: "里山の手入れ",
    body: "田畑だけでなく、水路、畦、周辺の里山環境も活動の視野に入ります。",
    icon: Leaf,
  },
  {
    title: "地域の人と作る",
    body: "受け入れ地域の人と同じ場で作業し、交流しながら関係をつくります。",
    icon: Users,
  },
];

const fieldSchoolCheckItems = [
  "汚れてもよい服装、帽子、軍手、長靴や歩きやすい靴を確認",
  "暑さ、雨、日差しなど天候による作業変更を募集詳細で確認",
  "収穫や食事交流の有無は開催回ごとに異なるため事前確認",
  "農作業量は時期や現地状況で変わるため、無理のない範囲で参加",
];

const regionalActivityFocusCards = [
  {
    title: "通い続ける関係",
    body: "単発の体験だけでなく、同じ地域へ何度か通いながら変化を見守るきっかけになります。",
    icon: CalendarDays,
  },
  {
    title: "地域ごとの課題",
    body: "森、田畑、暮らし、祭り、交流会など、地域ごとに異なるテーマから関われます。",
    icon: MapPin,
  },
  {
    title: "受け入れ側を知る",
    body: "活動内容だけでなく、現地の人、団体、集落の背景を理解して参加します。",
    icon: Building2,
  },
  {
    title: "次の参加へつなげる",
    body: "一度参加した後に、別の日程、別地域、支援や紹介へ広げていけます。",
    icon: ArrowRight,
  },
];

const regionalActivityCheckItems = [
  "地域ブロックごとに集合場所、交通、宿泊有無が大きく変わります",
  "交流会、作業、講座など活動形式が混ざるため、募集ページで目的を確かめてください",
  "継続参加が前提ではありません。まず一回参加して相性を見る形でも検討できます",
  "最新募集がない地域は、募集一覧や問い合わせで追加情報を確認してください",
];

function ActivityDepthSection({ route }: { route: SiteRoute }) {
  if (route.path !== "/field-school" && route.path !== "/regional") {
    return null;
  }

  const isFieldSchool = route.path === "/field-school";
  const cards = isFieldSchool ? fieldSchoolExperienceCards : regionalActivityFocusCards;
  const checkItems = isFieldSchool ? fieldSchoolCheckItems : regionalActivityCheckItems;
  const title = isFieldSchool ? "田畑の楽校で見えること" : "地域の活動で育つ関わり";
  const body = isFieldSchool
    ? "農作業だけで終わらせず、食、暮らし、里山、受け入れ地域との関係まで見えるようにまとめました。"
    : "地域の活動は一回の作業内容だけでは伝わりにくいため、継続性、地域差、参加後の広がりを先に確認できるようにします。";
  const noteTitle = isFieldSchool ? "参加前に確認したいこと" : "地域活動を選ぶ前に確認したいこと";
  const relatedItems = isFieldSchool
    ? getSortedRecruitmentItems(
        recruitmentSnapshot.items.filter((item) => item.theme === route.title || item.category === route.title),
      ).slice(0, 3)
    : [];

  return (
    <section className="bg-forest-linen py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">
              {isFieldSchool ? "Field guide" : "Local guide"}
            </p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">{title}</h2>
            <p className="mt-5 leading-8 text-forest-muted">{body}</p>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((card) => (
                <article key={card.title} className="about-hover-card rounded-md border border-forest-deep/12 bg-forest-paper p-5">
                  <card.icon className="mb-4 h-9 w-9 text-forest-leaf" strokeWidth={1.8} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-forest-deep">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-forest-muted">{card.body}</p>
                </article>
              ))}
            </div>

            <article className="rounded-md border border-forest-gold/30 bg-forest-cream p-5">
              <h3 className="text-lg font-semibold text-forest-deep">{noteTitle}</h3>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-forest-muted">
                {checkItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-forest-leaf" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            {isFieldSchool && relatedItems.length ? (
              <article className="rounded-md border border-forest-deep/12 bg-forest-paper p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Current entries</p>
                    <h3 className="text-lg font-semibold text-forest-deep">募集中の田畑の楽校</h3>
                  </div>
                  <a
                    href={hashFor("/events")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                  >
                    イベント一覧へ
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
                <div className="mt-5 grid gap-3">
                  {relatedItems.map((item) => (
                    <a
                      key={`${item.href}-${item.startDate}`}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col gap-2 rounded-md border border-forest-deep/10 bg-forest-linen p-4 transition hover:border-forest-leaf/45 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold text-forest-deep">{item.title}</span>
                      <span className="text-sm text-forest-muted">{item.date}</span>
                    </a>
                  ))}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityStorySection({ story, accent }: { story: ActivityStorySectionData; accent: string }) {
  return (
    <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="activity-story-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">{story.eyebrow}</p>
            <h2 id="activity-story-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              {story.title}
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">{story.lead}</p>
            <div className="mt-7">
              <ActionLink link={story.cta} variant="quiet" />
            </div>
          </div>
          <div className="grid gap-4">
            {story.scenes.map((scene, index) => (
              <article key={scene.key} className="rounded-md border border-forest-deep/12 bg-forest-linen p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-forest-linen"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold leading-tight text-forest-deep">{scene.title}</h3>
                    <p className="mt-3 leading-8 text-forest-muted">{scene.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityDetailPage({ route }: { route: SiteRoute }) {
  const isWaribashi = route.path === "/waribashi";
  const isRegional = route.path === "/regional";
  const optional = getActivityOptionalContent(route);
  const cardData = getActivityCardData(route.path);
  const detailImage = getActivityImage(route);
  const accent = optional.accentColor ?? cardData.accent;
  const detailBlocks = optional.details?.length
    ? optional.details
    : optional.detailBlocks?.length
      ? optional.detailBlocks.map((block, index) => ({
          key: index === 0 ? "why" : index === 1 ? "what" : "before",
          title: block.title,
          items: block.items?.length ? block.items : [block.body],
        }))
      : [
        { key: "why", title: "なぜ必要か", items: [route.sections[0]?.body ?? route.banner.lead] },
        { key: "what", title: "何をするか", items: [route.sections[1]?.body ?? route.banner.lead] },
        {
          key: "before",
          title: "参加前に知ること",
          items: [
            isWaribashi
              ? "詳細ページで利用方法、導入先、最新の取り組みを確認してください。"
              : "服装、持ち物、集合場所、募集状況は参加前に募集詳細で確認してください。",
          ],
        },
      ];
  const relatedItems = isWaribashi || isRegional
    ? []
    : getSortedRecruitmentItems(
        recruitmentSnapshot.items.filter((item) => item.theme === route.title || item.category === route.title),
      );

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-forest-deep text-forest-linen">
        <img
          src={detailImage.src}
          alt={detailImage.alt}
          width={1600}
          height={1000}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          style={{ objectPosition: route.banner.imagePosition ?? "center" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,36,25,.92),rgba(8,36,25,.66)_46%,rgba(8,36,25,.18)),linear-gradient(180deg,rgba(8,36,25,.24),rgba(8,36,25,.56))]" />
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-end gap-10 px-5 py-14 md:min-h-[620px] md:px-10 md:py-20 lg:grid-cols-[0.88fr_0.62fr] lg:px-16">
          <div className="activity-hero-copy max-w-3xl">
            <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs font-semibold text-forest-linen/78" aria-label="パンくず">
              <a href="#/" className="underline decoration-forest-moss/80 underline-offset-4">ホーム</a>
              <span aria-hidden="true">/</span>
              <a href="#/activities" className="underline decoration-forest-moss/80 underline-offset-4">活動一覧</a>
              <span aria-hidden="true">/</span>
              <span>{route.title}</span>
            </nav>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss">{route.banner.eyebrow}</p>
            <h1 className="max-w-[18rem] font-serif text-4xl font-medium leading-[1.12] tracking-normal sm:max-w-3xl md:text-7xl">
              {route.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-forest-linen/92">
              {optional.detailLead ?? route.banner.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={optional.cta ?? route.banner.primaryCta} variant="primary" />
              <ActionLink link={{ label: "活動一覧へ戻る", href: "/activities" }} variant="secondary" />
            </div>
          </div>
          <div className="hidden rounded-md border border-forest-linen/24 bg-forest-deep/52 p-5 backdrop-blur-md lg:block">
            <p className="text-sm font-semibold text-forest-moss">Activity guide</p>
            <p className="mt-3 text-sm leading-7 text-forest-linen/82">
              活動の目的、体験内容、参加前の確認事項をこのページにまとめています。最新の募集状況は募集詳細でご確認ください。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Overview</p>
            <h2
              className="max-w-full font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl"
              style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
            >
              <span className="block">{isWaribashi ? "なぜ" : "参加の前に、"}</span>
              <span className="block">{isWaribashi ? "樹恩割り箸なのかを知る" : "活動の輪郭をつかむ"}</span>
            </h2>
          </div>
          <div className="grid content-start gap-5">
            <p className="text-lg leading-9 text-forest-muted">{route.banner.lead}</p>
            <ActivityKeywordChips keywordIds={optional.keywordIds} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink link={optional.cta ?? route.banner.primaryCta} variant="quiet" />
              {route.banner.secondaryCta ? <ActionLink link={route.banner.secondaryCta} variant="quiet" /> : null}
            </div>
          </div>
        </div>
      </section>

      {optional.storySection ? <ActivityStorySection story={optional.storySection} accent={accent} /> : null}
      {isWaribashi ? <WaribashiVideoSection /> : null}
      <ActivityDepthSection route={route} />

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            title="この活動で見るポイント"
            body="なぜ必要か、何をするか、参加前に知っておきたいことをまとめています。"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {detailBlocks.slice(0, 3).map((section, index) => {
              const Icon = section.key === "what" ? Target : section.key === "before" ? Info : Leaf;

              return (
              <article key={`${section.title}-${index}`} className="activity-info-card flex h-full min-w-0 flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6 md:p-7">
                <span
                  className="mb-6 grid h-14 w-14 place-items-center rounded-full text-forest-linen"
                  style={{ backgroundColor: accent }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="border-b pb-4 font-serif text-2xl font-medium leading-tight text-forest-deep" style={{ borderColor: accent }}>
                  {section.title}
                </h3>
                <ul className="mt-5 grid grow gap-3 leading-8 text-forest-muted">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-3 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      {isWaribashi ? (
        <PermanentInitiativesSection />
      ) : isRegional ? (
        <RegionActivityMapSection />
      ) : (
        <RelatedRecruitmentPreview route={route} items={relatedItems} />
      )}

      <CtaBanner
        title="ほかの活動サイトも見る"
        body="活動一覧に戻ると、森林の楽校、田畑の楽校、地域ブロック、樹恩割り箸を切り替えて見られます。"
        primary={{ label: "活動一覧へ戻る", href: "/activities" }}
        secondary={{ label: "日程から探す", href: "/events" }}
      />
    </main>
  );
}

function WaribashiVideoSection() {
  const videoUrl = "https://www.youtube-nocookie.com/embed/5DYiwuwLUuI";
  const watchUrl = "https://youtu.be/5DYiwuwLUuI";

  return (
    <section className="bg-forest-linen pb-16 md:pb-24" aria-labelledby="waribashi-video-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 border-y border-forest-deep/12 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">
              <Youtube className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              Related movie
            </p>
            <h2
              id="waribashi-video-title"
              className="max-w-full font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl"
              style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
            >
              <span className="block">動画で見る</span>
              <span className="block">樹恩割り箸</span>
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              割り箸を通じて国産材や森との関わりを知るための関連動画です。ページ内で再生できない場合はYouTubeで直接ご覧ください。
            </p>
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-forest-deep/20 px-5 py-2.5 text-sm font-semibold text-forest-deep transition hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
            >
              YouTubeで開く
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="overflow-hidden rounded-md border border-forest-deep/12 bg-forest-deep shadow-[0_18px_44px_rgba(22,45,32,.12)]">
            <iframe
              className="aspect-video h-auto w-full"
              src={videoUrl}
              title="樹恩割り箸に関連するYouTube動画"
              allow="encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RelatedRecruitmentPreview({ route, items }: { route: SiteRoute; items: RecruitmentItem[] }) {
  return (
    <section className="bg-forest-linen py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">募集ピックアップ</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              {route.title}の募集
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-forest-muted">
            最終確認日: <strong className="text-forest-deep">{recruitmentSnapshot.checkedAt}</strong>。募集状況は募集詳細で確認してください。
          </p>
        </div>

        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {items.slice(0, 3).map((item) => (
              <RecruitmentCard key={`${route.path}-${item.href}-${item.startDate}`} item={item} compact />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-md border border-forest-deep/12 bg-forest-paper p-7">
            <h3 className="text-xl font-semibold text-forest-deep">現在この活動種別の募集は表示していません</h3>
            <p className="mt-4 leading-8 text-forest-muted">
              最新の追加募集は募集一覧、またはイベント一覧で確認してください。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

type EventStayFilter = "day" | "overnight";

type EventFilterState = {
  region?: string;
  month?: string;
  theme?: string;
  stay?: EventStayFilter;
};

const eventStayOptions: { value: EventStayFilter; label: string }[] = [
  { value: "day", label: "日帰り" },
  { value: "overnight", label: "宿泊あり" },
];

function eventsFilterHref(filters: EventFilterState) {
  const params = new URLSearchParams();
  if (filters.region) params.set("region", filters.region);
  if (filters.month) params.set("month", filters.month);
  if (filters.theme) params.set("theme", filters.theme);
  if (filters.stay) params.set("stay", filters.stay);
  const query = params.toString();
  return query ? `#/events?${query}` : "#/events";
}

function EventsPage({ route, routePath }: { route: SiteRoute; routePath: string }) {
  const params = routeSearchParams(routePath);
  const selectedRegionId = params.get("region");
  const selectedMonth = params.get("month") ?? undefined;
  const selectedTheme = params.get("theme") ?? undefined;
  const selectedStay = params.get("stay") === "day" || params.get("stay") === "overnight"
    ? (params.get("stay") as EventStayFilter)
    : undefined;
  const selectedRegion = regionActivityGroups.find((region) => region.id === selectedRegionId);
  const selectedRegionFilterIds = selectedRegion ? getRegionFilterIds(selectedRegion.id) : [];
  const selectedFilters: EventFilterState = {
    region: selectedRegion?.id,
    month: selectedMonth,
    theme: selectedTheme,
    stay: selectedStay,
  };
  const monthOptions = Array.from(new Set(recruitmentSnapshot.items.map((item) => item.monthLabel)));
  const themeOptions = Array.from(new Set(recruitmentSnapshot.items.map((item) => item.theme)));
  const visibleItems = getSortedRecruitmentItems(
    recruitmentSnapshot.items.filter((item) => {
      const regionMatch = selectedRegion
        ? item.regionIds.some((regionId) => selectedRegionFilterIds.includes(regionId))
        : true;
      const monthMatch = selectedMonth ? item.monthLabel === selectedMonth : true;
      const themeMatch = selectedTheme ? item.theme === selectedTheme || item.category === selectedTheme : true;
      const stayMatch = selectedStay === "day" ? !item.endDate : selectedStay === "overnight" ? Boolean(item.endDate) : true;

      return regionMatch && monthMatch && themeMatch && stayMatch;
    }),
  );
  const upcomingItems = visibleItems
    .filter((item) => item.startDate >= recruitmentSnapshot.checkedAt)
    .slice(0, 3);
  const monthlyGroups = groupRecruitmentByMonth(visibleItems);
  const activeFilterLabels = [
    selectedRegion?.label,
    selectedMonth,
    selectedTheme,
    selectedStay ? eventStayOptions.find((item) => item.value === selectedStay)?.label : undefined,
  ].filter((label): label is string => Boolean(label));

  return (
    <main>
      <PageBanner route={route} />
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            title="行けそうな日から見つける"
            body="募集一覧の1ページ目から、開催日と地域が分かる募集情報を抜粋しています。気になるものは募集詳細で最新状況を確認してください。"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {route.sections.map((item, index) => (
              <article key={item.title} className="rounded-md border border-forest-deep/12 bg-forest-paper p-6">
                {[CalendarDays, MapPin, Leaf][index] ? (
                  (() => {
                    const Icon = [CalendarDays, MapPin, Leaf][index];
                    return <Icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />;
                  })()
                ) : null}
                <h3 className="text-lg font-semibold text-forest-deep">{item.title}</h3>
                <p className="mt-3 leading-7 text-forest-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <RecruitmentSection
        title={
          activeFilterLabels.length ? (
            `絞り込み結果: ${activeFilterLabels.join(" / ")}`
          ) : (
            <>
              いま参加できる
              <br />
              イベントをチェック
            </>
          )
        }
        id="event-list"
        items={visibleItems}
        upcomingItems={upcomingItems}
        monthlyGroups={monthlyGroups}
        selectedRegion={selectedRegion}
        selectedFilters={selectedFilters}
        monthOptions={monthOptions}
        themeOptions={themeOptions}
      />
    </main>
  );
}

function getRegionFilterIds(regionId: string) {
  if (regionId === "hokkaido-tohoku") {
    return ["hokkaido-tohoku", "hokkaido", "tohoku"];
  }

  return [regionId];
}

function AboutPage({ route }: { route: SiteRoute }) {
  const visionItems = [
    "自然を持続的に活用できる社会",
    "農山漁村が都市とともに持続的に存在できる社会",
    "若者が人と自然、都市と農山漁村をつなぐ担い手として活躍できる社会",
  ];

  const pillars = [
    {
      title: "交流と保全",
      body: "森林の楽校・田畑の楽校を通じて、都市と農山漁村の交流と森林・田畑の保全を進めます。",
    },
    {
      title: "人材育成",
      body: "講座や検定を通じて、森林や里山に関わり続けるボランティア人材を育てます。",
    },
    {
      title: "国産品の推進",
      body: "樹恩割り箸などを通じて、国産材や地産地消の意義を日常の選択に結びます。",
    },
  ];

  return (
    <main>
      <PageBanner route={route} />

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Mission</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              都市と農山漁村が支え合う社会をつくる
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="text-lg leading-9 text-forest-muted">
              JUON NETWORKは、森林などをめぐる体験・交流・応援の活動を通じて、都市と農山漁村が支え合うネットワークを広げる認定NPO法人です。
            </p>
            <p className="leading-8 text-forest-muted">
              活動の種類は、森林整備、農作業、講座、地域交流などさまざまです。参加者が自然や地域に触れ、その後も関わり続けられる関係を育てることを大切にしています。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Vision"
            title="JUON NETWORKが目指すこと"
            body="人、自然、都市、農山漁村が一方通行ではなく支え合う関係を、現場での体験と継続的な参加から育てます。"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {visionItems.map((item, index) => (
              <article key={item} className="rounded-md border border-forest-deep/12 bg-forest-linen p-7">
                <Target className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <p className="mb-3 font-serif text-2xl text-forest-gold">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="text-lg font-semibold leading-8 text-forest-deep">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading title="事業の三本柱" body="体験、学び、日常の選択をつなげることで、自然と地域への関わりを続けやすくします。" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-md border-l-4 border-forest-leaf bg-forest-paper p-7">
                <h3 className="text-xl font-semibold text-forest-deep">{pillar.title}</h3>
                <p className="mt-4 leading-8 text-forest-muted">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Name</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              「樹恩」に込めた思い
            </h2>
          </div>
          <div className="rounded-md border border-forest-deep/12 bg-forest-linen p-6 md:p-8">
            <p className="leading-8 text-forest-muted">
              「樹恩」という言葉には、木々の恵みに感謝し、都市と農山漁村の人々をネットワークで結んでいく意志が込められています。
            </p>
            <p className="mt-4 leading-8 text-forest-muted">
              団体名の由来や詳しい歩みは、団体紹介ページに載っています。
            </p>
            <a
              href="https://juon.or.jp/about/index.html"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
            >
              「JUON NETWORKとは」を開く
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <StaffSection />

      <CtaBanner
        title="活動を知り、関わり方を選ぶ"
        body="JUON NETWORKの活動に関心を持ったら、募集中の活動や問い合わせ窓口から次の一歩を踏み出せます。"
        primary={{ label: "活動紹介を見る", href: "/activities" }}
        secondary={{ label: "問い合わせる", href: "/contact" }}
      />
    </main>
  );
}

function AboutFreshPanel({ title, body, icon: Icon }: { title: string; body: string; icon: typeof Leaf }) {
  return (
                <article className="flex h-full gap-4 rounded-md border border-forest-deep/10 bg-ui-support-leaf p-5">
      <Icon className="mt-1 h-6 w-6 shrink-0 text-forest-leaf" aria-hidden="true" />
      <div>
        <h3 className="font-semibold text-forest-deep">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-forest-muted">{body}</p>
      </div>
    </article>
  );
}

function AboutReassuranceBadges({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
                      <span key={item} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-forest-leaf/25 bg-ui-support-leaf px-4 py-2 text-xs font-semibold text-forest-deep">
          <ShieldCheck className="h-4 w-4 text-forest-leaf" aria-hidden="true" />
          {item}
        </span>
      ))}
    </div>
  );
}

function AboutOfficialNote() {
  return (
    <div className="rounded-md border border-forest-gold/35 bg-forest-cream p-4 text-sm leading-7 text-forest-muted">
      <p className="flex gap-3">
        <Info className="mt-1 h-5 w-5 shrink-0 text-forest-gold" aria-hidden="true" />
        <span>
          掲載は <strong className="text-forest-deep">{recruitmentSnapshot.checkedAt}</strong> 時点の情報だよ。最新の募集状況は募集詳細でチェックしてね。
        </span>
      </p>
      <a href={recruitmentSnapshot.officialListUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
        募集一覧を開く
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </div>
  );
}

const aboutOriginMilestones = [
  {
    year: "1985",
    phase: "廃校再生",
    subject: "早稲田大学生協",
    place: "埼玉県神泉村（現・神川町）",
    fact: "廃校になった小学校を、学生のセミナーハウスとして再生。",
    timing: "JUON設立前の母体活動",
    body: "都市の学生と農山村が出会う最初のきっかけとして、使われなくなった学校に新しい役割が生まれました。",
    image: {
      src: imagePaths.aboutStoryVillage,
      alt: "神泉村の建物とVILLAGE KAMI-IZUMIの看板",
      caption: "神泉村での大学生協の取り組みに関わる施設の写真",
    },
    icon: Building2,
  },
  {
    year: "1995",
    phase: "震災時のつながり",
    subject: "大学生協・学生・徳島県三好郡の林業関係者",
    place: "阪神淡路大震災の被災地と徳島県三好郡（現・三好市）",
    fact: "仮設学生寮のため、間伐材製ミニハウス58棟の提供を受けた。",
    timing: "JUON設立前のつながり",
    body: "住まいを失った学生への支援を通じて、学生を支える側と農山村の人々との関係が深まりました。",
    image: {
      src: imagePaths.aboutStoryMiniHouse,
      alt: "間伐材ミニハウスを設置している人たち",
      caption: "間伐材ミニハウス設置の様子",
    },
    icon: HeartHandshake,
  },
  {
    year: "1998",
    phase: "JUON設立",
    subject: "大学生協の呼びかけ",
    place: "都市と過疎地域をつなぐネットワーク",
    fact: "学生が活動できる場と、都市・過疎地域のつながりをつくるためにJUON NETWORKを設立。",
    timing: "団体設立",
    body: "社会活動に関心を持つ学生が一歩踏み出せる場をつくり、まちとむらを結ぶ架け橋として活動が始まりました。",
    image: {
      src: imagePaths.aboutStoryFoundingMeeting,
      alt: "JUON NETWORK創立総会の会場写真",
      caption: "JUON NETWORK創立総会の様子",
    },
    icon: Sprout,
  },
] as const;

function OriginSourceLink() {
  return (
    <a
      href={officialLinks.history}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
    >
      出典: JUON NETWORK沿革ページ
      <ExternalLink size={15} aria-hidden="true" />
    </a>
  );
}

function AboutOriginMiniSection() {
  return (
    <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="about-origin-mini-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Origin story</p>
            <h2 id="about-origin-mini-title" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              JUONが生まれる前にあった、三つの転機
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              沿革ページをもとに、設立前の母体活動と1998年の設立を分けて整理します。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "誕生秘話を読む", href: "/about/story" }} />
              <ActionLink link={{ label: "沿革ページを開く", href: officialLinks.history, external: true }} variant="quiet" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {aboutOriginMilestones.map((item) => (
              <article key={item.year} className="about-hover-card rounded-md border border-forest-deep/12 bg-forest-linen p-5">
                <item.icon className="mb-4 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <p className="font-serif text-3xl text-forest-gold">{item.year}</p>
                <h3 className="mt-3 text-lg font-semibold text-forest-deep">{item.phase}</h3>
                <p className="mt-3 text-sm leading-7 text-forest-muted">{item.fact}</p>
                <p className="mt-4 text-xs font-semibold text-forest-leaf">{item.timing}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <OriginSourceLink />
        </div>
      </div>
    </section>
  );
}

function AboutHubPage({ route }: { route: SiteRoute }) {
  const hubCards = [
    { title: "誕生秘話", body: "大学生協と農山村の出会いからJUON設立までの背景を、沿革ページをもとに紹介します。", href: "/about/story", icon: HeartHandshake },
    { title: "SDGsとJUON NETWORK", body: "森林保全、地域づくり、資源循環をSDGsの視点から紹介します。", href: "/about/sdgs", icon: Leaf },
    { title: "スタッフ紹介", body: "事務局と各地の現場を支えるスタッフを、画像なしのテキストカードで紹介します。", href: "/about/staff", icon: Users },
    { title: "団体概要", body: "基本情報、沿革、公開資料、問い合わせ先をまとめています。", href: "/about/organization", icon: Building2 },
    { title: "活動内容", body: "森林の楽校、田畑の楽校、地域活動、樹恩割り箸の一覧ページです。", href: "/activities", icon: Trees },
  ];
  const actionCards = [
    { title: "どんな団体かを知る", body: "都市と農山漁村をつなぐ役割や、どんな活動をしているか、運営の体制までまとめて紹介しています。", icon: Target },
    { title: "参加先を見つける", body: "森林、田畑、地域活動など、関心に近いページへ移動できます。", icon: Sprout },
    { title: "不安を先に減らす", body: "初参加の流れ、持ち物、問い合わせ先を確認してから活動を選べます。", icon: ShieldCheck },
  ];
  const activityRoutes = ["/forest-school", "/field-school", "/regional"].map((path) => getRouteByPath(path));

  return (
    <main>
      <PageBanner route={route} />
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Mission</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              都市と農山漁村が支え合う関係をつくる
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="text-lg leading-9 text-forest-muted">
              JUON NETWORKは、森での体験や地域の人との交流を入口に、都市と農山漁村、人と自然をつなぐ認定NPO法人です。
            </p>
          </div>
        </div>
      </section>
      <AboutOriginMiniSection />
      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Start from here</p>
              <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                活動を選ぶ前に、団体のことを知る
              </h2>
            </div>
            <p className="leading-8 text-forest-muted">
              若い人や初めての人が、理念だけでなく「自分はどこから関われるか」まで見通せるようにまとめました。
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {actionCards.map((card) => (
              <AboutFreshPanel key={card.title} title={card.title} body={card.body} icon={card.icon} />
            ))}
          </div>
        </div>
      </section>
      <section className="about-motion-surface bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading eyebrow="About hub" title="情報一覧" body="団体の考え方、運営する人、公開情報、参加案内を分けて紹介します。" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {hubCards.map((card) => (
              <a key={card.href} href={hashFor(card.href)} className="about-hover-card flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss">
                <card.icon className="mb-5 h-9 w-9 text-forest-leaf" strokeWidth={1.7} aria-hidden="true" />
                <h3 className="text-xl font-semibold text-forest-deep">{card.title}</h3>
                <p className="mt-4 grow leading-8 text-forest-muted">{card.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
                  詳細を見る
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Join path"
                title="団体を知ったら、次は活動を探す"
                body="実際の活動内容や募集状況は、活動ページと募集一覧をご覧ください。"
              />
            </div>
            <div className="grid gap-4">
              <AboutReassuranceBadges items={["初参加ガイドあり", "活動別に確認", "関連情報を確認"]} />
              <AboutOfficialNote />
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {activityRoutes.map((item) => <RouteCard key={item.path} route={item} />)}
          </div>
        </div>
      </section>
      <CtaBanner
        title="次は、自分に合う活動を見つける。"
        body="JUON NETWORKの考え方がわかったら、日程、地域、活動内容から自分に合う参加先を選べます。"
        primary={{ label: "活動紹介を見る", href: "/activities" }}
        secondary={{ label: "はじめての方へ", href: "/first-time" }}
      />
    </main>
  );
}

function AboutStoryPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />
      <section className="about-motion-surface bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Why JUON began</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              設立前からたどる
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              JUON NETWORKの誕生は、団体設立日だけで語れるものではありません。設立前の大学生協の活動、震災時に生まれた農山村とのつながり、学生が社会活動へ踏み出す場をつくりたいという思いが重なっています。
            </p>
            <p className="mt-5 leading-8 text-forest-muted">
              このページでは、沿革ページをもとに、設立前の母体活動と1998年のJUON NETWORK設立を分けて紹介します。
            </p>
            <div className="mt-7">
              <OriginSourceLink />
            </div>
          </div>
          <figure className="overflow-hidden rounded-md border border-forest-deep/12 bg-forest-paper">
            <img
              src={imagePaths.aboutStoryVillage}
              alt="神泉村の建物とVILLAGE KAMI-IZUMIの看板"
              width={960}
              height={720}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full bg-forest-paper object-contain"
            />
            <figcaption className="border-t border-forest-deep/10 px-5 py-4 text-sm leading-7 text-forest-muted">
              神泉村での大学生協の取り組みに関わる施設の写真です。
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="about-story-milestones-title">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Three turning points"
            title="まちとむらをつなぐ前史"
            body="設立前夜の2つの出来事"
          />
          <div id="about-story-milestones-title" className="sr-only">まちとむらをつなぐ前史</div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {aboutOriginMilestones.map((item) => (
              <article key={item.year} className="about-hover-card flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6">
                {"image" in item ? (
                  <figure className="-mx-6 -mt-6 mb-6 overflow-hidden border-b border-forest-deep/10 bg-forest-paper">
                    <img src={item.image.src} alt={item.image.alt} width={720} height={540} loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-forest-paper object-contain" />
                    <figcaption className="px-4 py-3 text-xs leading-6 text-forest-muted">{item.image.caption}</figcaption>
                  </figure>
                ) : null}
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-serif text-4xl text-forest-gold">{item.year}</p>
                    <h3 className="mt-3 text-xl font-semibold text-forest-deep">{item.phase}</h3>
                  </div>
                  <item.icon className="h-9 w-9 shrink-0 text-forest-leaf" aria-hidden="true" />
                </div>
                <dl className="mt-6 grid gap-4 text-sm leading-7">
                  <div>
                    <dt className="font-semibold text-forest-deep">主体</dt>
                    <dd className="mt-1 text-forest-muted">{item.subject}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-forest-deep">場所</dt>
                    <dd className="mt-1 text-forest-muted">{item.place}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-forest-deep">出来事</dt>
                    <dd className="mt-1 text-forest-muted">{item.fact}</dd>
                  </div>
                </dl>
                <p className="mt-5 rounded-full border border-forest-leaf/20 bg-forest-paper px-4 py-3 text-xs font-semibold text-forest-leaf">
                  {item.timing}
                </p>
                <p className="mt-5 grow leading-8 text-forest-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">To today</p>
              <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                だからJUONは歩みをやめない
              </h2>
            </div>
            <div className="grid gap-5">
              <p className="leading-8 text-forest-muted">
                設立前の出会いは、現在の森林の楽校、田畑の楽校、地域活動にもつながっています。都市にいる人が地域へ行き、手を動かし、人と自然の関係を知る。その入口を、JUON NETWORKは活動として開いています。
              </p>
              <p className="leading-8 text-forest-muted">
                最新の日程や参加条件は活動ごとに変わるため、参加前には必ず募集詳細を確認してください。
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ActionLink link={{ label: "活動紹介を見る", href: "/activities" }} />
                <ActionLink link={{ label: "はじめての方へ", href: "/first-time" }} variant="quiet" />
              </div>
              <div className="rounded-md border border-forest-gold/35 bg-forest-cream p-4 text-sm leading-7 text-forest-muted">
                <p>
                  本ページは沿革ページをもとにした要約です。詳しい沿革・年次情報は関連ページを確認してください。
                </p>
                <div className="mt-3">
                  <OriginSourceLink />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="成り立ちを知ったら、次は活動へ。"
        body="まちとむらをつなぐ思いは、現在の参加できる活動として続いています。"
        primary={{ label: "活動一覧を見る", href: "/activities" }}
        secondary={{ label: "団体概要を見る", href: "/about/organization" }}
      />
    </main>
  );
}

const sdgsGoals = [
  { number: "8", title: "働きがいも経済成長も", body: "農山漁村で働く人や地域の担い手と出会うと、地域の経済をどう続けるかが自分ごとになります。", color: "#A21942" },
  { number: "11", title: "住み続けられるまちづくりを", body: "都市と農山漁村を行き来する人を増やし、外から地域の暮らしを支えます。", color: "#FD9D24" },
  { number: "12", title: "つくる責任 つかう責任", body: "樹恩割り箸や国産材を選ぶことが、そのまま森を守る行動になります。", color: "#BF8B2E" },
  { number: "15", title: "陸の豊かさも守ろう", body: "森や里山の手入れ、農地での作業を体験すると、陸の自然への見方が変わります。", color: "#56C02B" },
];

const sdgsActivityRows = [
  { activity: "森林の楽校", goals: "15 / 11 / 8", body: "森を整え、自然に触れ、地域の人と交流しながら、森と暮らしのつながりを学びます。" },
  { activity: "田畑の楽校", goals: "8 / 11 / 12", body: "農作業と食の体験から、地域の仕事、生活、消費のつながりを理解します。" },
  { activity: "地域活動", goals: "11 / 15", body: "同じ地域に通い続けながら、その土地の課題や自然を見守る関係を育てます。" },
  { activity: "樹恩割り箸", goals: "12 / 15 / 8", body: "国産材を毎日の消費とつなげ、森林資源の循環と仕事づくりを支えます。" },
];

function AboutSdgsPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />
      <section className="about-motion-surface bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading eyebrow="Goals" title="活動と結びつく4つの目標" body="JUONの活動は、地域の仕事や暮らし、ものの選び方、自然環境とゆるやかにつながっています。" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {sdgsGoals.map((goal) => (
              <article key={goal.number} className="about-hover-card rounded-md border border-forest-deep/12 bg-forest-paper p-6">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md text-2xl font-bold text-white" style={{ backgroundColor: goal.color }}>{goal.number}</span>
                  <h3 className="text-lg font-semibold leading-snug text-forest-deep">{goal.title}</h3>
                </div>
                <p className="mt-5 leading-8 text-forest-muted">{goal.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-16">
          <figure className="overflow-hidden rounded-md border border-forest-deep/10 bg-forest-linen">
            <img src="/assets/generated/sdgs-forest-cycle.png" alt="森林資源の循環とSDGsの関係を示す図" width={960} height={720} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </figure>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Forest cycle</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">森を使い、育て、次へ渡す</h2>
            <p className="mt-6 leading-8 text-forest-muted">
              森林整備や国産材利用は、自然保護だけで完結しません。地域の仕事、都市側の消費、学びの場が循環してはじめて、森を守る行動が続いていきます。
            </p>
          </div>
        </div>
      </section>
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading eyebrow="Activity mapping" title="活動とSDGs対応表" />
          <div className="mt-10 grid gap-4 md:hidden">
            {sdgsActivityRows.map((row) => (
              <article key={row.activity} className="rounded-md border border-forest-deep/12 bg-forest-paper p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-forest-deep">{row.activity}</h3>
                  <span className="shrink-0 rounded-full border border-forest-leaf/30 bg-forest-linen px-3 py-1 text-xs font-semibold text-forest-leaf">
                    {row.goals}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-forest-muted">{row.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 hidden overflow-x-auto rounded-md border border-forest-deep/12 bg-forest-paper md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-forest-deep text-forest-linen">
                <tr>
                  <th className="px-5 py-4 text-sm">活動</th>
                  <th className="px-5 py-4 text-sm">主なSDGs</th>
                  <th className="px-5 py-4 text-sm">対応の考え方</th>
                </tr>
              </thead>
              <tbody>
                {sdgsActivityRows.map((row) => (
                  <tr key={row.activity} className="border-t border-forest-deep/10">
                    <td className="px-5 py-5 font-semibold text-forest-deep">{row.activity}</td>
                    <td className="px-5 py-5 text-sm font-semibold text-forest-leaf">{row.goals}</td>
                    <td className="px-5 py-5 leading-7 text-forest-muted">{row.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <CtaBanner
        title="SDGsを現場の体験につなげる"
        body="目標を読むだけでなく、森や農山村の現場で体験することで、活動の意味を具体的に理解できます。"
        primary={{ label: "活動一覧を見る", href: "/activities" }}
        secondary={{ label: "JUONとはへ戻る", href: "/about" }}
      />
    </main>
  );
}

function AboutStaffPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <TextOnlyPageBanner route={route} />
      <StaffSection />
      <CtaBanner
        title="スタッフの活動領域から参加先を探す"
        body="気になる活動領域が見つかったら、活動一覧や募集中イベントから参加先を探してみてください。"
        primary={{ label: "活動一覧を見る", href: "/activities" }}
        secondary={{ label: "団体概要を見る", href: "/about/organization" }}
      />
    </main>
  );
}

const organizationInfoRows = [
  ["団体名", "認定特定非営利活動法人 JUON NETWORK"],
  ["略記", "認定NPO法人 JUON NETWORK"],
  ["設立", "1998年4月"],
  ["主な活動", "森林保全、農山漁村交流、ボランティア人材育成、国産材利用推進"],
  ["事務局", "〒166-8532 東京都杉並区和田3-30-22 大学生協杉並会館内"],
  ["関連サイト", "https://juon.or.jp/"],
];

const organizationTimeline = [
  { year: "1998", body: "全国大学生協連での検討を経て、JUON NETWORKとして創立。" },
  { year: "1999", body: "特定非営利活動法人化。森林の楽校など現場体験型の活動を継続。" },
  { year: "2000s", body: "森林の楽校、田畑の楽校、地域ブロック活動を各地で展開。" },
  { year: "現在", body: "報告書や会員情報誌、公式SNSで活動情報を公開し、参加の仕組みを広げている。" },
];

const publicDocs = [
  { title: "法人概要・報告書", body: "法人情報、所在地、年次報告書、事業報告書、決算報告書が載っています。", href: officialLinks.organization },
  { title: "JUON NETWORKとは", body: "認定NPOとしての目的、ビジョン、バリュー、事業の柱を紹介しています。", href: officialLinks.about },
  { title: "創立の背景", body: "大学生協発のネットワークとして創立された経緯を読めます。", href: officialLinks.founding },
  { title: "会員情報誌", body: "会員情報誌や活動レポートなど、継続的な発信を見られます。", href: officialLinks.publication },
  { title: "お問い合わせ", body: "連携、取材、参加前相談などは問い合わせページから確認してください。", href: officialLinks.contact },
];

function AboutOrganizationPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />
      <section className="about-motion-surface bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Profile</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">団体概要</h2>
            <p className="mt-5 leading-8 text-forest-muted">
              基本情報は法人概要、創立ページ、会員情報誌ページをもとにしたサイト内整理です。詳しい最新情報は関連ページで確認できます。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "法人概要を開く", href: officialLinks.organization, external: true }} />
              <ActionLink link={{ label: "創立の背景を見る", href: officialLinks.founding, external: true }} variant="quiet" />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-forest-deep/12 bg-forest-paper">
            {organizationInfoRows.map(([label, value]) => (
              <div key={label} className="grid border-b border-forest-deep/10 last:border-b-0 md:grid-cols-[12rem_1fr]">
                <div className="bg-forest-deep/6 px-5 py-4 text-sm font-semibold text-forest-deep">{label}</div>
                <div className="px-5 py-4 leading-7 text-forest-muted">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading eyebrow="History" title="沿革" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {organizationTimeline.map((item) => (
              <article key={item.year} className="about-hover-card rounded-md border-l-4 border-forest-leaf bg-forest-linen p-6">
                <p className="font-serif text-3xl text-forest-gold">{item.year}</p>
                <p className="mt-4 leading-8 text-forest-muted">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ActionLink link={{ label: "誕生秘話を読む", href: "/about/story" }} />
            <ActionLink link={{ label: "沿革ページを開く", href: officialLinks.history, external: true }} variant="quiet" />
          </div>
        </div>
      </section>
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Public documents"
            title="公開資料リンク"
            body="トップページの信頼材料と同じく、根拠は関連ページに集約します。SNS投稿の埋め込みや数値表示は行いません。"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {publicDocs.map((doc) => (
              <a key={doc.href} href={doc.href} target="_blank" rel="noreferrer" className="about-hover-card flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-paper p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss">
                <FileText className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-forest-deep">{doc.title}</h3>
                <p className="mt-4 grow text-sm leading-7 text-forest-muted">{doc.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
                  関連ページを開く
                  <ExternalLink size={15} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner
        title="団体について確認したいことがある場合"
        body="参加前の相談、取材、連携、資料確認などは、問い合わせページから確認してください。"
        primary={{ label: "問い合わせる", href: "/contact" }}
        secondary={{ label: "既存の問い合わせページを開く", href: officialLinks.contact, external: true }}
      />
    </main>
  );
}

function StaffSection() {
  const hasStaff = staffGroups.some((group) => group.members.length > 0);

  return (
    <section className="bg-forest-linen py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Staff</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">スタッフ紹介</h2>
          </div>
          <div className="rounded-md border border-forest-deep/10 bg-forest-paper p-5 text-sm leading-7 text-forest-muted">
            <p>
              最終確認日: <strong className="text-forest-deep">{staffInfo.checkedAt}</strong>。掲載内容は関連情報をもとにした短い要約です。
            </p>
            <a
              href={staffInfo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
            >
              最新情報はスタッフ紹介ページを確認
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        {hasStaff ? (
          <div className="mt-12 grid gap-10">
            {staffGroups.map((group) => (
              <section key={group.id} aria-labelledby={`staff-${group.id}`}>
                <div className="mb-5 border-l-4 border-forest-leaf pl-5">
                  <h3 id={`staff-${group.id}`} className="text-2xl font-semibold text-forest-deep">
                    {group.label}
                  </h3>
                  <p className="mt-2 leading-7 text-forest-muted">{group.description}</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.members.map((member) => (
                    <StaffCard key={`${group.id}-${member.name}`} member={member} groupLabel={group.label} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-md border border-forest-deep/12 bg-forest-paper p-7 text-forest-muted">
            スタッフ情報は現在準備中です。最新情報は関連ページをご確認ください。
          </div>
        )}
      </div>
    </section>
  );
}

function StaffCard({
  member,
  groupLabel,
}: {
  member: (typeof staffGroups)[number]["members"][number];
  groupLabel: string;
}) {
  const activityLinks = getStaffActivityLinks(member.role);

  return (
    <article className="flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-paper p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">{groupLabel}</p>
      <h4 className="mt-4 text-xl font-semibold leading-snug text-forest-deep">{member.name}</h4>
      <p className="mt-3 text-sm font-semibold leading-7 text-forest-leaf">{member.role}</p>
      <p className="mt-4 grow leading-8 text-forest-muted">{member.summary}</p>

      <div className="mt-6 border-t border-forest-deep/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-muted">担当活動</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activityLinks.map((link) => {
            const external = link.external || isExternalLink(link.href);
            return (
              <a
                key={`${member.name}-${link.href}`}
                href={linkHref(link)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-forest-deep/15 bg-forest-linen px-3 py-2 text-xs font-semibold text-forest-deep transition hover:bg-forest-deep hover:text-forest-linen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss"
              >
                {link.label}
                {external ? <ExternalLink size={13} aria-hidden="true" /> : <ArrowRight size={13} aria-hidden="true" />}
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function getStaffActivityLinks(role: string): CtaLink[] {
  const links: CtaLink[] = [];
  const add = (link: CtaLink) => {
    if (!links.some((item) => item.href === link.href && item.label === link.label)) {
      links.push(link);
    }
  };

  if (role.includes("森林の楽校")) {
    add({ label: "森林の楽校", href: "/forest-school" });
  }
  if (role.includes("田畑の楽校")) {
    add({ label: "田畑の楽校", href: "/field-school" });
  }
  if (role.includes("エコサーバー") || role.includes("入門講座")) {
    add({ label: "入門講座", href: "/course" });
  }
  if (role.includes("樹恩割り箸")) {
    add({ label: "樹恩割り箸", href: "/waribashi" });
  }
  if (role.includes("多摩の森") || role.includes("大自然塾")) {
    add({ label: "活動紹介", href: "/activities" });
  }
  if (links.length === 0) {
    add({ label: "活動紹介", href: "/activities" });
  }

  return links;
}

const supportImages = {
  memberForest: "/assets/generated/support/support-member-forest.png",
  donationHands: "/assets/generated/support/support-donation-hands.png",
  joinBackView: "/assets/generated/support/support-join-back-view.png",
  youth: "/assets/generated/support/support-youth-lower-face-or-body.png",
  communityTable: "/assets/generated/support/support-community-table.png",
  tools: "/assets/generated/support/support-tools.png",
} as const;

const youthSupportWays = [
  {
    title: "はじめての現場に参加する",
    body: "体験しやすい活動や講座から、森や農山村との関わりを始められます。",
  },
  {
    title: "学校・サークルで広げる",
    body: "友人や団体内で活動を紹介し、参加のきっかけを広げることも支援になります。",
  },
  {
    title: "継続的に関わる",
    body: "一度の参加で終わらせず、地域や活動の変化を見守る関わり方を選べます。",
  },
];

const donationSupportItems = [
  {
    title: "道具と安全管理",
    body: "作業道具、保険、事前案内など、安心して参加できる準備を支えます。",
    icon: ShieldCheck,
  },
  {
    title: "森林・農地の手入れ",
    body: "下草刈り、植樹、竹林整備、農作業体験などの現場運営を支えます。",
    icon: Trees,
  },
  {
    title: "地域との交流",
    body: "受け入れ地域との調整、交流の場づくり、継続参加の仕組みを支えます。",
    icon: Users,
  },
  {
    title: "情報発信と募集",
    body: "活動を必要な人へ届け、初参加者が迷わず一歩を踏み出せるよう支えます。",
    icon: FileText,
  },
];

function SupportPage({ route }: { route: SiteRoute }) {
  const supportCardImages = [
    {
      src: supportImages.memberForest,
      alt: "森の中で会員として活動を支える人の後ろ姿",
    },
    {
      src: supportImages.donationHands,
      alt: "寄付による支援を表す手元と植物",
    },
    {
      src: supportImages.joinBackView,
      alt: "活動に参加し、周囲へ紹介する人の後ろ姿",
    },
  ];

  return (
    <main>
      <PageBanner route={route} />

      <section id="support-ways" className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Ways to support"
            title="支援のかたち"
            body="支援は一つではありません。会員、寄付、参加や紹介など、関わりやすい方法から選べます。"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {route.sections.map((item, index) => (
              <article
                key={item.title}
                className="support-card-hover support-reveal flex h-full flex-col overflow-hidden rounded-md border border-forest-deep/12 bg-forest-paper"
              >
                <img
                  src={supportCardImages[index].src}
                  alt={supportCardImages[index].alt}
                  width={720}
                  height={540}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex grow flex-col p-6">
                  <h3 className="text-xl font-semibold text-forest-deep">{item.title}</h3>
                  <p className="mt-4 grow text-sm leading-7 text-forest-muted">{item.body}</p>
                  <div className="mt-6">
                    <ActionLink
                      link={
                        index === 2
                          ? { label: "募集一覧へ", href: officialLinks.events, external: true }
                          : { label: "入会・寄付ページへ", href: officialLinks.join, external: true }
                      }
                      variant="quiet"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-16">
          <figure className="overflow-hidden border border-forest-deep/10 bg-forest-linen">
            <img
              src={supportImages.youth}
              alt="学生・若者が活動に関わる様子。目元や顔が写らない、下半分の顔または身体中心の安全な構図"
              width={960}
              height={720}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Youth support</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              学生・若者の関わり方
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              まとまった寄付だけでなく、参加、紹介、継続的な関心も活動を支える力になります。顔出しを前提にしない参加の見せ方にも配慮します。
            </p>
            <div className="mt-8 grid gap-4">
              {youthSupportWays.map((item, index) => (
                <article key={item.title} className="support-reveal flex gap-4 rounded-md border border-forest-deep/10 bg-forest-linen p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-leaf text-sm font-semibold text-forest-linen">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-forest-deep">{item.title}</h3>
                    <p className="mt-2 leading-7 text-forest-muted">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Donation impact"
            title="寄付が支えること"
            body="寄付は、現場の準備、地域との調整、情報発信など、活動を続けるための基盤に使われます。"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {donationSupportItems.map((item) => (
              <article key={item.title} className="support-reveal h-full rounded-md border border-forest-deep/12 bg-forest-paper p-6">
                <item.icon className="mb-5 h-9 w-9 text-forest-leaf" strokeWidth={1.7} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-forest-deep">{item.title}</h3>
                <p className="mt-4 leading-7 text-forest-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Transparency</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              安心して支援いただくために
            </h2>
            <p className="mt-5 leading-8 text-forest-muted">
              支援方法を確認したうえで、入会・寄付・問い合わせは既存の手続きページへ進めます。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "入会・寄付ページへ", href: officialLinks.join, external: true }} />
              <ActionLink link={{ label: "既存の問い合わせページへ", href: officialLinks.contact, external: true }} variant="quiet" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                image: supportImages.communityTable,
                alt: "地域の人と支援者が資料を囲んで話すテーブル",
                title: "手続き条件を確認",
                body: "金額、会員種別、手続き条件は入会・寄付ページの最新情報を優先してください。",
              },
              {
                image: supportImages.tools,
                alt: "森林活動で使う道具と手袋",
                title: "手続きページへ進む",
                body: "入会、寄付、問い合わせは、それぞれの既存ページで内容を確認して進めます。",
              },
            ].map((item) => (
              <article key={item.title} className="support-reveal overflow-hidden rounded-md border border-forest-deep/10 bg-forest-linen">
                <img src={item.image} alt={item.alt} width={720} height={540} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold text-forest-deep">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-forest-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="支援方法を確認して、次の手続きへ。"
        body="入会、寄付、問い合わせ、イベント申込は、内容に合わせて既存の手続きページへ進めます。"
        primary={{ label: "入会・寄付ページへ", href: officialLinks.join, external: true }}
        secondary={{ label: "募集一覧へ", href: officialLinks.events, external: true }}
      />
    </main>
  );
}

const consultImages = {
  hero: "/assets/generated/consult/consult-hero-forest-path.png",
  footerLandscape: "/assets/generated/consult/consult-footer-landscape.png",
} as const;

const consultContentByType = new Map<ConsultType, ConsultContentItem>(
  consultContent.map((item) => [item.type, item]),
);

const consultIconMap: Record<ConsultIconKey, typeof Leaf> = {
  sprout: Sprout,
  users: Users,
  building: Building2,
  file: FileText,
  trees: Trees,
  mail: Mail,
};

function getConsultTypeFromRoutePath(pathWithQuery: string): ConsultType | null {
  const rawType = routeSearchParams(pathWithQuery).get("type");
  return isConsultType(rawType) ? rawType : null;
}

function notifyRouteStateChanged() {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const consultPreparationSteps = [
  {
    title: "地域や時期",
    body: "参加したい地域、時期、日帰りか宿泊かを、ざっくり決めておきましょう。",
  },
  {
    title: "立場・参加形態",
    body: "学生、個人、企業・団体、学校、受け入れ先、報道・支援など、今の自分に近い立場を選びます。",
  },
  {
    title: "気になること",
    body: "持ち物、体力、集合、雨天時対応、連携方法など、聞きたい点を書き出します。",
  },
];

const consultNextActions = [
  {
    title: "行けそうな日程を探す",
    body: "日程や地域が合う活動があるか、先に一覧から探せます。",
    href: "/events",
    ctaLabel: "週末の日程を見る",
    icon: CalendarDays,
  },
  {
    title: "はじめての不安を減らす",
    body: "参加前の流れや不安を、初参加向けのページでチェックできます。",
    href: "/first-time",
    ctaLabel: "初参加ガイドを見る",
    icon: Leaf,
  },
  {
    title: "相談内容を整理する",
    body: "問い合わせページへ進む前に、問い合わせ内容の種類を整理できます。",
    href: "/contact",
    ctaLabel: "問い合わせ内容を整理する",
    icon: ArrowRight,
  },
];

function ConsultPage({ route, routePath }: { route: SiteRoute; routePath: string }) {
  const selectedType = getConsultTypeFromRoutePath(routePath);
  const selectedItem = selectedType ? consultContentByType.get(selectedType) ?? null : null;
  const panelHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const rawType = routeSearchParams(routePath).get("type");
    if (rawType && !isConsultType(rawType)) {
      window.history.replaceState(null, "", "#/consult");
      notifyRouteStateChanged();
    }
  }, [routePath]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    window.setTimeout(() => {
      panelHeadingRef.current?.focus({ preventScroll: true });
      if (panelHeadingRef.current) {
        scrollWithHeaderOffset(panelHeadingRef.current);
      }
    }, 0);
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeConsultPanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem]);

  const selectConsultType = (type: ConsultType) => {
    const nextHash = `#/consult?type=${type}`;
    if (window.location.hash === nextHash) {
      return;
    }

    window.history.pushState(null, "", nextHash);
    notifyRouteStateChanged();
  };

  const closeConsultPanel = () => {
    window.history.replaceState(null, "", "#/consult");
    notifyRouteStateChanged();
  };

  return (
    <main>
      <section className="relative isolate grid min-h-[620px] overflow-hidden bg-forest-deep text-forest-linen md:min-h-[700px]">
        <img
          src={consultImages.hero}
          alt="木漏れ日が差す森の小道。相談ページへの案内を示す風景"
          width={1600}
          height={1000}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(9,44,31,.94),rgba(9,44,31,.78)_38%,rgba(9,44,31,.32)_70%,rgba(9,44,31,.08)),linear-gradient(180deg,rgba(9,44,31,.12),rgba(9,44,31,.46))]" />
        <div className="mx-auto flex w-full max-w-7xl items-center px-5 py-20 md:px-10 lg:px-16">
          <div className="consult-hero-copy max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss md:text-sm">
              {route.banner.eyebrow}
            </p>
            <h1 className="banner-title font-serif text-4xl font-medium leading-[1.16] tracking-normal md:text-7xl">
              迷ったままでも、
              <br />
              大丈夫。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-forest-linen/90 md:text-lg">
              「何を聞けばいいかわからない」でもOK。
              <br />
              自分に近い立場を選ぶだけで、次のステップが見えてくるよ。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("consult-options");
                  if (target) {
                    scrollWithHeaderOffset(target);
                  }
                }}
                className="consult-cta-hover inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest-gold bg-forest-gold px-6 py-3 text-sm font-semibold text-forest-deep transition hover:bg-forest-goldlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
              >
                <span>近い相談を選ぶ</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <ActionLink link={{ label: "問い合わせページへ進む", href: "/contact" }} variant="secondary" />
            </div>
          </div>
        </div>
      </section>

      <section id="consult-options" className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Choose your position"
            title="今の自分に近いのは"
            body="問い合わせの前に近いカテゴリを選ぶと、聞きたいことや不安をまとめやすくなります。"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {consultContent.map((item) => {
              const Icon = consultIconMap[item.iconKey];
              const isSelected = selectedType === item.type;

              return (
                <button
                  key={item.type}
                  type="button"
                  aria-expanded={isSelected}
                  aria-pressed={isSelected}
                  aria-controls="consult-detail-panel"
                  onClick={() => selectConsultType(item.type)}
                  className={[
                    "consult-reveal consult-card-hover group flex h-full flex-col rounded-md border p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss",
                    isSelected ? "border-forest-leaf bg-ui-support-leaf shadow-elevation" : "border-forest-deep/12 bg-forest-paper",
                  ].join(" ")}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className={["grid h-16 w-16 shrink-0 place-items-center rounded-full", item.tone].join(" ")}>
                      <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    {isSelected ? (
                      <span className="rounded-full border border-forest-leaf/35 bg-forest-linen px-3 py-1 text-xs font-semibold text-forest-deep">
                        選択中
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-5 block max-w-[13rem] whitespace-pre-line text-xl font-semibold leading-8 text-forest-deep">
                    {item.title}
                  </span>
                  <span className={["mt-5 block h-[2px] w-11", item.accent].join(" ")} />
                  <p className="mt-4 grow leading-8 text-forest-muted">{item.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep">
                    {isSelected ? "詳細を表示中" : "相談を整理する"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>

          {selectedItem ? (
            <section
              id="consult-detail-panel"
              role="region"
              aria-live="polite"
              aria-labelledby="consult-detail-title"
              className="consult-panel-enter mt-10 scroll-mt-24 rounded-md border border-forest-deep/12 bg-forest-paper p-6 shadow-elevation md:p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">
                    Selected guide
                  </p>
                  <h2
                    id="consult-detail-title"
                    ref={panelHeadingRef}
                    tabIndex={-1}
                    className="scroll-mt-24 font-serif text-3xl font-medium leading-tight text-forest-deep focus:outline-none md:text-5xl"
                  >
                    {selectedItem.shortTitle}の相談を整理する
                  </h2>
                  <p className="mt-5 max-w-3xl leading-8 text-forest-muted">{selectedItem.body}</p>
                </div>
                <button
                  type="button"
                  onClick={closeConsultPanel}
                  className="inline-flex min-h-11 items-center justify-center gap-2 border border-forest-deep/20 px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-forest-linen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
                  aria-label={`${selectedItem.shortTitle}の相談整理を閉じる`}
                >
                  閉じる
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <ConsultDetailList title="次に確認したい質問" items={selectedItem.questions} />
                <ConsultDetailList title="よくある確認事項" items={selectedItem.concerns} />
                <ConsultDetailList title="相談前の準備メモ" items={selectedItem.preparation} />
              </div>

              <div className="mt-8 border-t border-forest-deep/10 pt-7">
                <h3 className="text-lg font-semibold text-forest-deep">次のステップ</h3>
                <p className="mt-2 leading-7 text-forest-muted">
                  上の項目を見ながら、気になる活動や確認したいことを絞り込めます。申込や問い合わせは、次のページで確認してください。
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {selectedItem.routes.map((link) => (
                    <ActionLink key={`${selectedItem.type}-${link.href}`} link={link} variant="quiet" />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <div className="mt-10 border border-forest-deep/10 bg-forest-paper p-6 text-sm leading-7 text-forest-muted md:p-7">
              立場を1つ選ぶと、追加の質問、確認事項、相談前の準備メモを表示します。
            </div>
          )}
        </div>
      </section>

      <section className="bg-ui-surface-sunk py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Before contact</p>
              <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
                相談前に
                <br />
                少しだけ整理
              </h2>
              <p className="mt-5 leading-8 text-forest-muted">
                すべて決まっていなくても大丈夫です。わかる範囲を少しまとめておくと、次のステップを選びやすくなります。
              </p>
            </div>
            <div className="grid gap-4">
              {consultPreparationSteps.map((step, index) => (
                <article key={step.title} className="consult-step-glide flex gap-5 rounded-md border border-forest-deep/10 bg-forest-linen p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-deep font-serif text-lg text-forest-linen">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-forest-deep">{step.title}</h3>
                    <p className="mt-2 leading-7 text-forest-muted">{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Next action"
            title="次にできること"
            body="いま必要な確認に合わせて、日程探し、初参加ガイド、問い合わせ整理へ進めます。"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {consultNextActions.map((item) => (
              <a
                key={item.title}
                href={hashFor(item.href)}
                className="consult-cta-hover group flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6 transition hover:border-forest-leaf/45 hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
              >
                <item.icon className="h-9 w-9 text-forest-leaf" strokeWidth={1.8} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold text-forest-deep">{item.title}</h3>
                <p className="mt-4 grow leading-8 text-forest-muted">{item.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
                  {item.ctaLabel}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen">
        <div className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24 lg:px-16">
          <div className="grid overflow-hidden rounded-md border border-forest-deep/12 bg-forest-paper lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="flex items-start gap-3 text-sm leading-7 text-forest-muted">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-forest-leaf" aria-hidden="true" />
                <span>
                  迷っている段階では、上の確認項目と「次にできること」のカードだけ見れば十分です。相談内容がまとまったら、問い合わせページへ進んでください。
                </span>
              </p>
              <div className="mt-5">
                <ActionLink link={{ label: "問い合わせページへ", href: "/contact" }} variant="quiet" />
              </div>
            </div>
            <img
              src={consultImages.footerLandscape}
              alt="水彩風に描かれた山と森の風景。相談ページ下部の装飾"
              width={960}
              height={720}
              loading="lazy"
              decoding="async"
              className="h-full min-h-[220px] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ConsultDetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="h-full border-t border-forest-deep/12 pt-5">
      <h3 className="text-lg font-semibold text-forest-deep">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7 text-forest-muted">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-forest-leaf" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactPage({ route }: { route: SiteRoute }) {
  const preContactChecks = [
    {
      title: "参加したい活動名・日程を確認",
      body: "募集一覧や各詳細ページで、開催日、場所、締切、参加条件を確認してから問い合わせページへ進みます。",
    },
    {
      title: "相談したい立場を整理",
      body: "個人参加、学生・学校、企業・団体、取材、支援など、どの立場で問い合わせるかだけ決めておけばOKです。",
    },
    {
      title: "必要事項は問い合わせページで入力",
      body: "活動名、日程、相談したい内容を整理してから、既存の問い合わせページへ進めます。",
    },
  ];

  return (
    <main>
      <PageBanner route={route} />
      <section className="bg-forest-linen py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
          <div className="rounded-md border border-forest-deep/12 bg-forest-paper p-6 md:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">Contact guide</p>
            <h2 className="break-words font-serif text-2xl font-medium leading-tight text-forest-deep md:text-4xl">
              問い合わせ前チェック
            </h2>
            <p className="mt-4 break-all leading-8 text-forest-muted">
              必要な確認を済ませてから、既存の問い合わせページへ進んでください。
            </p>
            <div className="mt-8 grid gap-4" aria-label="問い合わせ前の確認項目">
              {preContactChecks.map((item, index) => (
                <article key={item.title} className="flex gap-4 rounded-md border border-forest-deep/10 bg-forest-linen p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-deep font-serif text-lg text-forest-linen">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-all text-lg font-semibold text-forest-deep">{item.title}</h3>
                    <p className="mt-2 break-all leading-7 text-forest-muted">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink
                link={{ label: "既存の問い合わせページへ進む", href: officialLinks.contact, external: true }}
                variant="primary"
              />
              <p className="break-all text-xs leading-6 text-forest-muted">
                活動名、日程、相談したい内容を整理しておくと、問い合わせページで入力しやすくなります。
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {contactChannels.map((channel) => (
              <article key={channel.label} className="rounded-md border border-forest-deep/10 bg-forest-paper p-6">
                <Mail className="mb-4 h-7 w-7 text-forest-leaf" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-forest-deep">{channel.label}</h3>
                <p className="mt-3 leading-7 text-forest-muted">{channel.body}</p>
                {channel.href ? (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                  >
                    関連ページを開く
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="参加できる活動も確認する"
        body="問い合わせ前に、日程や開催地が合う活動があるか一覧で探してみてください。"
        primary={{ label: "活動一覧へ", href: "/activities" }}
        secondary={{ label: "はじめての方へ", href: "/first-time" }}
      />
    </main>
  );
}

function ProgramOverview({ route }: { route: SiteRoute }) {
  return (
    <section className="bg-forest-linen py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <SectionHeading title="活動の種類" body="まずは関心に近い活動から、募集情報を見てください。" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {route.sections.map((section) => (
            <article key={section.title} className="rounded-md border border-forest-deep/12 bg-forest-paper p-7">
              <Leaf className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-forest-deep">{section.title}</h3>
              <p className="mt-4 leading-8 text-forest-muted">{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getSortedRecruitmentItems(items: RecruitmentItem[]) {
  return [...items].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function groupRecruitmentByMonth(items: RecruitmentItem[]) {
  return getSortedRecruitmentItems(items).reduce<{ monthLabel: string; items: RecruitmentItem[] }[]>((groups, item) => {
    const currentGroup = groups.find((group) => group.monthLabel === item.monthLabel);
    if (currentGroup) {
      currentGroup.items.push(item);
    } else {
      groups.push({ monthLabel: item.monthLabel, items: [item] });
    }
    return groups;
  }, []);
}

function RecruitmentSection({
  title,
  id,
  items,
  upcomingItems,
  monthlyGroups,
  selectedRegion,
  selectedFilters,
  monthOptions,
  themeOptions,
}: {
  title: ReactNode;
  id: string;
  items: RecruitmentItem[];
  upcomingItems: RecruitmentItem[];
  monthlyGroups: { monthLabel: string; items: RecruitmentItem[] }[];
  selectedRegion?: RegionActivityGroup;
  selectedFilters: EventFilterState;
  monthOptions: string[];
  themeOptions: string[];
}) {
  const filterGroups = [
    {
      label: "地域",
      options: regionActivityGroups.map((region) => ({ value: region.id, label: region.shortLabel })),
      key: "region" as const,
    },
    {
      label: "月",
      options: monthOptions.map((month) => ({ value: month, label: month.replace("2026年", "") })),
      key: "month" as const,
    },
    {
      label: "テーマ",
      options: themeOptions.map((theme) => ({ value: theme, label: theme })),
      key: "theme" as const,
    },
    {
      label: "日程",
      options: eventStayOptions,
      key: "stay" as const,
    },
  ];
  const hasFilters = Boolean(selectedFilters.region || selectedFilters.month || selectedFilters.theme || selectedFilters.stay);

  return (
    <section id={id} className="bg-forest-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">募集ピックアップ</p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">{title}</h2>
          </div>
          <div className="rounded-md border border-forest-deep/10 bg-forest-linen p-5 text-sm leading-7 text-forest-muted">
            <p>
              最終確認日: <strong className="text-forest-deep">{recruitmentSnapshot.checkedAt}</strong>。
              {recruitmentSnapshot.note}
            </p>
            <a
              href={recruitmentSnapshot.officialListUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
            >
              募集一覧を確認
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-md border border-forest-deep/10 bg-forest-linen p-5 md:p-6" aria-label="イベント絞り込み">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-forest-deep">
                <Filter size={16} aria-hidden="true" />
                条件で絞り込む
              </p>
              <p className="mt-2 text-sm leading-7 text-forest-muted">
                地域・月・テーマ・日帰りか宿泊かで絞れるよ。初心者歓迎かどうかや作業の強度は、各募集ページでチェックしてね。
              </p>
            </div>
            <a
              href="#/events"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-forest-deep/20 px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss"
            >
              条件を解除
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {filterGroups.map((group) => (
              <div key={group.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-gold">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const nextFilters = {
                      ...selectedFilters,
                      [group.key]: selectedFilters[group.key] === option.value ? undefined : option.value,
                    };
                    const selected = selectedFilters[group.key] === option.value;

                    return (
                      <a
                        key={`${group.key}-${option.value}`}
                        href={eventsFilterHref(nextFilters)}
                        aria-current={selected ? "true" : undefined}
                        className={[
                          "inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-moss",
                          selected
                            ? "border-forest-deep bg-forest-deep text-forest-linen"
                            : "border-forest-deep/16 bg-forest-paper text-forest-deep hover:border-forest-leaf/50",
                        ].join(" ")}
                      >
                        {option.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-forest-muted">
            {hasFilters
              ? `${items.length}件を表示しています。条件が合わない場合は募集一覧も確認してください。`
              : `${items.length}件の募集情報を表示しています。`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-md border border-forest-deep/12 bg-forest-linen p-7">
            <h3 className="text-xl font-semibold text-forest-deep">この条件の募集は現在表示していません</h3>
            <p className="mt-4 leading-8 text-forest-muted">
              ここに載っている情報はある時点のものだよ。条件を変えてみるか、最新の募集を公式一覧でチェックしてみてね。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "募集一覧を開く", href: recruitmentSnapshot.officialListUrl, external: true }} />
              <ActionLink link={{ label: "条件を解除", href: "/events" }} variant="quiet" />
            </div>
          </div>
        ) : (
          <>
            <section className="mt-12" aria-labelledby="upcoming-events">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Upcoming</p>
                  <h3 id="upcoming-events" className="font-serif text-2xl font-medium text-forest-deep md:text-3xl">
                    近日開催
                  </h3>
                </div>
                <p className="text-sm leading-7 text-forest-muted">基準日: {recruitmentSnapshot.checkedAt} 以降の最大3件</p>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {upcomingItems.map((item) => (
                  <RecruitmentCard key={`upcoming-${item.href}-${item.startDate}`} item={item} compact />
                ))}
              </div>
            </section>

            <section className="mt-16" aria-labelledby="monthly-events">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Monthly list</p>
              <h3 id="monthly-events" className="font-serif text-2xl font-medium text-forest-deep md:text-3xl">
                月別イベント一覧
              </h3>
              <div className="mt-8 grid gap-10">
                {monthlyGroups.map((group) => (
                  <div key={group.monthLabel}>
                    <div className="mb-5 border-l-4 border-forest-leaf pl-5">
                      <h4 className="text-xl font-semibold text-forest-deep">{group.monthLabel}</h4>
                      <p className="mt-1 text-sm text-forest-muted">{group.items.length}件</p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      {group.items.map((item) => (
                        <RecruitmentCard key={`${item.href}-${item.startDate}`} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}

function RecruitmentCard({ item, compact = false }: { item: RecruitmentItem; compact?: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-forest-deep/12 bg-forest-linen transition hover:border-forest-leaf/45">
      {item.image ? (
        <figure className="relative aspect-[16/9] w-full overflow-hidden bg-forest-paper">
          <img className="h-full w-full object-cover" src={item.image.src} alt={item.image.alt} width={720} height={540} loading="lazy" decoding="async" />
          <figcaption className="absolute left-3 top-3 rounded-full bg-forest-deep/88 px-3 py-1.5 text-xs font-semibold text-forest-linen">
            {item.image.label}
          </figcaption>
        </figure>
      ) : null}
      <div className="flex grow flex-col p-5 md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-forest-gold">{item.date}</p>
          <h3 className={["mt-3 font-semibold leading-snug text-forest-deep", compact ? "text-lg" : "text-xl"].join(" ")}>
            {item.title}
          </h3>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-forest-leaf/35 bg-forest-paper px-3 py-2 text-xs font-semibold text-forest-leaf">
          {item.theme}
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm leading-7 text-forest-muted">
        <p className="flex gap-2">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-forest-leaf" aria-hidden="true" />
          <span>{item.location}</span>
        </p>
        <p className="flex gap-2">
          <Info className="mt-1 h-4 w-4 shrink-0 text-forest-gold" aria-hidden="true" />
          <span>{item.statusNote}</span>
        </p>
      </div>
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-forest-deep/20 px-4 py-2 text-sm font-semibold text-forest-deep transition hover:bg-forest-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss sm:w-fit"
      >
        詳細を見る
        <ExternalLink size={15} aria-hidden="true" />
      </a>
      </div>
    </article>
  );
}

const voiceInsightCards = [
  {
    label: "学ぶ",
    title: "森の作業を近くで見る",
    body: "手入れの意味や道具の使い方を、現場の説明と作業の流れを通じて詳しく学べた。",
    context: "森林の楽校 / 参加者の声より",
    href: "/forest-school",
    icon: Trees,
  },
  {
    label: "触れる",
    title: "食べ物の背景に\n触れる",
    body: "収穫や手入れを通じて、食と地域の営みがつながっていることを感じられた。",
    context: "田畑の楽校 / 参加者の声より",
    href: "/field-school",
    icon: Sprout,
  },
  {
    label: "体験する",
    title: "手を動かして\n実感する",
    body: "説明を聞くだけでなく、体を使うことで活動の意味を自分ごととして捉えやすくなった。",
    context: "活動一覧 / 参加者の声より",
    href: "/activities",
    icon: Leaf,
  },
  {
    label: "歩く",
    title: "地域を歩く時間が残る",
    body: "水場や民家を訪ね、暮らしの風景を見ながら地域との関わり方を考えられます。",
    context: "地域の活動 / 参加者の声より",
    href: "/regional",
    icon: MapPin,
  },
];

const voiceChangeCards = [
  {
    title: "また参加したい",
    body: "もう一度現地へ行き、別の活動にも関わりたいという気持ちが集まることがあります。",
    icon: HeartHandshake,
  },
  {
    title: "地域への関心が広がる",
    body: "作業だけでなく、食や暮らし、地域の課題まで見えるきっかけになります。",
    icon: MapPin,
  },
  {
    title: "学びを人に話したい",
    body: "体験で得た気づきを、家族や友人に伝えたいという声につながります。",
    icon: FileText,
  },
];

const voiceStoryLinks = [
  {
    title: "森林の楽校",
    body: "森づくりの現場で、自然と向き合い仲間と学び合う体験。",
    href: "/forest-school",
    icon: Trees,
  },
  {
    title: "田畑の楽校",
    body: "土に触れ、食や暮らしを支える地域の営みを体感する。",
    href: "/field-school",
    icon: Sprout,
  },
  {
    title: "地域の活動",
    body: "散策や交流を通じて、人と地域のつながりを深める。",
    href: "/regional",
    icon: MapPin,
  },
  {
    title: "樹恩割り箸",
    body: "国産材を使う日常から、日本の森を支える選択へつなげる。",
    href: "/waribashi",
    icon: Utensils,
  },
];

function VoicesPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />

      <section className="bg-forest-linen py-16 md:py-24" aria-labelledby="voices-featured-story">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-16">
          <div className="rounded-md border border-forest-deep/10 bg-forest-paper p-4 md:p-5">
            <figure className="overflow-hidden rounded-md border border-forest-leaf/20 bg-forest-linen">
              <img
                className="aspect-square h-full w-full object-cover"
                src={imagePaths.voicesWelcomeCommunity}
                alt="里山の集落で地域の人が参加者を迎え入れている様子"
                width={720}
                height={720}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <p className="mt-6 text-center text-sm leading-7 text-forest-muted">
              画像は活動の雰囲気を伝えるイメージです。参加者本人を示す写真ではありません。
            </p>
          </div>

          <div>
            <p className="mb-4 inline-flex rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Featured story</p>
            <h2 id="voices-featured-story" className="font-serif text-3xl font-medium leading-tight text-forest-deep md:text-5xl">
              一人で行った週末が、地域とつながるきっかけになる。
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-forest-muted md:text-lg">
              実際に活動に参加した方の声を、個人が特定されない形で要約して紹介しています。はじめての空気感を知る入口としてご覧ください。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "はじめての流れを見る", href: "/first-time" }} />
              <ActionLink link={{ label: "週末の日程を見る", href: "/events" }} variant="quiet" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="voices-insights">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            eyebrow="Voices"
            title="参加した人が感じたこと"
            body="参加した方の感想をもとに、活動の雰囲気が伝わるよう短くまとめています。"
          />
          <div id="voices-insights" className="sr-only">参加した人が感じたこと</div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {voiceInsightCards.map((card) => (
              <article key={card.title} className="flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6 transition hover:border-forest-leaf/45">
                <card.icon className="mb-5 h-8 w-8 text-forest-leaf" aria-hidden="true" />
                <p className="inline-flex rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-forest-gold">参加者の声</p>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-forest-deep">{card.title}</h3>
                <p className="mt-4 grow leading-8 text-forest-muted">{card.body}</p>
                <p className="mt-5 text-xs font-semibold text-forest-deep">{card.context}</p>
                <a
                  href={hashFor(card.href)}
                  aria-label={`${card.title}に関連する${card.context.split(" / ")[0]}を見る`}
                  className="mt-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
                >
                  この活動を見る
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-16 md:py-24" aria-labelledby="voices-changes">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading title="参加後に変わったこと" body="参加後に寄せられた声のなかから、共通する変化を紹介しています。" />
          <div id="voices-changes" className="sr-only">参加後に変わったこと</div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {voiceChangeCards.map((card) => (
              <article key={card.title} className="h-full rounded-md border border-forest-deep/10 bg-forest-paper p-6 text-center">
                <card.icon className="mx-auto h-9 w-9 text-forest-leaf" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold text-forest-deep">{card.title}</h3>
                <p className="mx-auto mt-4 max-w-sm leading-8 text-forest-muted">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-paper py-16 md:py-24" aria-labelledby="voices-stories">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionHeading
            title={
              <>
                <span className="block">気になったあなたも変われる</span>
                <span className="block">活動はこちらから</span>
              </>
            }
            body="関連する活動ページはこちらから"
          />
          <div id="voices-stories" className="sr-only">気になったあなたも変われる 活動はこちらから</div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {voiceStoryLinks.map((link) => (
              <a
                key={link.href}
                href={hashFor(link.href)}
                className="group flex h-full flex-col overflow-hidden rounded-md border border-forest-deep/12 bg-forest-linen text-forest-deep transition hover:border-forest-leaf/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss"
                aria-label={`${link.title}の活動ページを見る`}
              >
                <span className="relative block aspect-[1.38] overflow-hidden rounded-t-md bg-forest-deep">
                  <img
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    src={getActivityImage(getRouteByPath(link.href)).src}
                    alt={`${link.title}の活動風景`}
                    width={720}
                    height={522}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute inset-x-0 top-0 flex min-h-12 items-center gap-3 bg-forest-deep/88 px-5 py-3 text-forest-linen">
                    <link.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="font-serif text-xl font-medium">{link.title}</span>
                  </span>
                </span>
                <span className="flex grow flex-col p-6">
                  <span className="inline-flex rounded-full text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">
                    {getRouteByPath(link.href).banner.eyebrow}
                  </span>
                  <span className="mt-4 grow leading-7 text-forest-muted">{link.body}</span>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4">
                    この活動を見る
                    <ArrowRight className="transition group-hover:translate-x-1" size={15} aria-hidden="true" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-14 md:py-20" aria-labelledby="voices-note">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <div className="rounded-md border border-forest-deep/12 bg-forest-paper p-6 md:p-8">
            <p className="mb-3 inline-flex rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-forest-gold">Source note</p>
            <h2 id="voices-note" className="font-serif text-2xl font-medium text-forest-deep">出典と確認方法</h2>
            <p className="mt-4 leading-8 text-forest-muted">
              このページの声は、会報や活動レポート等をもとに、個人が特定されないよう一部を要約・編集して掲載しています。画像は活動の雰囲気を伝えるイメージとして使用しており、参加者本人を示すものではありません。
            </p>
            <div className="mt-7 rounded-md border border-forest-leaf/20 bg-forest-linen p-5 md:p-6">
              <p className="text-sm font-semibold text-forest-deep">最新の通信を確認する</p>
              <p className="mt-3 text-sm leading-7 text-forest-muted">
                PDF本体は同梱せず、会員情報誌ページで確認できる導線にしています。
              </p>
              <div className="mt-5">
                <a
                  href={officialLinks.publication}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="会員情報誌ページを新しいタブで開く"
                  className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-md border border-forest-gold bg-forest-gold px-6 py-3 text-center text-sm font-semibold text-forest-deep transition hover:bg-forest-goldlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-moss sm:w-auto"
                >
                  <span className="min-w-0">会員情報誌を見る</span>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink link={{ label: "最新募集を確認", href: recruitmentSnapshot.officialListUrl, external: true }} variant="quiet" />
              <ActionLink link={{ label: "問い合わせ先を見る", href: "/contact" }} variant="quiet" />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="気になった声から、次の一歩へ。"
        body="募集状況、申込条件、開催可否は募集詳細で確認してください。"
        primary={{ label: "週末の日程を見る", href: "/events" }}
        secondary={{ label: "気になる活動を探す", href: "/activities" }}
      />
    </main>
  );
}

function RouteCard({ route }: { route: SiteRoute }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-forest-deep/12 bg-forest-linen p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-gold">{route.banner.eyebrow}</p>
      <h3 className="text-xl font-semibold text-forest-deep">{route.title}</h3>
      <p className="mt-4 grow leading-8 text-forest-muted">{route.banner.lead}</p>
      <a
        href={hashFor(route.path)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
      >
        {route.navLabel}へ
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </article>
  );
}

function ProvisionalPage({ route }: { route: SiteRoute }) {
  return (
    <main>
      <PageBanner route={route} />
      <section className="bg-forest-linen py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <div className="rounded-md border border-forest-deep/12 bg-forest-paper p-5 md:p-7">
            <p className="flex items-start gap-3 text-sm leading-7 text-forest-muted">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-forest-leaf" aria-hidden="true" />
              <span>
                このページはv1では暫定表示です。共通ヘッダーと主要ページは実装済みで、詳細本文は次フェーズで対応します。
              </span>
            </p>
          </div>
          {route.mockup ? (
            <figure className="mt-8 overflow-hidden rounded-md border border-forest-deep/10 bg-forest-paper">
              <img
                className="mx-auto h-auto w-full max-w-[920px]"
                src={route.mockup}
                alt={`${route.title}の暫定モック参照`}
                width={920}
                height={690}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ) : null}
        </div>
      </section>
      <CtaBanner
        title="主要ページへ戻る"
        body="参加方法や募集中の活動は、主要ページから確認できます。"
        primary={{ label: "気になる活動を探す", href: "/activities" }}
        secondary={{ label: "問い合わせへ", href: "/contact" }}
      />
    </main>
  );
}

function CtaBanner({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: CtaLink;
  secondary?: CtaLink;
}) {
  return (
    <section className="bg-forest-deep px-5 py-14 text-forest-linen md:px-10 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between lg:px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss">Next step</p>
          <h2 className="font-serif text-3xl font-medium leading-tight md:text-4xl">{title}</h2>
          <p className="mt-4 leading-8 text-forest-linen/82">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <ActionLink link={primary} variant="primary" />
          {secondary ? <ActionLink link={secondary} variant="secondary" /> : null}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const footerRoutes = siteRoutes.filter((route) => ["/about", "/activities", "/events", "/support", "/contact"].includes(route.path));

  return (
    <footer className="border-t border-forest-deep/10 bg-forest-linen">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-10 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-16">
        <div>
          <div className="flex items-center text-forest-deep">
            <img
              src="/assets/brand/juon-network-logo.png"
              alt="認定特定非営利活動法人 樹恩ネットワーク JUON NETWORK"
              width={400}
              height={87}
              loading="lazy"
              decoding="async"
              className="block h-auto w-[200px] shrink-0"
            />
          </div>
          <p className="mt-4 max-w-md leading-8 text-forest-muted">
            森林と都市、人と地域をつなぎ、はじめてでも参加しやすい里山・森林ボランティアの場を届けます。
          </p>
        </div>
        <nav className="grid gap-2 text-sm font-bold text-forest-deep" aria-label="フッターナビ">
          {footerRoutes.map((route) => (
            <a key={route.path} href={hashFor(route.path)} className="py-1 hover:text-forest-leaf">
              {route.navLabel}
            </a>
          ))}
        </nav>
        <div className="grid gap-3 text-sm leading-7 text-forest-muted">
          <a
            href={officialLinks.contact}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-bold text-forest-deep underline decoration-forest-gold decoration-2 underline-offset-4"
          >
            既存の問い合わせページ
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
