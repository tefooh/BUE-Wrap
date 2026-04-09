import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface WrapSlideProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accentText?: string;
  children?: ReactNode;
}

export const WrapSlide = ({ title, value, subtitle, icon: Icon, accentText, children }: WrapSlideProps) => {
  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center px-8 py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Icon className="w-10 h-10 text-foreground" strokeWidth={1.5} />
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.p
        className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground mb-6 font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.p>

      {/* Main Value */}
      <motion.h1
        className="text-[72px] md:text-[96px] lg:text-[120px] font-semibold text-foreground leading-none mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", damping: 20 }}
      >
        {value}
      </motion.h1>

      {/* Accent Text */}
      {accentText && (
        <motion.p
          className="text-[24px] md:text-[32px] text-foreground font-medium mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {accentText}
        </motion.p>
      )}

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className="text-[15px] text-muted-foreground max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {subtitle}
        </motion.p>
      )}

      {children}
    </motion.div>
  );
};

export default WrapSlide;