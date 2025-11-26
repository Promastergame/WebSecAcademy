import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface ProgressCardProps {
  icon: LucideIcon;
  label: string;
  percent: number;
}

export function ProgressCard({ icon: Icon, label, percent }: ProgressCardProps) {
  return (
    <div className="glass-hover rounded-lg p-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-2xl font-bold text-primary">{percent}%</p>
        </div>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
