import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export const MetricCard = ({ title, value, icon: Icon, subtitle, className, children }: MetricCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative bg-card rounded-card p-6 shadow-card transition-shadow duration-300",
        className
      )}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-caption text-muted-foreground font-medium uppercase tracking-wide">
          {title}
        </span>
        {Icon && (
          <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>
      
      <div className="text-display text-foreground font-semibold">
        {value}
      </div>
      
      {subtitle && (
        <p className="text-caption text-muted-foreground mt-2">{subtitle}</p>
      )}
      
      {children}
    </motion.div>
  );
};

export default MetricCard;