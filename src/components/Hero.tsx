import { CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./Button";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageSrc?: string;
  imageAlt?: string;
  facts?: Array<{ label: string; value: string }>;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageSrc = "/assets/photos/hero-forest-no-face.png",
  imageAlt = "",
  facts = [],
}: HeroProps) {
  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-emerald-950 text-white">
      <img src={imageSrc} alt={imageAlt} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,38,28,0.88),rgba(7,38,28,0.55),rgba(7,38,28,0.18))]" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          {eyebrow ? (
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">
              <MapPin className="size-4" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-semibold leading-[1.08] sm:text-6xl lg:text-7xl">{title}</h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-100 sm:text-lg">{description}</p>
          ) : null}
          {(primaryCta || secondaryCta) ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? <Button href={primaryCta.href}>{primaryCta.label}</Button> : null}
              {secondaryCta ? (
                <Button href={secondaryCta.href} variant="secondary">
                  {secondaryCta.label}
                </Button>
              ) : null}
            </div>
          ) : null}
          {facts.length ? (
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={`${fact.label}-${fact.value}`} className="rounded-lg border border-white/22 bg-white/12 p-4 backdrop-blur-md">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-100">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {fact.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug">{fact.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
