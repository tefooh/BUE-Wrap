import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export const AnimatedGradient = ({
  className,
  colors = ["#f5f5f5", "#e5e5e5", "#f0f0f0", "#fafafa"],
  speed = 8,
}: AnimatedGradientProps) => {
  return (
    <motion.div
      className={cn("absolute inset-0 overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.join(", ")})`,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default AnimatedGradient;
