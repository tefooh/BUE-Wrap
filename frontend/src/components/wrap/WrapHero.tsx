import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Zap } from "lucide-react";

interface WrapHeroProps {
  gradeEnergy: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { stiffness: 200, damping: 32 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.onChange((v) => {
      if (ref.current) {
        ref.current.textContent = v.toString();
      }
    });
  }, [display]);

  return <span ref={ref} />;
};

export const WrapHero = ({ gradeEnergy }: WrapHeroProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white/60 backdrop-blur-xl rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/40 flex flex-col items-center text-center w-full max-w-sm aspect-[4/5] justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-gray-50/50 pointer-events-none" />
        
        <motion.div 
          className="relative z-10 w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-2"
        >
          Grade Energy
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 1.1 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-7xl font-bold tracking-tighter text-gray-900"
        >
          <AnimatedNumber value={gradeEnergy} />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-6 px-4 py-2 bg-gray-100/50 rounded-full"
        >
          <p className="text-xs font-medium text-gray-500">Academic Voltage</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
