import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PillButton } from "@/components/ui/PillButton";
import { RibbonElement } from "@/components/ui/RibbonElement";

interface SummaryMetric {
  label: string;
  value: string | number;
}

interface WrapSummaryProps {
  metrics: SummaryMetric[];
}

export const WrapSummary = ({ metrics }: WrapSummaryProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center px-8 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold">B</span>
        </div>
        <span className="font-semibold text-lg">BUEWrap 2025</span>
      </div>

      <motion.h1
        className="text-[32px] md:text-[40px] font-semibold text-foreground mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Your 2025 Wrap
      </motion.h1>

      <motion.p
        className="text-[15px] text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        What an incredible semester!
      </motion.p>

      {/* Summary Grid */}
      <motion.div
        className="grid grid-cols-2 gap-6 mb-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="text-center p-4 bg-muted rounded-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: "spring", damping: 20 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-[32px] md:text-[40px] font-semibold text-foreground">
              {metric.value}
            </div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Ribbon decoration */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.9 }}
      >
        <RibbonElement className="w-40 h-10" variant="accent" />
      </motion.div>

      {/* CTA */}
      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <PillButton size="lg" className="w-full" onClick={() => navigate("/share")}>
          Share Your Wrap
        </PillButton>
        <PillButton variant="secondary" className="w-full" onClick={() => navigate("/")}>
          Start Over
        </PillButton>
      </motion.div>
    </motion.div>
  );
};

export default WrapSummary;