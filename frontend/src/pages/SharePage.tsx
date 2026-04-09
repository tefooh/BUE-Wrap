import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ArrowLeft } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import { RibbonElement } from "@/components/ui/RibbonElement";
import { SlideUpWrapper } from "@/components/ui/MotionWrappers";
import { useToast } from "@/hooks/use-toast";

const SharePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your wrap summary is being prepared.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Back button */}
      <motion.button
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground transition-colors"
        onClick={() => navigate("/wrap")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-caption">Back to Wrap</span>
      </motion.button>

      {/* Shareable card */}
      <SlideUpWrapper delay={0.1}>
        <motion.div
          className="w-full max-w-lg bg-card rounded-modal p-10 shadow-card-hover relative overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 25 }}
        >
          {/* Ribbon accent */}
          <motion.div
            className="absolute -top-4 -right-4 opacity-20"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <RibbonElement className="w-32 h-32" variant="loop" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-10">
              <motion.div
                className="w-16 h-16 rounded-card bg-primary flex items-center justify-center mx-auto mb-6 shadow-card"
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">B</span>
                  </div>
                  <span className="font-semibold text-lg">BUEWrap 2025</span>
                </div>
                <p className="text-body text-muted-foreground">@student_name</p>
              </motion.div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <motion.div
                className="text-center"
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="text-display text-foreground font-semibold">3.85</div>
                <div className="text-caption text-muted-foreground uppercase tracking-wide">GPA</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="text-display text-foreground font-semibold">12</div>
                <div className="text-caption text-muted-foreground uppercase tracking-wide">A+ Grades</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="text-display text-foreground font-semibold">47</div>
                <div className="text-caption text-muted-foreground uppercase tracking-wide">Assignments</div>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="text-display text-foreground font-semibold">92%</div>
                <div className="text-caption text-muted-foreground uppercase tracking-wide">Quiz Avg</div>
              </motion.div>
            </div>

            {/* Ribbon decoration */}
            <div className="flex justify-center mb-8">
              <RibbonElement className="w-40 h-10" variant="accent" />
            </div>

            {/* Download button */}
            <PillButton
              size="lg"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Summary
            </PillButton>
          </div>
        </motion.div>
      </SlideUpWrapper>
    </div>
  );
};

export default SharePage;