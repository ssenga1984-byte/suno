import type { HTMLMotionProps, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export const motionVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  },
  softScale: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  },
  staggerParent: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }
} satisfies Record<string, Variants>;

type MotionBlockProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    variant?: keyof Pick<typeof motionVariants, "fadeUp" | "softScale">;
    delay?: number;
  }
>;

export const MotionBlock = ({
  children,
  variant = "fadeUp",
  delay = 0,
  transition,
  ...props
}: MotionBlockProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div initial={false} animate={false} {...props}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={motionVariants[variant]}
      transition={{ duration: 0.42, ease: easeOut, delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

type MotionFigureProps = PropsWithChildren<
  HTMLMotionProps<"figure"> & {
    delay?: number;
  }
>;

export const MotionFigure = ({
  children,
  delay = 0.08,
  transition,
  ...props
}: MotionFigureProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.figure initial={false} animate={false} {...props}>
        {children}
      </motion.figure>
    );
  }

  return (
    <motion.figure
      initial="hidden"
      animate="visible"
      variants={motionVariants.softScale}
      transition={{ duration: 0.46, ease: easeOut, delay, ...transition }}
      {...props}
    >
      {children}
    </motion.figure>
  );
};
