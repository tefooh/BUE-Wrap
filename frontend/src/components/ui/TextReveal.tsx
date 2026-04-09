import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const TextReveal = ({ children, className, delay = 0 }: TextRevealProps) => {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={{
          hidden: { y: "100%", opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              delay,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default TextReveal;
