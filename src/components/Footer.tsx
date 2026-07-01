import { Mail, MapPin, Sprout } from "lucide-react";
import { type NavItem } from "./Header";

type FooterProps = {
  brand?: string;
  description?: string;
  navItems?: NavItem[];
  contact?: {
    address?: string;
    email?: string;
  };
};

const defaultFooterNav: NavItem[] = [
  { label: "JUON NETWORKとは", href: "/about" },
  { label: "活動一覧", href: "/activities" },
  { label: "支援する", href: "/support" },
  { label: "お問い合わせ", href: "/contact" },
];

export function Footer({
  brand = "JUON NETWORK",
  description = "森と街、人と地域をつないで、誰でも気軽に参加できる里山・森林ボランティアの入口をつくっています。",
  navItems = defaultFooterNav,
  contact,
}: FooterProps) {
  return (
    <footer className="border-t border-emerald-950/10 bg-emerald-950 text-stone-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-emerald-950">
              <Sprout className="size-5" aria-hidden="true" />
            </span>
            <p className="font-bold tracking-[0.12em]">{brand}</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-200">{description}</p>
        </div>

        <nav className="grid gap-2" aria-label="Footer navigation">
          {navItems.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-lg py-1 text-sm text-stone-200 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="space-y-3 text-sm text-stone-200">
          {contact?.address ? (
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{contact.address}</span>
            </p>
          ) : null}
          {contact?.email ? (
            <a className="flex items-center gap-3 hover:text-white" href={`mailto:${contact.email}`}>
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>{contact.email}</span>
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-stone-300">
        © {new Date().getFullYear()} {brand}
      </div>
    </footer>
  );
}
