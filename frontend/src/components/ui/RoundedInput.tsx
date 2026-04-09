import { motion } from "framer-motion";
import { forwardRef, useState, ChangeEvent, FocusEvent } from "react";
import { cn } from "@/lib/utils";

interface RoundedInputProps {
  error?: boolean;
  label?: string;
  className?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
}

export const RoundedInput = forwardRef<HTMLInputElement, RoundedInputProps>(
  ({ className, error, label, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <motion.div
        className="relative w-full"
        animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {label && (
          <label className="block text-caption text-muted-foreground mb-2 font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-input border bg-background px-4 text-sm transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive ring-destructive" : "border-input",
            isFocused && "shadow-card",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </motion.div>
    );
  }
);

RoundedInput.displayName = "RoundedInput";