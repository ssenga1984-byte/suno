import { Menu, Sprout } from "lucide-react";
import { Button } from "./Button";

export type NavItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  brand?: string;
  navItems?: NavItem[];
  cta?: NavItem;
};

const defaultNavItems: NavItem[] = [
  { label: "はじめての方へ", href: "/first-time" },
  { label: "活動一覧", href: "/activities" },
  { label: "イベント", href: "/events" },
  { label: "FAQ", href: "/faq" },
];

export function Header({
  brand = "JUON NETWORK",
  navItems = defaultNavItems,
  cta = { label: "参加する", href: "/contact" },
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/45 bg-stone-50/86 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex min-w-0 items-center gap-3 text-emerald-950">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-bold tracking-[0.12em] sm:text-base">{brand}</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-emerald-950/8 hover:text-emerald-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 sm:block">
          <Button href={cta.href} variant="primary" className="min-h-10 px-4 py-2">
            {cta.label}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-stone-300 bg-white/80 text-emerald-950 lg:hidden"
          aria-label="メニューを開く"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
