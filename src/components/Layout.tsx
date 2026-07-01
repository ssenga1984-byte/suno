import { type ReactNode } from "react";
import { Footer } from "./Footer";
import { Header, type NavItem } from "./Header";

type LayoutProps = {
  children: ReactNode;
  navItems?: NavItem[];
  cta?: NavItem;
};

export function Layout({ children, navItems, cta }: LayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      <Header navItems={navItems} cta={cta} />
      <main>{children}</main>
      <Footer navItems={navItems} />
    </div>
  );
}
