import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Activity, Star, Percent, Award } from "lucide-react";

interface WrapStatsProps {
  metrics: {
    totalCourses: number;
    gradedCourses: number;
    gradedItems: number;
    activitiesTotal: number;
    aPlusCount: number;
    aPlusPercentage: number;
  };
}

const StatCard = ({ label, value, icon: Icon, delay, color }: { label: string; value: string | number; icon: any; delay: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white rounded-[32px] p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100/50 flex flex-col items-center justify-center text-center gap-2 aspect-square backdrop-blur-sm"
  >
    <div className={`p-2.5 rounded-2xl ${color} bg-opacity-10`}>
      <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{label}</span>
  </motion.div>
);

export const WrapStats = ({ metrics }: WrapStatsProps) => {
  return (
    <div className="w-full px-6 py-10">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-6 text-center"
      >
        <h2 className="text-xl font-bold text-gray-900">The Numbers</h2>
        <p className="text-sm text-gray-500">Your semester at a glance</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
        <StatCard 
          label="Courses" 
          value={metrics.totalCourses} 
          icon={BookOpen} 
          delay={0.1} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Graded" 
          value={metrics.gradedCourses} 
          icon={CheckCircle} 
          delay={0.15} 
          color="bg-green-500" 
        />
        <StatCard 
          label="Items" 
          value={metrics.gradedItems} 
          icon={Award} 
          delay={0.2} 
          color="bg-purple-500" 
        />
        <StatCard 
          label="Activities" 
          value={metrics.activitiesTotal} 
          icon={Activity} 
          delay={0.25} 
          color="bg-orange-500" 
        />
        <StatCard 
          label="A+ Grades" 
          value={metrics.aPlusCount} 
          icon={Star} 
          delay={0.3} 
          color="bg-yellow-500" 
        />
        <StatCard 
          label="A+ Rate" 
          value={`${metrics.aPlusPercentage}%`} 
          icon={Percent} 
          delay={0.35} 
          color="bg-pink-500" 
        />
      </div>
    </div>
  );
};
