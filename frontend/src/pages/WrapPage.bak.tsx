import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronUp, User, Zap, BookOpen, Award, TrendingUp, TrendingDown, Flame, Sparkles, Share2 } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import { MagicCard } from "@/components/ui/MagicCard";
import { RibbonElement } from "@/components/ui/RibbonElement";

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
  mostActiveCourse: { name: string; activities: number };
  persona: { name: string; description: string; emoji: string };
}

// Slide Components
const HeroSlide = ({ profile }: { profile: WrapData['profile'] }) => {
  const firstName = profile.name?.split(" ")[0] || "Student";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[420px] h-[420px] bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[380px] h-[380px] bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <MagicCard className="w-full max-w-sm flex flex-col items-center py-10 px-8 bg-white/85 backdrop-blur-md rounded-3xl">
        <motion.p
          className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground/70 uppercase mb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          2025 Semester 1
        </motion.p>

        <motion.h1
          className="text-3xl font-bold text-foreground mb-2 tracking-tight"
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {firstName}'s Wrap
        </motion.h1>

        <motion.span
          className="px-4 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          ID {profile.id}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", damping: 16 }}
          className="text-center space-y-1"
        >
          <p className="text-sm text-muted-foreground/80">
            A simple, cinematic look at how your semester went.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Swipe to explore each highlight.
          </p>
        </motion.div>
      </MagicCard>
    </div>
  );
};

const GradeEnergySlide = ({ score }: { score: number }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
    <MagicCard className="w-full max-w-sm py-16 flex flex-col items-center bg-gradient-to-b from-white to-yellow-50/50">
      <motion.div
        className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center mb-8"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />
      </motion.div>
      
      <motion.p
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Grade Energy Score
      </motion.p>
      
      <motion.h1
        className="text-8xl font-bold text-foreground leading-none tracking-tighter"
        initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.4, type: "spring", damping: 15 }}
      >
        {score}
      </motion.h1>
      
      <motion.div
         className="mt-6 px-4 py-2 bg-white rounded-full shadow-sm border border-black/5"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
      >
          <p className="text-xs font-medium text-muted-foreground">Your academic voltage</p>
      </motion.div>
    </MagicCard>
  </div>
);

const StatsSlide = ({ totalCourses, gradedCourses }: { totalCourses: number; gradedCourses: number }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6">
    <motion.p
      className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      The Volume
    </motion.p>

    <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
      <MagicCard className="flex items-center justify-between p-6 rounded-3xl" gradient>
        <div className="text-left">
          <p className="text-sm text-muted-foreground font-medium mb-1">Total Courses</p>
          <p className="text-5xl font-bold text-foreground tracking-tight">{totalCourses}</p>
        </div>
        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-blue-600" />
        </div>
      </MagicCard>

      <MagicCard className="flex items-center justify-between p-6 rounded-3xl" gradient>
        <div className="text-left">
          <p className="text-sm text-muted-foreground font-medium mb-1">Graded Items</p>
          <p className="text-5xl font-bold text-foreground tracking-tight">{gradedCourses}</p>
        </div>
        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
          <Award className="w-7 h-7 text-green-600" />
        </div>
      </MagicCard>
    </div>
  </div>
);

const BestCourseSlide = ({ course }: { course: WrapData['bestCourse'] }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6">
    <MagicCard className="w-full max-w-sm py-12 px-8 flex flex-col items-center text-center bg-gradient-to-b from-white to-green-50/50">
      <motion.div
        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <TrendingUp className="w-8 h-8 text-green-600" />
      </motion.div>

      <motion.span
        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Top Performance
      </motion.span>

      <motion.h1
        className="text-3xl font-bold text-foreground leading-tight mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {course?.name || 'N/A'}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="relative"
      >
         <span className="text-8xl font-bold text-green-600 tracking-tighter opacity-10 absolute left-1/2 -translate-x-1/2 -top-4 select-none">A+</span>
         <p className="text-6xl font-bold text-green-600 tracking-tight relative z-10">{course?.grade}</p>
      </motion.div>
    </MagicCard>
  </div>
);

const WorstCourseSlide = ({ course }: { course: WrapData['worstCourse'] }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6">
     <MagicCard className="w-full max-w-sm py-12 px-8 flex flex-col items-center text-center bg-gradient-to-b from-white to-orange-50/50">
      <motion.div
        className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <TrendingDown className="w-8 h-8 text-orange-600" />
      </motion.div>

      <motion.span
        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Focus Area
      </motion.span>

      <motion.h1
        className="text-3xl font-bold text-foreground leading-tight mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {course?.name || 'N/A'}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
         <p className="text-6xl font-bold text-orange-500 tracking-tight">{course?.grade}</p>
      </motion.div>
    </MagicCard>
  </div>
);

