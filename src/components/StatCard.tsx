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
      className="luxury-card p-6 group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="h-4.5 w-4.5" />
        </div>
        {change && (
          <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{change}</span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;
