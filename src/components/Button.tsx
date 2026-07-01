import { type MouseEventHandler, type ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost";

type BaseButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
};

type LinkButtonProps = BaseButtonProps &
  {
    href: string;
    target?: string;
    rel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    "aria-label"?: string;
  };

type NativeButtonProps = BaseButtonProps &
  {
    href?: never;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    "aria-label"?: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-900 text-white shadow-[0_16px_34px_rgba(15,48,35,0.22)] hover:bg-emerald-950",
  secondary:
    "border border-stone-300 bg-white/82 text-emerald-950 hover:border-emerald-700 hover:bg-emerald-50",
  ghost: "text-emerald-950 hover:bg-emerald-950/8",
};

const motionProps = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

export function Button({
  children,
  variant = "primary",
  icon: Icon,
  iconPosition = "right",
  className = "",
  ...props
}: LinkButtonProps | NativeButtonProps) {
  const iconNode = Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null;
  const fallbackIcon = variant === "primary" && !Icon ? <ArrowRight className="size-4 shrink-0" /> : null;
  const content = (
    <>
      {iconPosition === "left" ? iconNode : null}
      <span className="min-w-0 text-center">{children}</span>
      {iconPosition === "right" ? iconNode || fallbackIcon : null}
    </>
  );

  const classes = [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold leading-tight",
    "transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    className,
  ].join(" ");

  if ("href" in props && props.href) {
    return (
      <motion.a className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button className={classes} type="button" {...motionProps} {...(props as NativeButtonProps)}>
      {content}
    </motion.button>
  );
}
