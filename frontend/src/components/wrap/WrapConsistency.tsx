import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface WrapConsistencyProps {
  ribbonWidth: number;
  gradedItems: number;
  activitiesTotal: number;
}

export const WrapConsistency = ({ ribbonWidth, gradedItems, activitiesTotal }: WrapConsistencyProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const getLevel = () => {
    if (ribbonWidth >= 80) return { label: "Exceptional", color: "from-green-500 to-emerald-500" };
    if (ribbonWidth >= 60) return { label: "Strong", color: "from-blue-500 to-cyan-500" };
    if (ribbonWidth >= 40) return { label: "Steady", color: "from-yellow-500 to-orange-500" };
    return { label: "Building", color: "from-purple-500 to-pink-500" };
  };

  const { label, color } = getLevel();

  return (
    <div ref={containerRef} className="relative w-full py-20 overflow-hidden flex flex-col items-center justify-center">
      <motion.div 
        style={{ x, opacity }} 
        className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 pointer-events-none z-0"
      >
        {/* Abstract Ribbon Representation */}
        <div className={`w-[150%] h-full bg-gradient-to-r ${color} blur-3xl opacity-20 transform -rotate-6 translate-x-[-25%]`} />
        <div className={`w-[150%] h-4 absolute top-1/2 bg-gradient-to-r ${color} transform -rotate-3 translate-x-[-25%] shadow-lg`} />
      </motion.div>

      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4"
        >
          Consistency
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring" }}
          className="text-5xl font-bold text-gray-900 mb-6"
        >
          {label}
        </motion.h2>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
           <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                 <span className="text-2xl font-bold text-gray-900">{gradedItems}</span>
                 <span className="text-gray-500">Graded</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex flex-col">
                 <span className="text-2xl font-bold text-gray-900">{activitiesTotal}</span>
                 <span className="text-gray-500">Activities</span>
              </div>
           </div>
           
           <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(ribbonWidth, 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${color}`}
              />
           </div>
        </div>
      </div>
    </div>
  );
};
