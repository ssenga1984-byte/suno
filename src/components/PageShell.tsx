import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export function PageShell({ eyebrow, title, description, children, imageSrc, imageAlt = "" }: PageShellProps) {
  return (
    <div className="overflow-hidden">
      <section className="bg-stone-100">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:px-8 lg:py-20">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          {imageSrc ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              src={imageSrc}
              alt={imageAlt}
              className="h-full min-h-64 w-full rounded-lg object-cover shadow-[0_24px_70px_rgba(27,39,32,0.18)]"
            />
          ) : null}
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
