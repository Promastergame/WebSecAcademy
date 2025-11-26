import { useState, useEffect } from 'react';
import { Database, BookOpen, HelpCircle, ClipboardList, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressCard } from '@/components/shared/ProgressCard';
import { TheoryTab } from '@/components/sql/TheoryTab';
import { QuizTab } from '@/components/sql/QuizTab';
import { AssignmentsTab } from '@/components/sql/AssignmentsTab';
import { storage } from '@/lib/storage';
import { SqlProgress, Task } from '@/types/sql';
import { easyTasks, mediumTasks, hardTasks } from '@/data/sqlTasks';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'websec:sql:v1';

export default function SqlInjection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('theory');
  const [theoryRead, setTheoryRead] = useState(true); // По умолчанию true для доступа ко всем табам
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [tasks, setTasks] = useState<{ easy: Task[]; medium: Task[]; hard: Task[] }>({
    easy: easyTasks,
    medium: mediumTasks,
    hard: hardTasks,
  });

  // Load progress
  useEffect(() => {
    const saved = storage.get<SqlProgress>(STORAGE_KEY);
    if (saved) {
      setTheoryRead(saved.theoryRead);
      setQuizAnswers(saved.quizAnswers);

      // Restore tasks
      const restoreTasks = (difficulty: 'easy' | 'medium' | 'hard', template: Task[]) => {
        return template.map((task) => {
          const savedTask = saved.tasks[difficulty][task.id];
          if (!savedTask) return task;

          return {
            ...task,
            evidence: savedTask.evidence || '',
            completed: savedTask.completed || false,
            checklist: task.checklist.map((item) => ({
              ...item,
              completed: savedTask.checklist[item.id] || false,
            })),
          };
        });
      };

      setTasks({
        easy: restoreTasks('easy', easyTasks),
        medium: restoreTasks('medium', mediumTasks),
        hard: restoreTasks('hard', hardTasks),
      });
    }
  }, []);

  // Save progress
  const saveProgress = (updatedData?: Partial<{ theoryRead: boolean; quizAnswers: Record<number, number>; tasks: any }>) => {
    const data = {
      theoryRead: updatedData?.theoryRead ?? theoryRead,
      quizAnswers: updatedData?.quizAnswers ?? quizAnswers,
      tasks: updatedData?.tasks ?? tasks,
    };

    const progress: SqlProgress = {
      theoryRead: data.theoryRead,
      quizAnswers: data.quizAnswers,
      tasks: {
        easy: Object.fromEntries(
          data.tasks.easy.map((t: Task) => [
            t.id,
            {
              checklist: Object.fromEntries(t.checklist.map((c) => [c.id, c.completed])),
              evidence: t.evidence,
              completed: t.completed,
            },
          ])
        ),
        medium: Object.fromEntries(
          data.tasks.medium.map((t: Task) => [
            t.id,
            {
              checklist: Object.fromEntries(t.checklist.map((c) => [c.id, c.completed])),
              evidence: t.evidence,
              completed: t.completed,
            },
          ])
        ),
        hard: Object.fromEntries(
          data.tasks.hard.map((t: Task) => [
            t.id,
            {
              checklist: Object.fromEntries(t.checklist.map((c) => [c.id, c.completed])),
              evidence: t.evidence,
              completed: t.completed,
            },
          ])
        ),
      },
    };

    storage.set(STORAGE_KEY, progress);
    toast({ title: 'Прогресс сохранён', duration: 2000 });
  };

  // Calculate progress
  const theoryPercent = theoryRead ? 100 : 0;

  const quizPercent = Object.keys(quizAnswers).length > 0
    ? Math.round(
        (Object.keys(quizAnswers).filter((id) => {
          const correctIndex = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1][parseInt(id) - 1];
          return quizAnswers[parseInt(id)] === correctIndex;
        }).length /
          10) *
          100
      )
    : 0;

  const allTasks = [...tasks.easy, ...tasks.medium, ...tasks.hard];
  const totalChecklistItems = allTasks.reduce((sum, t) => sum + t.checklist.length, 0);
  const completedChecklistItems = allTasks.reduce(
    (sum, t) => sum + t.checklist.filter((c) => c.completed).length,
    0
  );
  const tasksPercent =
    totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  const totalPercent = Math.round((theoryPercent + quizPercent + tasksPercent) / 3);

  const admitBadge =
    totalPercent >= 90 ? 'Готов к продакшену' : totalPercent >= 60 ? 'Норм, доработать' : 'Нужна работа';
  const admitColor =
    totalPercent >= 90 ? 'text-success' : totalPercent >= 60 ? 'text-warning' : 'text-muted-foreground';

  // Handlers
  const handleTheoryReadChange = (value: boolean) => {
    setTheoryRead(value);
    saveProgress({ theoryRead: value });
  };

  const handleQuizAnswer = (questionId: number, optionIndex: number) => {
    const updated = { ...quizAnswers, [questionId]: optionIndex };
    setQuizAnswers(updated);
    saveProgress({ quizAnswers: updated });
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    saveProgress({ quizAnswers: {} });
  };

  const handleToggleTask = (difficulty: 'easy' | 'medium' | 'hard', taskId: string) => {
    const updatedTasks = {
      ...tasks,
      [difficulty]: tasks[difficulty].map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    };
    setTasks(updatedTasks);
    saveProgress({ tasks: updatedTasks });
  };

  const handleToggleChecklist = (difficulty: 'easy' | 'medium' | 'hard', taskId: string, itemId: string) => {
    const updatedTasks = {
      ...tasks,
      [difficulty]: tasks[difficulty].map((t) => {
        if (t.id !== taskId) return t;
        const newChecklist = t.checklist.map((c) => (c.id === itemId ? { ...c, completed: !c.completed } : c));
        const allChecked = newChecklist.every((c) => c.completed);
        return { ...t, checklist: newChecklist, completed: allChecked };
      }),
    };
    setTasks(updatedTasks);
    saveProgress({ tasks: updatedTasks });
  };

  const handleEvidenceChange = (difficulty: 'easy' | 'medium' | 'hard', taskId: string, evidence: string) => {
    const updatedTasks = {
      ...tasks,
      [difficulty]: tasks[difficulty].map((t) => (t.id === taskId ? { ...t, evidence } : t)),
    };
    setTasks(updatedTasks);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('theory');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('quiz');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('assignments');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-3 rounded-xl gradient-primary">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold">SQL Injection</h1>
        </div>
        <p className="text-muted-foreground">Модуль обучения: механизмы атак и защита</p>
      </div>

      {/* Progress Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ProgressCard icon={BookOpen} label="Теория" percent={theoryPercent} />
        <ProgressCard icon={HelpCircle} label="Квиз" percent={quizPercent} />
        <ProgressCard icon={ClipboardList} label="Задания" percent={tasksPercent} />
        <div className="glass-hover rounded-lg p-4 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Итого</p>
              <p className="text-2xl font-bold text-primary">{totalPercent}%</p>
            </div>
          </div>
          <div className={`text-sm font-medium ${admitColor}`}>{admitBadge}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass">
          <TabsTrigger value="theory">
            <BookOpen className="h-4 w-4 mr-2" />
            Теория
            <kbd className="ml-2 hidden sm:inline-block px-2 py-0.5 text-xs bg-muted rounded">Ctrl+1</kbd>
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <HelpCircle className="h-4 w-4 mr-2" />
            Квиз
            <kbd className="ml-2 hidden sm:inline-block px-2 py-0.5 text-xs bg-muted rounded">Ctrl+2</kbd>
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <ClipboardList className="h-4 w-4 mr-2" />
            Задания
            <kbd className="ml-2 hidden sm:inline-block px-2 py-0.5 text-xs bg-muted rounded">Ctrl+3</kbd>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theory">
          <TheoryTab theoryRead={theoryRead} onTheoryReadChange={handleTheoryReadChange} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizTab answers={quizAnswers} onAnswer={handleQuizAnswer} onReset={handleQuizReset} />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentsTab
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onToggleChecklist={handleToggleChecklist}
            onEvidenceChange={handleEvidenceChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
