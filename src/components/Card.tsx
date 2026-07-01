import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type CardProps = {
  title?: string;
  eyebrow?: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  interactive?: boolean;
  id?: string;
  className?: string;
};

export function Card({
  title,
  eyebrow,
  description,
  icon: Icon,
  children,
  interactive = false,
  id,
  className = "",
}: CardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={[
        "rounded-lg border border-stone-200 bg-white/88 p-5 shadow-[0_18px_42px_rgba(27,39,32,0.08)]",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
      id={id}
    >
      <div className="flex items-start gap-4">
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">
              {eyebrow}
            </p>
          ) : null}
          {title ? <h3 className="text-lg font-semibold leading-snug text-emerald-950">{title}</h3> : null}
          {description ? (
            <p className="mt-2 text-sm leading-7 text-stone-700">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </motion.article>
  );
}
