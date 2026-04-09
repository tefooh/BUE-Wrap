import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

interface WrapCoursesProps {
  bestCourse: { name: string; grade: string } | null;
  worstCourse: { name: string; grade: string } | null;
  mostActive: { name: string; activities: number };
}

const FlipCard = ({ title, course, grade, icon: Icon, color, backTitle }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[4/5] perspective-1000 group cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br ${color} shadow-sm border border-white/20`}>
          <div className="bg-white/90 p-3 rounded-full mb-4 shadow-sm">
            <Icon className="w-6 h-6 text-gray-800" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">{title}</p>
          <h3 className="text-xl font-bold text-white leading-tight">{course?.name || "N/A"}</h3>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-white shadow-sm border border-gray-100`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{backTitle}</p>
          <p className={`text-6xl font-bold ${color.includes('green') ? 'text-green-500' : 'text-orange-500'}`}>
            {course?.grade || "-"}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const WrapCourses = ({ bestCourse, worstCourse, mostActive }: WrapCoursesProps) => {
  return (
    <div className="w-full px-6 py-10 space-y-8">
      {/* Most Active Course */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Flame className="w-6 h-6 fill-orange-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Most Active Course</p>
            <h3 className="text-lg font-bold text-gray-900 leading-none">{mostActive.name}</h3>
          </div>
        </div>
        
        <div className="space-y-2">
           <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-500">Activity Level</span>
              <span className="text-orange-600">{mostActive.activities} items</span>
           </div>
           <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
             <motion.div
               initial={{ width: 0 }}
               whileInView={{ width: "100%" }}
               transition={{ duration: 1.5, delay: 0.2 }}
               className="h-full bg-gradient-to-r from-orange-500 to-red-500"
             />
           </div>
        </div>
      </motion.div>

      {/* Best & Worst Flip Cards */}
      <div className="grid grid-cols-2 gap-4">
        <FlipCard 
          title="Best" 
          course={bestCourse} 
          grade={bestCourse?.grade} 
          icon={TrendingUp} 
          color="from-green-500 to-emerald-600"
          backTitle="Your Grade"
        />
        <FlipCard 
          title="Focus" 
          course={worstCourse} 
          grade={worstCourse?.grade} 
          icon={TrendingDown} 
          color="from-orange-400 to-red-500"
          backTitle="Your Grade"
        />
      </div>
    </div>
  );
};
