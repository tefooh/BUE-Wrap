import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { Icon } from "@iconify/react";
import { ChevronDown } from "lucide-react";

import { WrapHero } from "@/components/wrap/WrapHero";
import { WrapPersona } from "@/components/wrap/WrapPersona";
import { WrapPoster } from "@/components/wrap/WrapPoster";

// Type definitions
interface WrapData {
  profile: {
    name: string;
    id: string;
    email: string;
    faculty: string;
    picture: string;
    gpa: string;
    cgpa: string;
    gender?: string | null;
  };
  metrics: {
    totalCourses: number;
    gradedCourses: number;
    gradedItems: number;
    activitiesTotal: number;
    aPlusCount: number;
    aPlusPercentage: number;
    gradeEnergyScore: number;
    ribbonWidth: number;
  };
  bestCourse: { name: string; code: string; grade: string; activities: number } | null;
  worstCourse: { name: string; code: string; grade: string; activities: number } | null;
  mostActiveCourse: { name: string; code?: string; activities: number };
  persona: { name: string; description: string; emoji: string };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  },
  exit: { 
    opacity: 0, 
    transition: { staggerChildren: 0.05, staggerDirection: -1 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, filter: "blur(12px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    filter: "blur(10px)",
    transition: { duration: 0.4, ease: "easeIn" } 
  }
};

