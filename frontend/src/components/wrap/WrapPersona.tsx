import { motion } from "framer-motion";

interface WrapPersonaProps {
  persona: {
    name: string;
    description: string;
    emoji: string;
  };
}

export const WrapPersona = ({ persona }: WrapPersonaProps) => {
  return (
    <div className="w-full bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 min-h-[420px] flex flex-col justify-center items-center backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center mb-8"
      >
         <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center">
           <img src="/icons3d/3dicons-trophy-dynamic-color.png" alt="trophy" className="w-16 h-16" />
         </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", rotate: -10 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-[6rem] mb-8 leading-none"
      >
        {persona.emoji}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl font-bold text-gray-900 mb-4"
      >
        {persona.name}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-gray-600 text-lg leading-relaxed max-w-md text-center"
      >
        {persona.description}
      </motion.p>
    </div>
  );
};
