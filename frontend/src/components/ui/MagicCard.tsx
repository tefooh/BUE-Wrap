import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export const MagicCard = ({
  children,
  className,
  gradientSize = 200,
  gradientColor = "rgba(120, 120, 120, 0.15)",
  gradientOpacity = 1,
}: MagicCardProps) => {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  };

  const background = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
  `;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-border/50 bg-card shadow-card",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[var(--radius-card)] opacity-100 transition-opacity duration-300"
        style={{ background, opacity: gradientOpacity }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default MagicCard;
