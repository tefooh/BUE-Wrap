import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
}

export const BlurFade = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 12,
  blur = "8px",
}: BlurFadeProps) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: yOffset,
      filter: `blur(${blur})`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export default BlurFade;
