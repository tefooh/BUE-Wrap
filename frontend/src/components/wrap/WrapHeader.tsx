import { motion } from "framer-motion";
import { Settings } from "lucide-react";

interface WrapHeaderProps {
  photoUrl?: string;
  name: string;
  onSettingsClick?: () => void;
}

export const WrapHeader = ({ photoUrl, name, onSettingsClick }: WrapHeaderProps) => {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="flex items-center gap-3 pointer-events-auto bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-black/5">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-black/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-black/10" />
        )}
        <span className="text-sm font-semibold tracking-tight">{name}</span>
      </div>

      <button
        onClick={onSettingsClick}
        className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/5 active:scale-95 transition-transform"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-gray-700 stroke-[1.5]" />
      </button>
    </motion.header>
  );
};
