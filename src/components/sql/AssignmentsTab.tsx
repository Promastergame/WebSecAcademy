// components/sql/AssignmentsTab.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Bug, Sword, Code2, Sparkles, Trophy, ChevronDown, ChevronUp, Shield, Flame, Stars,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HackSimulator } from './HackSimulator';
import { CodeBattle } from './CodeBattle';
import { CodeEditor } from './CodeEditor';

interface AssignmentsTabProps {
  // оставляем пропсы для совместимости — внутри используем только onXpGain
  tasks: { easy: any[]; medium: any[]; hard: any[] };
  onToggleTask: (d: 'easy'|'medium'|'hard', id: string) => void;
  onToggleChecklist: (d: 'easy'|'medium'|'hard', id: string, item: string) => void;
  onEvidenceChange: (d: 'easy'|'medium'|'hard', id: string, evidence: string) => void;
  onXpGain: (xp: number) => void;
}

type Panel = {
  id: string;
  title: string;
  subtitle: string;
  xp: number;
  icon: React.ReactNode;
  color: 'red' | 'purple' | 'sky';
  render: () => React.ReactNode;
};

const leftBorderClass: Record<Panel['color'], string> = {
  red: 'border-l-4 border-l-red-400',
  purple: 'border-l-4 border-l-purple-400',
  sky: 'border-l-4 border-l-sky-400',
};

export function AssignmentsTab(props: AssignmentsTabProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    p1: true,
    p2: false,
    p3: true,
  });

  const giveXP = (xp: number) => props.onXpGain?.(xp);

  const panels: Panel[] = [
    {
      id: 'p1',
      title: '💥 Взломай форму входа (SQLi)',
      subtitle: 'Режим анти-взлома: попробуй и атаковать, и защищать',
      xp: 100,
      icon: <Bug className="h-4 w-4 text-red-500" />,
      color: 'red',
      render: () => (
        <HackSimulator
          scenario="login"
          onHackSuccess={() => giveXP(100)}
          onDefenseSuccess={() => giveXP(50)}
        />
      ),
    },
    {
      id: 'p2',
      title: '⚔️ Code Battle — уровни защиты',
      subtitle: 'Сражайся с уязвимостями, набирай комбо и очки',
      xp: 300,
      icon: <Sword className="h-4 w-4 text-purple-500" />,
      color: 'purple',
      render: () => (
        <CodeBattle onWin={(score) => giveXP(Math.max(150, Math.min(300, Math.floor(score/5))))} />
      ),
    },
    {
      id: 'p3',
      title: '🧠 SQL Quest — 8 миссий по безопасности',
      subtitle: 'Миссии с теорией, подсказками и красивыми анимациями',
      xp: 200,
      icon: <Code2 className="h-4 w-4 text-sky-500" />,
      color: 'sky',
      render: () => (
        // Новая версия CodeEditor — без пропсов initialCode/solution
        <CodeEditor />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <h2 className="text-xl font-bold">Задания по SQL-инъекциям (3 симулятора)</h2>
      </div>

      {/* Карточки-симуляторы */}
      <div className="flex flex-col gap-6">
        {panels.map((p) => {
          const isOpen = !!open[p.id];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`rounded-lg p-6 border bg-background/70 space-y-4 w-full ${leftBorderClass[p.color]}`}
              style={{
                backgroundImage:
                  'radial-gradient(800px 300px at 0% -10%, rgba(59,130,246,0.06), transparent), radial-gradient(600px 260px at 100% 120%, rgba(16,185,129,0.06), transparent)',
              }}
            >
              {/* Шапка карточки */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {p.icon}
                    <h4 className="font-semibold truncate">{p.title}</h4>
                    {/* красивый бейдж XP */}
                    <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-300 ring-1 ring-amber-300/30 whitespace-nowrap">
                      <Trophy className="inline h-3.5 w-3.5 mr-1" />
                      {p.xp} XP
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.subtitle}</p>

                  {/* Теги */}
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    {p.id === 'p1' && (
                      <>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#взлом</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#аутентификация</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#sql-injection</span>
                      </>
                    )}
                    {p.id === 'p2' && (
                      <>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#параметризация</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#уровни</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#комбо</span>
                      </>
                    )}
                    {p.id === 'p3' && (
                      <>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#миссии</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#теория+практика</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">#анимации</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Кнопка свернуть/развернуть с анимацией иконки */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(s => ({ ...s, [p.id]: !s[p.id] }))}
                  className="group border-white/20 text-foreground hover:bg-white/10"
                >
                  <span className="mr-2">{isOpen ? 'Скрыть' : 'Показать'}</span>
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </motion.span>
                </Button>
              </div>

              {/* Доп. маркеры справа (декор) */}
              <div className="flex items-center gap-2 justify-end -mt-2">
                {p.id === 'p1' && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Анти-взлом
                  </span>
                )}
                {p.id === 'p2' && (
                  <span className="text-xs text-purple-300 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Комбо-очки
                  </span>
                )}
                {p.id === 'p3' && (
                  <span className="text-xs text-sky-300 flex items-center gap-1">
                    <Stars className="h-3.5 w-3.5" /> Теория внутри
                  </span>
                )}
              </div>

              {/* Контент с плавным появлением */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`${p.id}-content`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="pt-2"
                  >
                    {p.render()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AssignmentsTab;