// Wrapper for each slide
// Added overflow handling to allow content scrolling without triggering slide change immediately
const WrapSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div 
    className={`w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center p-6 md:p-10 no-scrollbar ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.div 
      className="w-full max-w-lg flex flex-col items-center relative z-10 my-auto"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  </motion.div>
);

const ChillTransition = ({ text, icon, color = "text-gray-900" }: { text: string; icon?: string; color?: string }) => (
  <WrapSection className="bg-gray-50">
    <div className="text-center space-y-10">
      {icon && (
        <motion.div 
          className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]"
          initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={icon} alt="icon" className="w-20 h-20" />
        </motion.div>
      )}
      <motion.h2 
        className="text-4xl font-bold tracking-tight leading-tight max-w-sm mx-auto"
        initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 1.05 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.h2>
    </div>
  </WrapSection>
);

interface WrapPageProps {
  sharedData?: WrapData;
}

const WrapPage = ({ sharedData }: WrapPageProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = sharedData || (location.state?.data as WrapData | undefined);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Gender-tagged PFP comments. You can freely edit or extend this list.
  // gender: "m" = male only, "f" = female only, "both" = shown to everyone/unknown.
  const pfpComments = [
    { text: "attendance seeker", gender: "both" },
    { text: "you look like an F student", gender: "both" },
    { text: "are you a repeater?", gender: "m" },
    { text: "such a nerd", gender: "f" },
    { text: "weirdo vibes detected", gender: "f" },
    { text: "psycho but in a dedicated way", gender: "both" },
    { text: "emo energy unlocked", gender: "f" },
    { text: "autopilot student mode: ON", gender: "both" },
    { text: "main character energy", gender: "both" },
    { text: "certified overthinker", gender: "both" },
    { text: "chronic procrastinator vibes", gender: "both" },
    { text: "looks innocent, probably isn't", gender: "both" },
    { text: "the quiet one who knows everything", gender: "both" },
    { text: "professional daydreamer", gender: "both" },
    { text: "runs on coffee and chaos", gender: "both" },
    { text: "sleeps in class, aces exams", gender: "both" },
    { text: "group project ghost", gender: "both" },
    { text: "always late but worth the wait", gender: "f" },
    { text: "chronically online student", gender: "both" },
    { text: "academic weapon in disguise", gender: "both" },
    { text: "looks tired, is tired", gender: "both" },
    { text: "the one who asks 'is this graded?'", gender: "both" },
    { text: "professional excuse maker", gender: "both" },
    { text: "study? what's that?", gender: "both" },
    { text: "living on borrowed time", gender: "both" },
  ] as const;

  const genderTag = useMemo<"m" | "f" | "unknown">(() => {
    const g = (data as any)?.profile?.gender ?? (location.state as any)?.data?.profile?.gender;
    const lower = typeof g === "string" ? g.toLowerCase() : "";
    if (lower === "male") return "m";
    if (lower === "female") return "f";
    return "unknown";
  }, [data, location.state]);

  const filteredPfpComments = useMemo(() => {
    if (genderTag === "m") return pfpComments.filter(c => c.gender === "m" || c.gender === "both");
    if (genderTag === "f") return pfpComments.filter(c => c.gender === "f" || c.gender === "both");
    return pfpComments;
  }, [genderTag]);

  const randomComment = useMemo(() => {
    const list = filteredPfpComments.length ? filteredPfpComments : pfpComments;
    return list[Math.floor(Math.random() * list.length)].text;
  }, [filteredPfpComments]);

  const submittedItemsComments = [
    "Your laptop deserves a salary at this point.",
    "Ctrl+C, Ctrl+V champion of the year.",
    "Your keyboard called, it wants a break.",
    "Assignment speedrun any% world record.",
    "Professional deadline dodger.",
    "Sleep? Never heard of her.",
    "Caffeine-powered submission machine.",
    "Your printer is tired of you.",
    "Last-minute legend status: unlocked.",
    "PDF export master class.",
    "The 11:59 PM warrior.",
    "Your WiFi deserves hazard pay.",
    "Submission streak: unbreakable.",
    "Academic grind never stops.",
    "Your laptop fan is screaming.",
    "Turnitin's favorite customer.",
    "Assignment collector extraordinaire.",
    "The midnight oil is running low.",
    "Your charger works overtime too.",
    "Deadline anxiety? What's that?",
    "Professional procrastinator turned pro.",
    "Your downloads folder is crying.",
    "Canvas notification PTSD unlocked.",
    "The submit button fears you.",
  ];

  const randomSubmittedComment = useMemo(() => {
    return submittedItemsComments[Math.floor(Math.random() * submittedItemsComments.length)];
  }, []);

  const silentModeComments = [
    "We won't talk about this one.",
    "Let's pretend this didn't happen.",
    "Moving on swiftly...",
    "This course? Never heard of it.",
    "Selective memory activated.",
    "Not our proudest moment.",
    "The forbidden subject.",
    "What course? I don't see anything.",
    "This one stays in the vault.",
    "Classified information.",
    "Error 404: Effort not found.",
    "We don't speak of the dark times.",
    "Ghosting: professional level.",
    "Invisible mode: engaged.",
    "This course ghosted you back.",
    "Attendance? Optional apparently.",
    "The one that got away... from your GPA.",
    "Witness protection program participant.",
    "Strategic avoidance: mastered.",
    "This never happened. Understood?",
    "Swept under the academic rug.",
    "The course we don't mention at family dinners.",
    "Stealth mode: 100% successful.",
    "Out of sight, out of mind.",
  ];

  const randomSilentComment = useMemo(() => {
    return silentModeComments[Math.floor(Math.random() * silentModeComments.length)];
  }, []);

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data, navigate]);

  const sanitizedData = useMemo(() => {
    if (!data) return null;
    return {
      profile: data.profile ?? { name: "Student", id: "", email: "", faculty: "BUE Student", picture: "", gpa: "0.0", cgpa: "0.0" },
      metrics: data.metrics ?? { totalCourses: 0, gradedCourses: 0, gradedItems: 0, activitiesTotal: 0, aPlusCount: 0, aPlusPercentage: 0, gradeEnergyScore: 0, ribbonWidth: 0 },
      bestCourse: data.bestCourse ?? null,
      worstCourse: data.worstCourse ?? null,
      mostActiveCourse: data.mostActiveCourse ?? { name: "N/A", code: "", activities: 0 },
      persona: data.persona ?? { name: "The Rising Star", description: "Your journey begins!", emoji: "⭐" },
    };
  }, [data]);

  const steps = useMemo(() => {
    if (!sanitizedData) return [];
    const { profile, metrics, worstCourse, bestCourse, mostActiveCourse, persona } = sanitizedData;
    const firstName = profile.name.split(" ")[0];

    const aPlusCount = metrics.aPlusCount ?? 0;
    let aPlusComment = "Certified Grade Hunter";
    if (aPlusCount === 0) {
      aPlusComment = "Season 2: A+ arc loading";
    } else if (aPlusCount > 0 && aPlusCount <= 2) {
      aPlusComment = "A+ starter pack unlocked";
    } else if (aPlusCount > 2 && aPlusCount <= 6) {
      aPlusComment = "Solid A+ collection secured";
    } else if (aPlusCount > 6) {
      aPlusComment = "Certified Grade Hunter";
    }

    return [
      // 1. Welcome
      <WrapSection className="bg-white">
        <div className="text-center space-y-10">
          <motion.h1 
            className="text-6xl font-bold leading-none tracking-tighter"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)", scale: 1.05 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {firstName},<br/>your BUE Wrap<br/>is ready.
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-500 font-medium bg-gray-100/80 backdrop-blur-md inline-block px-8 py-4 rounded-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Brace yourself.
          </motion.p>
        </div>
      </WrapSection>,

      // 2. Chill 1
      <ChillTransition text="First, let's check the vibe." icon="/icons3d/3dicons-flash-dynamic-color.png" color="text-yellow-500" />,

      // 3. Grade Energy
      <WrapSection>
         <WrapHero gradeEnergy={metrics.gradeEnergyScore} />
      </WrapSection>,

      // 4. Chill 2
      <ChillTransition text="Okay, time for the heavy lifting." icon="/icons3d/3dicons-pencil-dynamic-color.png" color="text-blue-500" />,

      // 5. Total A+
      <WrapSection>
        <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full text-center border border-gray-100/50 aspect-square flex flex-col justify-center items-center backdrop-blur-xl">
          <motion.div 
            variants={itemVariants} 
            className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ 
              duration: 1.0, 
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <img src="/icons3d/3dicons-star-dynamic-color.png" alt="star" className="w-16 h-16" />
          </motion.div>
          <motion.h2 
            variants={itemVariants} 
            className="text-[6rem] font-bold tracking-tighter text-gray-900 mb-4 leading-none"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 1.1 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {metrics.aPlusCount}
          </motion.h2>
          <motion.p 
            variants={itemVariants} 
            className="text-base font-bold uppercase tracking-widest text-gray-400 mb-4"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ 
              duration: 0.8, 
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            Total A+ Scores
          </motion.p>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-600 shadow-sm"
            initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-[pulse_1.8s_ease_infinite]" />
            <span className="uppercase tracking-[0.25em]">{aPlusComment}</span>
          </motion.div>
        </div>
      </WrapSection>,

      // 6. GPA
      <WrapSection>
        <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full text-center border border-gray-100/50 aspect-square flex flex-col justify-center items-center backdrop-blur-xl">
          <motion.div 
            variants={itemVariants} 
            className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ 
              duration: 1.0, 
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <img src="/icons3d/3dicons-notebook-dynamic-color.png" alt="notebook" className="w-16 h-16" />
          </motion.div>
          <motion.h2 
            variants={itemVariants} 
            className="text-[5rem] font-bold tracking-tighter mb-4 leading-none text-gray-900"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 1.1 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {profile.gpa}
          </motion.h2>
          <motion.p 
            variants={itemVariants} 
            className="text-base font-bold uppercase tracking-widest text-gray-400"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ 
              duration: 0.8, 
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            Average GPA
          </motion.p>
        </div>
      </WrapSection>,

      // 7. Assignments
      <WrapSection>
        <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full text-center border border-gray-100/50 backdrop-blur-xl">
           <motion.div 
             className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8"
             initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
             animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
           >
            <img src="/icons3d/3dicons-rocket-dynamic-color.png" alt="rocket" className="w-16 h-16" />
          </motion.div>
          <motion.h2 
            className="text-[6rem] font-bold tracking-tighter text-gray-900 mb-6 leading-none"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 1.1 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {metrics.activitiesTotal}
          </motion.h2>
          <motion.p 
            className="text-base font-bold uppercase tracking-widest text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Submitted Items
          </motion.p>
          <motion.div 
            className="bg-gray-50 rounded-2xl p-6 transform rotate-2"
            initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
             <p className="text-gray-600 font-medium italic text-lg leading-relaxed">"{randomSubmittedComment}"</p>
          </motion.div>
        </div>
      </WrapSection>,

      // 8. Chill 3
      <ChillTransition text="Deep breath. We're halfway there." icon="/icons3d/3dicons-cup-dynamic-color.png" color="text-amber-700" />,

      // 9. Best Course
      <WrapSection>
        <div className="w-full bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 min-h-[420px] flex flex-col justify-center backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 mb-10 text-center">
            <motion.div
              className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src="/icons3d/3dicons-thumb-up-dynamic-color.png" alt="thumb up" className="w-16 h-16" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Peak Performance</p>
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {bestCourse?.code ? `${bestCourse.code} - ` : ""}{bestCourse?.name || "N/A"}
              </h3>
            </motion.div>
          </div>

          <motion.div
            className="bg-green-50 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-gray-500 font-medium mb-1">Highest Grade</p>
            <p className="text-5xl font-bold text-green-600">{bestCourse?.grade || "-"}</p>
          </motion.div>
        </div>
      </WrapSection>,

      // 10. Most Active
      <WrapSection>
        <div className="w-full bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 min-h-[420px] flex flex-col justify-center backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 mb-10 text-center">
            <motion.div
              className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src="/icons3d/3dicons-fire-dynamic-color.png" alt="fire" className="w-16 h-16" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Non-Stop Action</p>
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {mostActiveCourse.code ? `${mostActiveCourse.code} - ` : ""}{mostActiveCourse.name}
              </h3>
            </motion.div>
          </div>

          <motion.div
            className="bg-orange-50 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-between text-xl font-medium">
              <span className="text-gray-500">Activity Level</span>
              <span className="text-orange-600">{mostActiveCourse.activities} items</span>
            </div>
          </motion.div>
        </div>
      </WrapSection>,

      // 11. Worst Course
      <WrapSection>
        <div className="w-full bg-white rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 min-h-[420px] flex flex-col justify-center backdrop-blur-xl">
            <div className="flex flex-col items-center gap-6 mb-10 text-center">
              <motion.div 
                className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src="/icons3d/3dicons-thumb-down-dynamic-color.png" alt="thumb down" className="w-16 h-16" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Silent Mode</p>
                <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                  {worstCourse?.code ? `${worstCourse.code} - ` : ""}{worstCourse?.name || "N/A"}
                </h3>
              </motion.div>
            </div>
            <motion.div 
              className="bg-gray-50 rounded-2xl p-8 text-center transform -rotate-1"
              initial={{ opacity: 0, y: 15, filter: "blur(4px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
               <p className="text-gray-500 font-medium text-xl">"{randomSilentComment}"</p>
            </motion.div>
         </div>
      </WrapSection>,

      // 12. Persona
      <WrapSection>
         <WrapPersona persona={persona} />
      </WrapSection>,

      // 13. Profile Pic
      <WrapSection>
        <div className="w-full flex flex-col items-center text-center">
           <motion.div 
             className="relative mb-12"
             initial={{ opacity: 0, scale: 0.85, filter: "blur(15px)" }}
             animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
           >
              <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-60 transform translate-y-4"></div>
              {profile.picture ? (
                 <img src={profile.picture} alt={profile.name} className="relative w-64 h-64 rounded-full object-cover border-[8px] border-white shadow-[0_30px_60px_-10px_rgba(0,0,0,0.15)]" />
              ) : (
                <div className="relative w-64 h-64 rounded-full bg-gray-200 border-[8px] border-white shadow-[0_30px_60px_-10px_rgba(0,0,0,0.15)] flex items-center justify-center">
                   <span className="text-8xl">😎</span>
                </div>
              )}
           </motion.div>
           <motion.div 
             className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/50 max-w-sm mx-auto transform rotate-1"
             initial={{ opacity: 0, y: 30, filter: "blur(10px)", scale: 0.9 }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
             transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
           >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{randomComment}</h3>
           </motion.div>
        </div>
      </WrapSection>,

      // 14. Poster
      <WrapSection>
         <div className="mt-16 w-full flex flex-col items-center">
           <WrapPoster data={sanitizedData} />
           <motion.p variants={itemVariants} className="mt-10 text-center text-gray-500 text-sm font-medium">
             Share your BUE Wrap with your friends. <br/> 
             <span className="text-xs opacity-60">No, seriously. Do it.</span>
           </motion.p>
         </div>
      </WrapSection>
    ];
  }, [sanitizedData, randomComment]);

  const goToNext = useCallback(() => {
    if (currentStep < steps.length - 1 && !isScrolling) {
      setIsScrolling(true);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  }, [currentStep, steps.length, isScrolling]);

  const goToPrev = useCallback(() => {
    if (currentStep > 0 && !isScrolling) {
      setIsScrolling(true);
      setCurrentStep(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  }, [currentStep, isScrolling]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Basic check: if we are scrolling a child element, don't trigger slide change unless at edge
    // This is hard to detect perfectly in React without refs to every section
    // But since WrapSection has overflow-y-auto, we can try to detect if the target is scrollable
    
    // Simplification: We will only trigger if the scroll is significant and we are not "stuck"
    // For now, let's keep the strict logic but add a larger threshold
    
    // Also check if target is inside a scrollable container that isn't the main one
    const target = e.target as HTMLElement;
    const scrollable = target.closest('.overflow-y-auto');
    
    if (scrollable) {
       const el = scrollable as HTMLElement;
       const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 5;
       const atTop = el.scrollTop < 5;
       
       if (e.deltaY > 0 && !atBottom) return; // Scrolling down, not at bottom -> let native scroll happen
       if (e.deltaY < 0 && !atTop) return;   // Scrolling up, not at top -> let native scroll happen
    }

    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) goToNext();
      else goToPrev();
    }
  }, [goToNext, goToPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Same logic for touch?
    const target = e.target as HTMLElement;
    const scrollable = target.closest('.overflow-y-auto');
    if (scrollable) {
       const el = scrollable as HTMLElement;
       const atBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 5;
       const atTop = el.scrollTop < 5;
       
       // Swipe Up (scrolling down)
       if (diff > 0 && !atBottom) return; 
       // Swipe Down (scrolling up)
       if (diff < 0 && !atTop) return;
    }

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
         e.preventDefault(); 
         goToNext();
      }
      if (e.key === "ArrowUp") {
         e.preventDefault();
         goToPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  if (!sanitizedData) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full bg-gray-50 font-sfpro text-gray-900 overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      {/* Spline Background (same scene as EntryPage) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 0)" }}>
          <Spline scene="https://prod.spline.design/pzGRFj7ZgBjIrtkf/scene.splinecode" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="h-full w-full absolute inset-0 z-10"
        >
          {steps[currentStep]}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bars - FIXED POSITION */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 flex gap-1 pointer-events-none">
        {steps.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gray-900"
              initial={{ width: "0%" }}
              animate={{ width: idx <= currentStep ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Hint - Only show on first step */}
      <AnimatePresence>
        {currentStep === 0 && (
          <motion.div 
            className="fixed bottom-8 inset-x-0 flex justify-center text-gray-400 z-50 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WrapPage;
