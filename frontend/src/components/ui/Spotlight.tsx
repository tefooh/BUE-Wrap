import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  size?: number;
}

export const Spotlight = ({ className, size = 400 }: SpotlightProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      animate(mouseX, e.clientX, { duration: 0 });
      animate(mouseY, e.clientY, { duration: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`
    radial-gradient(${size}px circle at ${mouseX}px ${mouseY}px, rgba(120, 120, 120, 0.08), transparent 80%)
  `;

  return (
    <motion.div
      className={cn(
        "pointer-events-none fixed inset-0 z-30 transition-opacity duration-300",
        className
      )}
      style={{ background }}
    />
  );
};

export default Spotlight;
