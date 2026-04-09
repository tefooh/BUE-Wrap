import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  isLoading?: boolean;
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      children,
      shimmerColor = "rgba(255, 255, 255, 0.2)",
      shimmerSize = "0.1em",
      borderRadius = "9999px",
      shimmerDuration = "2s",
      background = "hsl(0 0% 7%)",
      className,
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-10 py-4 text-white font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={{
          borderRadius,
          background,
        }}
        disabled={disabled || isLoading}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
              animationDuration: shimmerDuration,
            }}
          />
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 opacity-100 transition-opacity duration-500"
          style={{
            borderRadius,
            background: `radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            children
          )}
        </span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
