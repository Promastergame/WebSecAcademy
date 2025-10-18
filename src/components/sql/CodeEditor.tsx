// /src/components/sql/CodeEditor.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Trophy,
  Sparkles,
  Zap,
  Star,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Shield,
  RefreshCw,
  TimerReset,
  Info,
  ArrowRight,
  Award,
  Flame,
  TerminalSquare,
  Trash2,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

/**
 * CodeEditor — SQL Quest (single-answer, fixed explanations)
 * - При неверном ответе: "✗ Почему неверно:" + "Как правильно:".
 * - При верном ответе: "✓ Почему верно:".
 * - 8 заданий, по одному правильному варианту; расширенная теория и подсказки.
 * - Красивые анимации (галочка/крестик, параллакс, тосты).
 * - Только именованный экспорт.
 * - ✔️ Светлая и тёмная тема (через дизайн-токены shadcn/tailwind).
 */

// ───────────────────────────────────────────────────────────────
// Типы / LocalStorage
// ───────────────────────────────────────────────────────────────
type Choice = { id: string; text: string; correct: boolean; explain: string };
type Task = {
  id: number;
  title: string;
  theory: string;
  hint: string;
  scenario: string;
  choices: Choice[];         // РОВНО 1 correct: true
  timeLimitSec?: number;     // 0/undefined = без таймера
};

