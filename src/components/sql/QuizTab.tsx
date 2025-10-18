// /src/components/sql/QuizTab.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Trophy,
  Crown,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/types/sql";
import { sqlQuizQuestions } from "@/data/sqlQuiz";

/* --------------------------- Нейтральные карточки -------------------------- */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"rounded-xl bg-card border border-border shadow-sm " + className}>
      {children}
    </div>
  );
}

/* ---------------------- Анимированные галочка / крестик -------------------- */
/** компактная «люксовая» галочка: рисуется по кругу и галке */
function FancyCheck({ show, size = 28 }: { show: boolean; size?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 60 60"
          initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.92, rotate: 3 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <defs>
            <linearGradient id="ok_grad_ui" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="30"
            cy="30"
            r="22"
            fill="none"
            stroke="url(#ok_grad_ui)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, filter: "drop-shadow(0 0 0 rgba(34,197,94,0))" }}
            animate={{ pathLength: 1, filter: "drop-shadow(0 0 10px rgba(34,197,94,0.35))" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.path
            d="M19 31 L28 39 L42 21"
            fill="none"
            stroke="url(#ok_grad_ui)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.28, duration: 0.55, ease: "easeOut" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

/** компактный крестик: два штриха рисуются по очереди */
function FancyCross({ show, size = 28 }: { show: boolean; size?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 60 60"
          initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.92, rotate: -3 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <defs>
            <linearGradient id="bad_grad_ui" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="30"
            cy="30"
            r="22"
            fill="none"
            stroke="url(#bad_grad_ui)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, filter: "drop-shadow(0 0 0 rgba(239,68,68,0))" }}
            animate={{ pathLength: 1, filter: "drop-shadow(0 0 10px rgba(239,68,68,0.35))" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.path
            d="M21 21 L39 39"
            fill="none"
            stroke="url(#bad_grad_ui)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.24, duration: 0.32, ease: "easeOut" }}
          />
          <motion.path
            d="M39 21 L21 39"
            fill="none"
            stroke="url(#bad_grad_ui)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.46, duration: 0.32, ease: "easeOut" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

/* ----------------------- Центрированная canvas-конфетти --------------------- */
function Confetti({
  fire,
  life = 2200,
  density = 120,
}: {
  fire: boolean;
  life?: number;
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const W = Math.max(1, rect.width);
    const H = Math.max(1, rect.height);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const ORIGIN_X = W / 2;
    const ORIGIN_Y = H / 2;
    const colors = ["#22c55e", "#60a5fa", "#f59e0b", "#a78bfa"];
    const N = density;

    const parts = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 2.6;
      return {
        x: ORIGIN_X,
        y: ORIGIN_Y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        g: 0.06 + Math.random() * 0.08,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.004 + Math.random() * 0.004,
      };
    });

    let start = performance.now();
    const loop = (t: number) => {
      if (t - start > life) {
        ctx.clearRect(0, 0, W, H);
        if (raf.current) cancelAnimationFrame(raf.current);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, p.life - p.decay);

        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life + 0.15);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.8, -p.size * 0.2, p.size * 1.6, p.size * 0.4);
        ctx.restore();
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [fire, life, density]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}

/* ----------------------------------- Квиз ---------------------------------- */
interface QuizTabProps {
  answers: Record<number, number>;
  onAnswer: (questionId: number, optionIndex: number) => void;
  onReset: () => void;
}

export function QuizTab({ answers, onAnswer, onReset }: QuizTabProps) {
  const [questions] = useState<QuizQuestion[]>(sqlQuizQuestions);

  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers, questions]
  );
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = percent >= 80;

  /* -------- железобетонный сброс визуального выбора -------- */
  const [cleared, setCleared] = useState<Record<number, boolean>>({});
  const [resetVersion, setResetVersion] = useState(0);
  useEffect(() => {
    const init: Record<number, boolean> = {};
    questions.forEach((q) => (init[q.id] = false));
    setCleared(init);
  }, [questions]);

  const handleReset = () => {
    onReset?.();
    const next: Record<number, boolean> = {};
    questions.forEach((q) => (next[q.id] = true));
    setCleared(next);
    setResetVersion((v) => v + 1); // форс-ремоунт
  };

  const pick = (qId: number, idx: number) => {
    setCleared((m) => ({ ...m, [qId]: false }));
    onAnswer(qId, idx);
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${passed ? "text-emerald-500" : "text-muted-foreground"}`} />
            <span className="font-medium text-foreground">
              Правильных ответов: {correctCount} из {questions.length}
            </span>
          </div>
          <span className={`text-2xl font-bold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
            {percent}%
          </span>
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            key={percent}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="h-full bg-primary"
          />
        </div>

        <AnimatePresence>
          {answeredCount === questions.length && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 flex items-center justify-between border-t border-border pt-2"
            >
              <p className={`text-sm font-medium ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                {passed ? "✓ Квиз пройден! (≥80%)" : "✗ Нужно ≥80% для прохождения"}
              </p>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Вопросы */}
      <div className="space-y-4">
        {questions.map((q) => {
          const key = `${q.id}-${resetVersion}`;
          const uiSelected = cleared[q.id] ? undefined : answers[q.id];
          const isAnswered = uiSelected !== undefined;
          const isCorrect = isAnswered && uiSelected === q.correctIndex;

          return (
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Card className="p-5 relative">
                {/* сдержанная конфетти строго по центру карточки — только при правильном ответе */}
                <Confetti fire={Boolean(isAnswered && isCorrect)} />

                {/* Шапка */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground font-bold text-sm">
                    {q.id}
                  </span>
                  <p className="flex-1 font-medium text-foreground flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    {q.question}
                  </p>
                  <div className="ml-2">
                    <FancyCheck show={isAnswered && isCorrect} />
                    <FancyCross show={isAnswered && !isCorrect} />
                  </div>
                </div>

                {/* Варианты */}
                <RadioGroup
                  key={`rg-${key}`}
                  value={isAnswered ? String(uiSelected) : ""}
                  onValueChange={(value) => pick(q.id, parseInt(value))}
                >
                  <div className="space-y-2">
                    {q.options.map((option, index) => {
                      const isSelected = uiSelected === index;
                      const isCorrectOption = index === q.correctIndex;

                      let box = "border-border hover:bg-muted/50 transition-colors";
                      if (isAnswered) {
                        if (isSelected && isCorrect) box = "bg-emerald-500/10 border-emerald-400";
                        else if (isSelected && !isCorrect) box = "bg-rose-500/10 border-rose-400";
                        else if (isCorrectOption) box = "bg-emerald-500/10 border-emerald-400/70";
                      }

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${box}`}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            id={`q${q.id}-o${index}-${resetVersion}`}
                            disabled={isAnswered}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`q${q.id}-o${index}-${resetVersion}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>

                          {/* мини-иконка у выбранного ответа */}
                          <div className="w-[28px] h-[28px] flex items-center justify-center">
                            <FancyCheck show={isAnswered && isSelected && isCorrect} size={24} />
                            <FancyCross show={isAnswered && isSelected && !isCorrect} size={24} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Объяснение */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`mt-4 p-4 rounded-lg text-sm ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-400/40"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <p className="font-medium mb-1">{isCorrect ? "✓ Правильно!" : "Объяснение:"}</p>
                      <p>{q.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
