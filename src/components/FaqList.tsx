import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqListProps = {
  items: FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white/88">
      {items.map((item, index) => (
        <motion.details
          key={`${item.question}-${index}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.03 }}
          className="group"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-emerald-950">
            <span className="min-w-0">{item.question}</span>
            <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-5 pb-5 text-sm leading-7 text-stone-700">{item.answer}</div>
        </motion.details>
      ))}
    </div>
  );
}