const LS = {
  KEY: "sql_quest_single_answer_v2_fix_explanations",
  get<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(k);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(k: string, v: T) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

// ───────────────────────────────────────────────────────────────
// Задания (по одному правильному варианту)
// ───────────────────────────────────────────────────────────────
const TASKS: Task[] = [
  {
    id: 1,
    title: "Вход (логин/пароль)",
    theory:
      "Почему нельзя склеивать логин и пароль в SQL-строку? Пользователь может закрыть кавычку и дописать SQL. Параметризация разделяет КОД и ДАННЫЕ: в запросе ставим плейсхолдеры ?, а реальные значения передаём во втором аргументе (массив). Тогда СУБД не исполнит данные как код. Формула: SELECT ... WHERE username = ? AND password = ?  + [username, password].",
    hint:
      "Два вопроса в WHERE и передай [username, password] отдельно. Никаких строковых склеек.",
    scenario:
      "Сейчас (уязвимо): SELECT * FROM users WHERE username = 'username' AND password = 'password'",
    choices: [
      {
        id: "a",
        text: "SELECT * FROM users WHERE username = ? AND password = ?  // [username, password]",
        correct: true,
        explain: "Параметризация: запрос отдельно, данные отдельно — безопасно.",
      },
      {
        id: "b",
        text: "SELECT * FROM users WHERE username = '${username}' AND password = '${password}'",
        correct: false,
        explain: "Шаблонная склейка — уязвимо: данные попадают в код SQL.",
      },
      {
        id: "c",
        text: "SELECT * FROM users WHERE username = ?  // [username]  (пароль позже)",
        correct: false,
        explain: "Нужно проверять и логин, и пароль одновременно — иначе логика нарушена.",
      },
      {
        id: "d",
        text: "SELECT * FROM users WHERE username = ?; -- пароль уже не важен",
        correct: false,
        explain: "Это пример злоупотребления комментариями и поломки проверки — так нельзя.",
      },
    ],
    timeLimitSec: 35,
  },
  {
    id: 2,
    title: "Поиск с LIKE",
    theory:
      "LIKE параметризуют целиком: col LIKE ?. Значение формируют отдельно: '%' + term + '%'. Если написать '%?%' — «?» останется символом «?». Иногда используют CONCAT('%', ?, '%'), но базовый и понятный шаблон — col LIKE ? + ['%'+term+'%'].",
    hint:
      "WHERE content LIKE ?  и передай ['%'+term+'%'] (не '%?%').",
    scenario:
      "Сейчас (уязвимо): SELECT * FROM posts WHERE content LIKE '%term%'",
    choices: [
      {
        id: "a",
        text: "SELECT * FROM posts WHERE content LIKE ?  // ['%'+term+'%']",
        correct: true,
        explain: "Плейсхолдер заменяет всё выражение справа от LIKE. Данные не смешиваются с кодом.",
      },
      {
        id: "b",
        text: "SELECT * FROM posts WHERE content LIKE '%?%'  // [term]",
        correct: false,
        explain: "Знак вопроса внутри строкового литерала — просто символ, а не параметр.",
      },
      {
        id: "c",
        text: "SELECT * FROM posts WHERE content LIKE '%' || term || '%'",
        correct: false,
        explain: "Конкатенация — риск инъекции. Параметризация надёжнее и проще.",
      },
      {
        id: "d",
        text: "SELECT * FROM posts WHERE content LIKE CONCAT('%', ?, '%')  // [term]",
        correct: false,
        explain: "Работает в ряде СУБД, но здесь фиксируем один базовый правильный паттерн для однозначности.",
      },
    ],
    timeLimitSec: 30,
  },
  {
    id: 3,
    title: "Профиль по id",
    theory:
      "Даже числа передают параметром: WHERE id = ?. Склейка вида '... WHERE id = ' + id уязвима (вместо числа могут прислать '1 OR 1=1').",
    hint: "WHERE id = ?  и [req.params.id].",
    scenario:
      "Сейчас (уязвимо): SELECT * FROM users WHERE id = req.params.id",
    choices: [
      {
        id: "a",
        text: "SELECT * FROM users WHERE id = ?  // [req.params.id]",
        correct: true,
        explain: "Плейсхолдер и отдельный параметр — безопасно и предсказуемо.",
      },
      {
        id: "b",
        text: "SELECT * FROM users WHERE id = ${req.params.id}",
        correct: false,
        explain: "Шаблонная склейка — уязвимо.",
      },
      {
        id: "c",
        text: "SELECT * FROM users WHERE id IN (?)  // [req.params.id]",
        correct: false,
        explain: "IN (?) чаще применяют для массивов; в базовой задаче фиксируем единый простой паттерн.",
      },
    ],
    timeLimitSec: 25,
  },
  {
    id: 4,
    title: "Регистрация (INSERT)",
    theory:
      "INSERT параметризуют так же: VALUES (?, ?). Любые поля формы — ТОЛЬКО параметры. Тогда никакая почта/имя не «закроет кавычку» и не вставит SQL.",
    hint: "VALUES (?, ?)  и [name, email].",
    scenario:
      "Сейчас (уязвимо): INSERT INTO users (name,email) VALUES ('name','email')",
    choices: [
      {
        id: "a",
        text: "INSERT INTO users (name, email) VALUES (?, ?)  // [name, email]",
        correct: true,
        explain: "Плейсхолдеры + массив значений — правильно и безопасно.",
      },
      {
        id: "b",
        text: "INSERT INTO users (name,email) VALUES ('${name}','${email}')",
        correct: false,
        explain: "Шаблонная склейка — уязвимо.",
      },
      {
        id: "c",
        text: "INSERT INTO users (name, email) SELECT ? , ?  // [name, email]",
        correct: false,
        explain: "Есть и такие практики, но в базовом курсе держим один эталонный ответ для однозначности.",
      },
    ],
    timeLimitSec: 30,
  },
  {
    id: 5,
    title: "ORDER BY (сортировка)",
    theory:
      "Плейсхолдеры — для ДАННЫХ, а имя колонки — ИДЕНТИФИКАТОР. '?' тут не поможет. Делают белый список: если поле есть в списке — используем, иначе безопасное значение по умолчанию (например, 'id'). В примере конкатенируем только проверенную переменную safe.",
    hint:
      "Белый список имён колонок (Set/Record), проверка has(sort), в запрос идёт только проверенное имя.",
    scenario:
      "Сейчас (уязвимо): SELECT id,name,email FROM users ORDER BY sort DESC",
    choices: [
      {
        id: "a",
        text:
          "const white = new Set(['id','name','email','created_at']); const safe = white.has(sort)?sort:'id'; const q = \"SELECT id,name,email FROM users ORDER BY \" + safe + \" DESC\";",
        correct: true,
        explain:
          "Whitelist: в ORDER BY попадает только проверенное имя колонки. Так безопасно.",
      },
      {
        id: "b",
        text: "SELECT id,name,email FROM users ORDER BY ? DESC  // [sort]",
        correct: false,
        explain:
          "Нельзя: '?' не подставит имя колонки — это идентификатор, а не данные.",
      },
      {
        id: "c",
        text: "SELECT id,name,email FROM users ORDER BY 'name' DESC",
        correct: false,
        explain:
          "Кавычки делают строковый литерал 'name', а не имя колонки.",
      },
      {
        id: "d",
        text:
          "const safe = (sort === 'name' || sort === 'email' || sort === 'id') ? sort : 'id'; const q = \"SELECT id,name,email FROM users ORDER BY \" + safe + \" DESC\";",
        correct: false,
        explain:
          "Рабочий подход, но в этом курсе придерживаемся одного эталонного варианта.",
      },
    ],
    timeLimitSec: 40,
  },
  {
    id: 6,
    title: "UPDATE (изменение почты)",
    theory:
      "UPDATE параметризуем: SET email = ? WHERE id = ?. Любая склейка из req.body/params в SQL — уязвимость. Для базового курса — классика: SET col = ? WHERE id = ?.",
    hint:
      "SET email = ? WHERE id = ?  и [email, id].",
    scenario:
      "Сейчас (уязвимо): UPDATE users SET email = 'email' WHERE id = id",
    choices: [
      {
        id: "a",
        text: "UPDATE users SET email = ? WHERE id = ?  // [email, id]",
        correct: true,
        explain: "Параметризация UPDATE — верно и безопасно.",
      },
      {
        id: "b",
        text: "UPDATE users SET email = '${email}' WHERE id = ${id}",
        correct: false,
        explain: "Шаблонная склейка — уязвимо.",
      },
      {
        id: "c",
        text: "UPDATE users SET email = COALESCE(?, email) WHERE id = ?  // [email, id]",
        correct: false,
        explain: "Тоже бывает корректно, но здесь оставляем один эталонный ответ.",
      },
      {
        id: "d",
        text: "UPDATE users SET email = ? WHERE id = (SELECT id FROM users WHERE id = ?)  // [email, id]",
        correct: false,
        explain: "Не нужно усложнять; оставим базовый, понятный паттерн.",
      },
    ],
  },
  {
    id: 7,
    title: "Удаление (DELETE) с WHERE",
    theory:
      "DELETE всегда с корректным WHERE и параметризацией. Склейка WHERE id = '...'+id опасна. Пишем WHERE id = ? и передаём id параметром.",
    hint:
      "DELETE FROM users WHERE id = ?  // [id].",
    scenario:
      "Сейчас (уязвимо): DELETE FROM users WHERE id = idParam",
    choices: [
      {
        id: "a",
        text: "DELETE FROM users WHERE id = ?  // [id]",
        correct: true,
        explain: "Плейсхолдер и значение отдельно — правильно.",
      },
      {
        id: "b",
        text: "DELETE FROM users WHERE id = ${id}",
        correct: false,
        explain: "Шаблонная склейка — уязвимо.",
      },
      {
        id: "c",
        text: "DELETE FROM users WHERE id IN (?) // [id]",
        correct: false,
        explain: "IN (?) часто для массивов, а у нас базовый случай с одним id.",
      },
      {
        id: "d",
        text: "DELETE FROM users; -- быстрее же",
        correct: false,
        explain: "Так удалятся все пользователи. Никогда так.",
      },
    ],
    timeLimitSec: 25,
  },
  {
    id: 8,
    title: "Пагинация (LIMIT/OFFSET)",
    theory:
      "LIMIT и OFFSET — числа. Во многих драйверах их нельзя подставлять плейсхолдерами. Значит, валидируй/приводи к числу на сервере и вставляй ТОЛЬКО проверенное число (min/max). Имя колонки в ORDER BY — только из whitelist.",
    hint:
      "Приведи limit/offset к числу и зажми диапазон, потом вставь как число.",
    scenario:
      "Сейчас (ломается/уязвимо): SELECT id,name FROM users ORDER BY name LIMIT 'ten' OFFSET 'zero'",
    choices: [
      {
        id: "a",
        text:
          "const limit = Number.isFinite(+req.query.limit) ? Math.min(Math.max(+req.query.limit,1),100) : 20; const offset = Number.isFinite(+req.query.offset) ? Math.max(+req.query.offset,0) : 0; const q = \"SELECT id,name FROM users ORDER BY name LIMIT \" + limit + \" OFFSET \" + offset + \"\";",
        correct: true,
        explain:
          "Привели к числу, ограничили диапазон, вставили проверенное число — верно.",
      },
      {
        id: "b",
        text: "SELECT id,name FROM users ORDER BY name LIMIT ? OFFSET ?  // [limit, offset]",
        correct: false,
        explain:
          "Во многих драйверах LIMIT/OFFSET не параметризуются — нужны именно числа.",
      },
      {
        id: "c",
        text: "SELECT id,name FROM users ORDER BY name LIMIT '${limit}' OFFSET '${offset}'",
        correct: false,
        explain:
          "Сырые строки — риск и поломка.",
      },
      {
        id: "d",
        text: "const q = \"SELECT id,name FROM users ORDER BY \" + req.query.sort + \" LIMIT 10\";",
        correct: false,
        explain:
          "sort без whitelist — отдельная уязвимость. Нельзя.",
      },
      {
        id: "e",
        text: "const limit = parseInt(req.query.limit as string,10) || 20; const offset = parseInt(req.query.offset as string,10) || 0; const q = \"SELECT id,name FROM users ORDER BY name LIMIT \" + limit + \" OFFSET \" + offset;",
        correct: false,
        explain:
          "Начало неплохое, но без ограничений min/max можно уронить БД огромными значениями.",
      },
    ],
    timeLimitSec: 35,
  },
];

// ───────────────────────────────────────────────────────────────
// Визуальные эффекты: параллакс, стекло-карточки, галочка/крестик, тост
// ───────────────────────────────────────────────────────────────
function ParallaxHeader({ children }: { children: React.ReactNode }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-20, 20], [8, -8]), {
    stiffness: 140,
    damping: 14,
  });
  const ry = useSpring(useTransform(mx, [-20, 20], [-8, 8]), {
    stiffness: 140,
    damping: 14,
  });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      mx.set((e.clientX / w) * 40 - 20);
      my.set((e.clientY / h) * 40 - 20);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry }} className="will-change-transform">
      {children}
    </motion.div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl bg-card/90 ring-1 ring-border backdrop-blur-xl shadow-2xl " +
        className
      }
      style={{
        backgroundImage:
          "radial-gradient(800px 300px at 0% -10%, rgba(59,130,246,0.06), transparent), radial-gradient(600px 260px at 100% 120%, rgba(16,185,129,0.06), transparent)",
      }}
    >
      {children}
    </div>
  );
}

