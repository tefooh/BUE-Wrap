import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { RibbonElement } from "@/components/ui/RibbonElement";
import { demoGetWrap } from "@/lib/demoApi";

const LoadingPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const messages = [
    "Generating your wrap...",
    "Collecting your courses...",
    "Calculating how much caffeine you consumed...",
    "Crunching your grades (painful, I know)...",
    "Designing your summary...",
    "Hiding your embarrassing grades...",
    "Polishing your A+ collection...",
    "Checking if you actually attended lectures...",
    "Asking the portal why it's like this...",
    "Recovering assignments from the void...",
    "Measuring your procrastination levels...",
    "Consulting the Academic Oracles...",
    "Loading student trauma...",
    "Formatting your academic comeback...",
    "Analyzing your sleep schedule (non-existent)...",
    "Detecting academic weapon energy...",
    "Calculating GPA using pure vibes...",
    "Pretending to understand the grading system...",
    "Counting how many times you clicked 'Submit'...",
    "Waking up the server hamsters...",
    "Downloading your personality...",
    "Making sure you pass the vibe check...",
    "Synchronizing with BUE time...",
    "Adding extra spice to your results...",
    "Almost there, don't panic..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      if (!token) return;
      try {
        const data = await demoGetWrap(token);

        // Validate data quality
        if (!data || !data.courses || data.courses.length === 0) {
          throw new Error('No academic data found. Please try again.');
        }

        // Save wrap data to backend for sharing
        navigate("/wrap", { state: { data } });
      } catch (error) {
        console.error("Error fetching wrap data:", error);
        // Clear token since session might be bad
        navigate("/");
      }
    };

    fetchData();
  }, [navigate, token]);

  // Rotate loading messages with a simple fade
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Rotating ribbon loop - The One Loader */}
      <motion.div
        className="mb-12 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="p-8 bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-sm border border-black/20">
          <RibbonElement className="w-32 h-32" variant="loop" />
        </div>
      </motion.div>

      {/* Loading text - rotates between short messages */}
      <div className="h-20 flex items-center justify-center w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-xl md:text-2xl text-gray-600 font-medium tracking-tight"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingPage;