const APlusSlide = ({ percentage, count, total }: { percentage: number; count: number; total: number }) => {
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
      <MagicCard className="w-full max-w-sm py-12 flex flex-col items-center rounded-3xl">
        <motion.p
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            A+ Frequency
        </motion.p>

        <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
        >
            <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(0 0% 96%)" strokeWidth={strokeWidth} />
            <motion.circle
                cx={size/2} cy={size/2} r={radius} fill="none"
                stroke="hsl(0 0% 10%)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-foreground">{percentage}%</span>
            </div>
        </motion.div>

        <div className="flex gap-4 mt-2">
          <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl">
            <span className="block text-xl font-bold">{count}</span>
            <span className="text-xs text-muted-foreground">A+ grades</span>
          </div>
          <div className="text-center px-4 py-2 bg-gray-50 rounded-2xl">
            <span className="block text-xl font-bold text-muted-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">Total courses</span>
          </div>
        </div>
      </MagicCard>
    </div>
  );
};

const MostActiveSlide = ({ courseName, activities }: { courseName: string; activities: number }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
    <MagicCard className="w-full max-w-sm py-12 px-6 flex flex-col items-center bg-gradient-to-tr from-orange-50 via-white to-white">
        <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
        >
            <Flame className="w-10 h-10 text-white fill-white" />
        </motion.div>

        <motion.p
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            Most Active Course
        </motion.p>

        <motion.h1
            className="text-3xl font-bold text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            {courseName}
        </motion.h1>

        <motion.div
            className="flex items-center gap-3 bg-white border border-orange-100 rounded-full pl-5 pr-2 py-1.5 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
        >
            <span className="text-xl font-bold text-orange-600">{activities}</span>
            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">Activities</span>
        </motion.div>
    </MagicCard>
  </div>
);