/** Красивая галочка (градиент, свечение, плавная отрисовка) */
function SuccessMark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="relative rounded-full p-8 bg-emerald-600/10 backdrop-blur-md ring-1 ring-emerald-400/40"
          >
            <div
              className="absolute inset-0 blur-3xl rounded-full"
              style={{
                background:
                  "radial-gradient(120px 120px at 50% 50%, rgba(16,185,129,0.35), transparent)",
              }}
            />
            <svg width="160" height="160" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="g_ok" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="url(#g_ok)"
                strokeWidth="10"
                initial={{ pathLength: 0, filter: "drop-shadow(0 0 0px rgba(34,197,94,0))" }}
                animate={{ pathLength: 1, filter: "drop-shadow(0 0 12px rgba(34,197,94,0.55))" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <motion.path
                d="M38 60 L55 76 L84 44"
                fill="none"
                stroke="url(#g_ok)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Красивая «ошибка» крестиком (градиент, свечение, поштриховая отрисовка) */
function FailureMark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="relative rounded-full p-8 bg-rose-600/10 backdrop-blur-md ring-1 ring-rose-400/40"
          >
            <div
              className="absolute inset-0 blur-3xl rounded-full"
              style={{
                background:
                  "radial-gradient(120px 120px at 50% 50%, rgba(244,63,94,0.35), transparent)",
              }}
            />
            <svg width="160" height="160" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="g_bad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="url(#g_bad)"
                strokeWidth="10"
                initial={{ pathLength: 0, filter: "drop-shadow(0 0 0px rgba(239,68,68,0))" }}
                animate={{ pathLength: 1, filter: "drop-shadow(0 0 12px rgba(239,68,68,0.55))" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <motion.path
                d="M44 44 L76 76"
                fill="none"
                stroke="url(#g_bad)"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.35, ease: "easeOut" }}
              />
              <motion.path
                d="M76 44 L44 76"
                fill="none"
                stroke="url(#g_bad)"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.55, duration: 0.35, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toast({ open, text }: { open: boolean; text: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]"
          initial={{ y: 20, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 160, damping: 15 }}
        >
          <div className="flex items-center gap-2 rounded-full bg-card text-foreground px-4 py-2 shadow-xl ring-1 ring-border backdrop-blur">
            <TerminalSquare className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">{text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ───────────────────────────────────────────────────────────────
// Главный компонент
// ───────────────────────────────────────────────────────────────
export function CodeEditor() {
  // прогресс/сохранение
  const saved = LS.get(LS.KEY, {
    stars: 0,
    bestCombo: 0,
    completed: {} as Record<number, boolean>,
  });
  const [stars, setStars] = useState<number>(saved.stars || 0);
  const [bestCombo, setBestCombo] = useState<number>(saved.bestCombo || 0);
  const [completed, setCompleted] = useState<Record<number, boolean>>(
    saved.completed || {}
  );

  // текущая логика
  const [idx, setIdx] = useState(0);
  const task = TASKS[idx];

  // одиночный выбор
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [result, setResult] = useState<"pending" | "correct" | "wrong">(
    "pending"
  );
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // анимация успех/ошибка
  const [showOK, setShowOK] = useState(false);
  const [showBad, setShowBad] = useState(false);

  // таймер
  const [timeLeft, setTimeLeft] = useState<number>(task.timeLimitSec || 0);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!task.timeLimitSec) return;
    setTimeLeft(task.timeLimitSec);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [idx, task.timeLimitSec]);

  // сохранение прогресса
  useEffect(() => {
    LS.set(LS.KEY, { stars, bestCombo, completed });
  }, [stars, bestCombo, completed]);

  const total = TASKS.length;
  const doneCount = useMemo(
    () => TASKS.filter((t) => completed[t.id]).length,
    [completed]
  );
  const percent = Math.round((doneCount / total) * 100);

  const resetTask = () => {
    setSelectedId(null);
    setResult("pending");
    setShowOK(false);
    setShowBad(false);
    setToast(null);
    setTimeLeft(task.timeLimitSec || 0);
  };

  const check = useCallback(() => {
    if (task.timeLimitSec && timeLeft === 0) {
      setResult("wrong");
      setShowBad(true);
      setTimeout(() => setShowBad(false), 1200);
      setCombo(0);
      setToast("⏱️ Время вышло!");
      return;
    }
    const correct = task.choices.find((c) => c.correct);
    const ok = !!correct && selectedId === correct!.id;

    if (ok) {
      setResult("correct");
      setShowOK(true);
      setTimeout(() => setShowOK(false), 1300);
      setToast("Отлично! Переходи к следующему.");
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setStars((s) => s + (nextCombo >= 3 ? 2 : 1)); // комбо ≥3 — +2
      setCompleted((m) => ({ ...m, [task.id]: true }));
    } else {
      setResult("wrong");
      setShowBad(true);
      setTimeout(() => setShowBad(false), 1200);
      setCombo(0);
      setToast("Неверно. Посмотри объяснение ниже.");
    }
  }, [task, selectedId, timeLeft, combo]);

  const goPrev = () => {
    if (idx > 0) {
      setIdx(idx - 1);
      setTimeout(resetTask, 0);
    }
  };
  const goNext = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setTimeout(resetTask, 0);
    }
  };

  // горячие клавиши: Enter — ответить, R — сброс
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "enter") {
        e.preventDefault();
        check();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetTask();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [check]);

  // ───────────────────────────────────────────────────────────
  return (
    <div
      className="relative rounded-2xl border border-border p-6 overflow-hidden shadow-2xl text-foreground
                 bg-gradient-to-br from-[rgb(247,249,255)] to-[rgb(244,244,248)]
                 dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900"
    >
      <Toast open={!!toast} text={toast || ""} />
      <SuccessMark show={showOK} />
      <FailureMark show={showBad} />

      {/* Шапка */}
      <ParallaxHeader>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Учебная песочница
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                SQL Quest <Zap className="h-5 w-5 text-sky-500" />
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GlassCard className="px-3 py-2">
              <div className="text-xs text-muted-foreground">Прогресс</div>
              <div className="flex items-center gap-3">
                <div className="w-40">
                  <Progress value={percent} className="h-2" />
                </div>
                <div className="font-semibold">{percent}%</div>
              </div>
            </GlassCard>
            <GlassCard className="px-3 py-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <div className="text-sm font-semibold">{stars}</div>
            </GlassCard>
            <GlassCard className="px-3 py-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <div className="text-sm">Комбо: {combo}</div>
            </GlassCard>
          </div>
        </div>
      </ParallaxHeader>

      {/* Контент */}
      <div className="relative z-10 mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Левая колонка — активное задание */}
        <motion.div
          key={task.id}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl bg-card ring-1 ring-border p-5"
          style={{
            backgroundImage:
              "radial-gradient(700px 220px at 0% -10%, rgba(59,130,246,0.06), transparent), radial-gradient(600px 220px at 110% 120%, rgba(16,185,129,0.06), transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/60 ring-1 ring-border">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {task.id}. {task.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  Выбери ОДИН правильный вариант. Теория ниже — «почему так».
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-1 rounded-full text-xs ring-1 ${
                  completed[task.id]
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-400/30"
                    : "bg-muted/60 text-muted-foreground ring-border"
                }`}
              >
                {completed[task.id] ? "Пройдено" : "Не пройдено"}
              </div>
              {task.timeLimitSec ? (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ring-1 ${
                    timeLeft > 0
                      ? "bg-sky-400/10 text-sky-600 dark:text-sky-300 ring-sky-400/30"
                      : "bg-rose-400/10 text-rose-600 dark:text-rose-300 ring-rose-400/30"
                  }`}
                >
                  <TimerReset className="h-3.5 w-3.5" />
                  {timeLeft > 0 ? `${timeLeft}s` : "Время!"}
                </div>
              ) : null}
            </div>
          </div>

          {/* Теория */}
          <GlassCard className="mt-4 p-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" /> Теория: это и есть «почему так»
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{task.theory}</p>
          </GlassCard>

          {/* Сценарий */}
          <GlassCard className="mt-4 p-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-500" /> Что сейчас не так
            </div>
            <pre className="text-sm text-foreground whitespace-pre-wrap">{task.scenario}</pre>
          </GlassCard>

          {/* Варианты — ОДИНОЧНЫЙ ВЫБОР */}
          <div className="mt-4">
            <RadioGroup
              value={selectedId ?? ""}
              onValueChange={(v) => {
                if (result === "pending") setSelectedId(v);
              }}
              className="space-y-2"
            >
              {task.choices.map((c) => {
                const checked = selectedId === c.id;
                const isCorrect = c.correct && result !== "pending";
                const isWrong = checked && !c.correct && result !== "pending";
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      checked
                        ? "border-sky-400/50 bg-sky-400/10"
                        : "border-border hover:bg-muted/40"
                    } ${isCorrect ? "border-emerald-400/50 bg-emerald-500/10" : ""} ${
                      isWrong ? "border-rose-400/50 bg-rose-500/10" : ""
                    }`}
                  >
                    <RadioGroupItem
                      id={`t${task.id}-${c.id}`}
                      value={c.id}
                      checked={checked}
                      disabled={result !== "pending"}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`t${task.id}-${c.id}`}
                      className="flex-1 cursor-pointer font-mono text-sm"
                    >
                      {c.text}
                    </Label>
                    {result !== "pending" && checked && (
                      <div>
                        {c.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Объяснение: корректно разделяем случаи */}
          <AnimatePresence>
            {result !== "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 space-y-2"
              >
                {(() => {
                  const correct = task.choices.find((c) => c.correct)!;
                  const picked = task.choices.find((c) => c.id === selectedId);
                  if (result === "correct") {
                    return (
                      <div className="p-3 rounded-lg text-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-400/30">
                        <span className="font-semibold">✓ Почему верно: </span>
                        {correct.explain}
                      </div>
                    );
                  }
                  // result === "wrong"
                  return (
                    <>
                      <div className="p-3 rounded-lg text-sm bg-rose-500/10 text-rose-700 dark:text-rose-200 ring-1 ring-rose-400/30">
                        <span className="font-semibold">✗ Почему неверно: </span>
                        {picked ? picked.explain : "Ответ не выбран."}
                      </div>
                      <div className="p-3 rounded-lg text-sm bg-muted text-foreground ring-1 ring-border">
                        <span className="font-semibold">Как правильно: </span>
                        {correct.explain}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопки */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={check}
              className="bg-sky-600 hover:bg-sky-700 text-white dark:text-white"
              disabled={!selectedId}
            >
              Ответить (Enter)
            </Button>
            <Button
              onClick={() => setToast(task.hint)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <HelpCircle className="h-4 w-4 mr-2" /> Подсказка
            </Button>
            <Button
              onClick={resetTask}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              title="R"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Сброс (R)
            </Button>
          </div>
        </motion.div>

        {/* Правая колонка — список, шпаргалка, итоги */}
        <div className="space-y-4">
          {/* Список заданий */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Задания
              </div>
              <div className="text-sm text-muted-foreground">
                Пройдено: {doneCount}/{total}
              </div>
            </div>

            <div className="grid gap-2">
              {TASKS.map((t, i) => {
                const active = t.id === task.id;
                const done = !!completed[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setIdx(i);
                      setTimeout(resetTask, 0);
                    }}
                    className={`w-full text-left rounded-xl p-3 ring-1 transition-colors ${
                      active
                        ? "bg-muted ring-sky-400/40"
                        : "bg-card ring-border hover:bg-muted"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted ring-1 ring-border">
                          {t.title.toLowerCase().includes("delete") ? (
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          ) : t.title.toLowerCase().includes("пагинация") ? (
                            <ListOrdered className="h-4 w-4 text-indigo-500" />
                          ) : done ? (
                            <Award className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {i + 1}. {t.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {done ? "Пройдено" : "Не пройдено"}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Навигация */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={goPrev}
                variant="outline"
                disabled={idx === 0}
                className="border-border text-foreground hover:bg-muted flex-1 disabled:opacity-50"
              >
                ← Назад
              </Button>
              <Button
                onClick={goNext}
                variant="outline"
                disabled={idx === total - 1}
                className="border-border text-foreground hover:bg-muted flex-1 disabled:opacity-50"
              >
                Далее →
              </Button>
            </div>
          </GlassCard>

          {/* Шпаргалка */}
          <GlassCard className="p-4">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" /> Шпаргалка: главные правила
            </div>
            <ul className="text-sm text-foreground/90 list-disc pl-5 space-y-1">
              <li>Всегда разделяй <b>SQL</b> и <b>данные</b>: плейсхолдеры (?), параметры отдельно.</li>
              <li><b>LIKE</b>: «col LIKE ?» и значение вида '%' + term + '%'. Не «'%?%'».</li>
              <li><b>ORDER BY</b>: только whitelist имён колонок; плейсхолдеры не работают для идентификаторов.</li>
              <li><b>INSERT/UPDATE/DELETE</b>: значения — только параметрами (VALUES/SET/WHERE).</li>
              <li><b>LIMIT/OFFSET</b>: это числа — валидируй/приводи к числу и ограничивай min/max.</li>
              <li>Проверка входных данных, наименьшие привилегии в БД, логирование — базовая гигиена.</li>
            </ul>
          </GlassCard>

          {/* Итоговая карточка */}
          <GlassCard className="p-3 flex items-center justify-between">
            <div className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Режим тренировки • SQL Basics
            </div>
            <div className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Лучшее комбо: {bestCombo}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
