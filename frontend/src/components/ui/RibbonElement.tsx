import { motion } from "framer-motion";

interface RibbonElementProps {
  className?: string;
  variant?: "wave" | "loop" | "accent";
}

export const RibbonElement = ({ className = "", variant = "wave" }: RibbonElementProps) => {
  if (variant === "loop") {
    return (
      <motion.svg
        className={className}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M100 20C60 20 20 60 20 100C20 140 60 180 100 180C140 180 180 140 180 100C180 60 140 20 100 20ZM100 160C71.6 160 48.3 136.4 40 120C48.3 103.6 71.6 80 100 80C128.4 80 151.7 103.6 160 120C151.7 136.4 128.4 160 100 160Z"
          stroke="hsl(0 0% 7%)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.1"
        />
      </motion.svg>
    );
  }

  if (variant === "accent") {
    return (
      <motion.svg
        className={className}
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <path
          d="M10 20C30 10 50 30 70 20C90 10 110 20 110 20"
          stroke="hsl(0 0% 7%)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.15"
        />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      className={className}
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M0 50C50 30 100 70 150 50C200 30 250 70 300 50C350 30 400 50 400 50"
        stroke="hsl(0 0% 7%)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.08"
      />
      <path
        d="M0 60C50 40 100 80 150 60C200 40 250 80 300 60C350 40 400 60 400 60"
        stroke="hsl(0 0% 7%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.05"
      />
    </motion.svg>
  );
};

export default RibbonElement;