const ConsistencySlide = ({ ribbonWidth, gradedItems, activitiesTotal }: { ribbonWidth: number; gradedItems: number; activitiesTotal: number }) => {
  const getLevel = () => {
    if (ribbonWidth >= 80) return { label: "Exceptional", color: "from-green-500 to-emerald-500" };
    if (ribbonWidth >= 60) return { label: "Strong", color: "from-blue-500 to-cyan-500" };
    if (ribbonWidth >= 40) return { label: "Steady", color: "from-yellow-500 to-orange-500" };
    return { label: "Building", color: "from-purple-500 to-pink-500" };
  };
  const { label, color } = getLevel();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
      <MagicCard className="w-full max-w-sm py-12 flex flex-col items-center">
        <motion.p
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            Consistency Ribbon
        </motion.p>

        <motion.h1
            className="text-4xl font-bold text-foreground mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
          {label}
        </motion.h1>

        <div className="w-full max-w-[280px] relative">
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(ribbonWidth, 100)}%` }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            />
          </div>
            
          <div className="flex justify-between mt-4 text-xs font-medium text-muted-foreground">
            <div className="text-center">
              <span className="block text-foreground font-bold text-lg">{gradedItems}</span>
              <span>Graded items</span>
            </div>
            <div className="text-center">
              <span className="block text-foreground font-bold text-lg">{activitiesTotal}</span>
              <span>Activities</span>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  );
};

// ... (rest of the code remains the same)

const PersonaSlide = ({ persona }: { persona: WrapData['persona'] }) => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 via-transparent to-black/5" />
    <MagicCard className="w-full max-w-sm py-16 bg-white rounded-3xl shadow-xl relative z-10">
      <motion.div
        className="flex justify-center gap-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </motion.div>

      <motion.div
        className="text-8xl mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, type: "spring", damping: 15 }}
      >
        {persona.emoji}
      </motion.div>

      <motion.p
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Your Academic Persona
      </motion.p>

      <motion.h1
        className="text-3xl font-bold text-foreground mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {persona.name}
      </motion.h1>

      <motion.p
        className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {persona.description}
      </motion.p>
    </MagicCard>
  </div>
);

const SummarySlide = ({ data, onStartOver, onShare }: { data: WrapData; onStartOver: () => void; onShare: () => void }) => {
  const profile = data.profile || { name: "Student", id: "", faculty: "BUE" };
  const metrics = data.metrics;
  const persona = data.persona;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
      <motion.div
        className="w-full max-w-sm mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-6">
          {profile.picture ? (
            <img
              src={profile.picture}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              alt=""
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold leading-none">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.faculty}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MagicCard className="p-4 flex flex-col items-center text-center bg-gray-50 border-none shadow-none rounded-2xl">
            <Zap className="w-6 h-6 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold">{metrics.gradeEnergyScore}</span>
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Energy Score</span>
          </MagicCard>
          <MagicCard className="p-4 flex flex-col items-center text-center bg-gray-50 border-none shadow-none rounded-2xl">
            <span className="text-2xl mb-2">{persona.emoji}</span>
            <span className="text-sm font-bold truncate w-full">{persona.name}</span>
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Persona</span>
          </MagicCard>
          <MagicCard className="p-4 flex flex-col items-center text-center bg-gray-50 border-none shadow-none rounded-2xl">
            <Award className="w-6 h-6 text-green-500 mb-2" />
            <span className="text-2xl font-bold">{metrics.aPlusCount}</span>
            <span className="text-[10px] uppercase text-muted-foreground font-bold">A+ Grades</span>
          </MagicCard>
          <MagicCard className="p-4 flex flex-col items-center text-center bg-gray-50 border-none shadow-none rounded-2xl">
            <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{metrics.totalCourses}</span>
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Courses</span>
          </MagicCard>
        </div>
      </motion.div>

      <motion.div
        className="flex gap-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PillButton className="flex-1 shadow-lg shadow-black/5" size="lg" onClick={onShare}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </PillButton>
        <PillButton variant="secondary" className="flex-1" size="lg" onClick={onStartOver}>
          Start Over
        </PillButton>
      </motion.div>
    </div>
  );
};

// Main WrapPage Component
const WrapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data as WrapData | undefined;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data, navigate]);

  // Build slides array
  const slides = useMemo(() => {
    if (!data) return [];
    
    const profile = data.profile || { name: 'Student', id: '', email: '', faculty: 'BUE Student', picture: '', gpa: '', cgpa: '' };
    const metrics = data.metrics || { totalCourses: 0, gradedCourses: 0, gradedItems: 0, activitiesTotal: 0, aPlusCount: 0, aPlusPercentage: 0, gradeEnergyScore: 0, ribbonWidth: 0 };
    const bestCourse = data.bestCourse || null;
    const worstCourse = data.worstCourse || null;
    const mostActiveCourse = data.mostActiveCourse || { name: 'N/A', activities: 0 };
    const persona = data.persona || { name: 'The Rising Star', description: 'Your journey begins!', emoji: '⭐' };

    return [
      { id: 'hero', component: <HeroSlide profile={profile} /> },
      { id: 'energy', component: <GradeEnergySlide score={metrics.gradeEnergyScore} /> },
      { id: 'stats', component: <StatsSlide totalCourses={metrics.totalCourses} gradedCourses={metrics.gradedCourses} /> },
      { id: 'best', component: <BestCourseSlide course={bestCourse} /> },
      { id: 'worst', component: <WorstCourseSlide course={worstCourse} /> },
      { id: 'aplus', component: <APlusSlide percentage={metrics.aPlusPercentage} count={metrics.aPlusCount} total={metrics.totalCourses} /> },
      { id: 'active', component: <MostActiveSlide courseName={mostActiveCourse.name} activities={mostActiveCourse.activities} /> },
      { id: 'consistency', component: <ConsistencySlide ribbonWidth={metrics.ribbonWidth} gradedItems={metrics.gradedItems} activitiesTotal={metrics.activitiesTotal} /> },
      { id: 'persona', component: <PersonaSlide persona={persona} /> },
      { id: 'summary', component: <SummarySlide data={data} onStartOver={() => navigate("/")} onShare={() => navigate("/share", { state: { data } })} /> },
    ];
  }, [data, navigate]);

  const totalSlides = slides.length;

  const goToNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const goToPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
      goToNext();
    } else if (info.offset.y > threshold) {
      goToPrev();
    }
  }, [goToNext, goToPrev]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      goToNext();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goToPrev();
    }
  }, [goToNext, goToPrev]);

  if (!data) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-[100dvh] w-full bg-background overflow-hidden relative touch-none select-none font-sans"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_70%)]" />
      </div>

      {/* Progress indicators */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-foreground h-6 shadow-md" : "bg-muted-foreground/20 h-1.5"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <AnimatePresence>
        {currentSlide === 0 && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-bold">Swipe to Explore</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronUp className="w-5 h-5 text-muted-foreground/50 rotate-180" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full w-full"
        >
          {slides[currentSlide]?.component}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default WrapPage;
