import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface FadeInWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

interface SlideUpWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
}

export const FadeInWrapper = ({ children, delay = 0, ...props }: FadeInWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideUpWrapper = ({ children, delay = 0, ...props }: SlideUpWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        damping: 25,
        stiffness: 200,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, staggerDelay = 0.1, ...props }: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, ...props }: { children: ReactNode } & HTMLMotionProps<"div">) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 200,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};