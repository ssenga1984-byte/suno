import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export type TimelineItem = {
  title: string;
  description?: string;
  date?: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-2 hidden h-[calc(100%-1rem)] w-px bg-emerald-900/18 sm:block" />
      <ol className="grid gap-5">
        {items.map((item, index) => (
          <motion.li
            key={`${item.title}-${index}`}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.32, ease: "easeOut", delay: index * 0.04 }}
            className="relative grid gap-3 rounded-lg border border-stone-200 bg-white/86 p-5 shadow-[0_12px_32px_rgba(27,39,32,0.07)] sm:grid-cols-[2.5rem_1fr]"
          >
            <span className="hidden size-10 items-center justify-center rounded-lg bg-emerald-900 text-white sm:flex">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              {item.date ? <p className="mb-1 text-sm font-semibold text-amber-700">{item.date}</p> : null}
              <h3 className="text-lg font-semibold leading-snug text-emerald-950">{item.title}</h3>
              {item.description ? <p className="mt-2 text-sm leading-7 text-stone-700">{item.description}</p> : null}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
