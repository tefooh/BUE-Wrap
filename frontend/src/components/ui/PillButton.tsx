import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PillButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg";
  isLoading?: boolean;
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-foreground text-background shadow-button",
      secondary: "bg-secondary text-secondary-foreground",
      ghost: "bg-transparent text-foreground",
    };
    
    const sizes = {
      default: "h-11 px-8 text-[15px]",
      lg: "h-14 px-10 text-[15px] font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
        onClick={props.onClick}
        type={props.type}
      >
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

PillButton.displayName = "PillButton";