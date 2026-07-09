import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  index?: number;
}

const StatCard = ({ label, value, change, icon: Icon, index = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-panel p-6 group cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 border border-white/10 group-hover:border-primary/50">
          <Icon className="h-4.5 w-4.5 text-white/70 group-hover:text-white" />
        </div>
        {change && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">{change}</span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="text-sm text-white/60 mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;
