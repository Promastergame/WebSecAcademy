// src/components/sql/CodeBattle.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles, Zap, Shield, Lightbulb, BookOpen, CheckCircle2,
  Trophy, ListChecks, Hand, ChevronRight, ChevronLeft, Info, Type, Flame
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
   ✅ Успешная галочка (оставляем), конфетти — нет
──────────────────────────────────────────────────────────────────────────── */
function SuccessMark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="relative rounded-full p-8 bg-emerald-600/10 backdrop-blur-md ring-1 ring-emerald-400/40"
          >
            <div
              className="absolute inset-0 blur-3xl rounded-full"
              style={{
                background:
                  'radial-gradient(120px 120px at 50% 50%, rgba(16,185,129,0.35), transparent)',
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
                cx="60" cy="60" r="46" fill="none" stroke="url(#g_ok)" strokeWidth="10"
                initial={{ pathLength: 0, filter: 'drop-shadow(0 0 0px rgba(34,197,94,0))' }}
                animate={{ pathLength: 1, filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.55))' }}
                transition={{ duration: 0.6, ease: 'easeOut' }} strokeLinecap="round"
              />
              <motion.path d="M38 60 L55 76 L84 44" fill="none" stroke="url(#g_ok)" strokeWidth="10"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   🎮 Механика AutoFix + данные уровней
──────────────────────────────────────────────────────────────────────────── */
type Step = { id: string; label: string; explain: string; apply: (src: string) => string };

type Level = {
  id: number;
  title: string;
  vulnerable: string;
  final: string;
  hint: string;   // для совместимости
  theory: string; // теория именно этого уровня
  steps: Step[];
};

const LEVELS: Level[] = [
  {
    id: 1,
    title: 'ID в URL',
    vulnerable: `app.get('/user/:id', (req, res) => {
  const q = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(q, (e, r) => res.json(r));
});`,
    final: `app.get('/user/:id', (req, res) => {
  const q = "SELECT * FROM users WHERE id = ?";
  db.query(q, [req.params.id], (e, r) => res.json(r));
});`,
    hint: 'remove',
    theory:
      'Числовые параметры так же опасны, как и строки: можно подставить "1 OR 1=1". Параметризация (плейсхолдер ?) ' +
      'жёстко разделяет код SQL и данные, драйвер передаёт значения отдельно.',
    steps: [
      {
        id: 'a',
        label: 'WHERE id = ?',
        explain: 'Меняем конкатенацию на плейсхолдер — ввод больше не попадает в текст SQL.',
        apply: s => s.replace(/WHERE\s+id\s*=\s*[^;\n]+/i, 'WHERE id = ?'),
      },
      {
        id: 'b',
        label: 'Убрать + req.params.id',
        explain: 'Убираем строковую склейку. Значение должно идти отдельным параметром.',
        apply: s => s.replace(/\s*\+\s*req\.params\.id\s*;?/i, ';'),
      },
      {
        id: 'c',
        label: 'Добавить параметры [id]',
        explain: 'Передаём id во втором аргументе: драйвер безопасно биндует значение.',
        apply: s => s.replace(/db\.query\(q,\s*\(e,\s*r\)/i, 'db.query(q, [req.params.id], (e, r)'),
      },
    ],
  },
  {
    id: 2,
    title: 'LIKE поиск',
    vulnerable: `app.get('/search', (req, res) => {
  const term = req.query.q;
  const sql = "SELECT * FROM posts WHERE content LIKE '%" + term + "%'";
  db.query(sql, (e, r) => res.json(r));
});`,
    final: `app.get('/search', (req, res) => {
  const term = req.query.q;
  const sql = "SELECT * FROM posts WHERE content LIKE ?";
  db.query(sql, ['%' + term + '%'], (e, r) => res.json(r));
});`,
    hint: 'remove',
    theory:
      'Внутри кавычек символ «?» — не параметр. Правильно: "col LIKE ?" и отдельный массив значений ["%"+term+"%"].',
    steps: [
      {
        id: 'a',
        label: 'LIKE ?',
        explain: 'Плейсхолдер вместо строкового литерала гарантирует, что шаблон — это данные.',
        apply: s => s.replace(/LIKE\s+(['"`])?%?\s*"\s*\+\s*term\s*\+\s*"\s*%?\1?/i, 'LIKE ?'),
      },
      {
        id: 'b',
        label: "Параметр ['%'+term+'%']",
        explain: 'Собираем шаблон на приложении и передаём его как параметр.',
        apply: s => s.replace(/db\.query\(sql,\s*\(e,\s*r\)/i, "db.query(sql, ['%' + term + '%'], (e, r)"),
      },
    ],
  },
  {
    id: 3,
    title: 'Логин (2 параметра)',
    vulnerable: `app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const q = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  db.query(q, (e, rows) => { res.send(rows.length ? 'OK' : 'Bad'); });
});`,
    final: `app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const q = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(q, [username, password], (e, rows) => { res.send(rows.length ? 'OK' : 'Bad'); });
});`,
    hint: 'remove',
    theory:
      'При конкатенации логина/пароля аутентификацию можно обойти. Нужны два плейсхолдера и массив параметров.',
    steps: [
      {
        id: 'a',
        label: 'username = ? AND password = ?',
        explain: 'Оба значения биндим, чтобы ни одно не осталось в строковом SQL.',
        apply: s => s.replace(/username\s*=\s*['"].+?['"]\s+AND\s+password\s*=\s*['"].+?['"]/i, 'username = ? AND password = ?'),
      },
      {
        id: 'b',
        label: 'Параметры [username, password]',
        explain: 'Передаём оба значения во втором аргументе в правильном порядке.',
        apply: s => s.replace(/db\.query\(q,\s*\(e,\s*rows\)/i, 'db.query(q, [username, password], (e, rows)'),
      },
    ],
  },
  {
    id: 4,
    title: 'INSERT (регистрация)',
    vulnerable: `const sql = "INSERT INTO users(name,email) VALUES('" + name + "','" + email + "')";
db.query(sql, (e,r)=>res.json(r))`,
    final: `const sql = "INSERT INTO users(name,email) VALUES(?, ?)";
db.query(sql, [name, email], (e,r)=>res.json(r))`,
    hint: 'remove',
    theory:
      'Для INSERT значения тоже идут только параметрами: VALUES(?, ?). Так ни одна кавычка не «закроет» строку.',
    steps: [
      {
        id: 'a',
        label: 'VALUES (?, ?)',
        explain: 'Делаем SQL-шаблон с плейсхолдерами вместо пользовательских значений.',
        apply: s => s.replace(/VALUES\([^\)]*\)/i, 'VALUES(?, ?)'),
      },
      {
        id: 'b',
        label: 'Параметры [name, email]',
        explain: 'Передаём реальные значения массивом — драйвер вставит их безопасно.',
        apply: s => s.replace(/db\.query\(sql,\s*\(e,\s*r\)/i, 'db.query(sql, [name, email], (e,r)'),
      },
    ],
  },
  {
    id: 5,
    title: 'UPDATE email',
    vulnerable: `const q = "UPDATE users SET email='" + email + "' WHERE id=" + id;
db.query(q, (e,r)=>res.json(r))`,
    final: `const q = "UPDATE users SET email = ? WHERE id = ?";
db.query(q, [email, id], (e,r)=>res.json(r))`,
    hint: 'remove',
    theory:
      'UPDATE строим как и SELECT/INSERT: плейсхолдеры для поля и условия, значения передаём отдельно.',
    steps: [
      {
        id: 'a',
        label: 'SET email = ? WHERE id = ?',
        explain: 'Параметризуем и новое значение, и идентификатор — без дыр.',
        apply: s => s.replace(/SET\s+email\s*=\s*['"].+?['"]\s+WHERE\s+id\s*=\s*[^;\n]+/i, 'SET email = ? WHERE id = ?'),
      },
      {
        id: 'b',
        label: 'Параметры [email, id]',
        explain: 'Сохраняем правильный порядок параметров для биндинга.',
        apply: s => s.replace(/db\.query\(q,\s*\(e,\s*r\)/i, 'db.query(q, [email, id], (e,r)'),
      },
    ],
  },
  {
    id: 6,
    title: 'DELETE по id',
    vulnerable: `const q = "DELETE FROM users WHERE id = " + id;
db.query(q, (e,r)=>res.json(r))`,
    final: `const q = "DELETE FROM users WHERE id = ?";
db.query(q, [id], (e,r)=>res.json(r))`,
    hint: 'remove',
    theory:
      'DELETE всегда должен быть с параметризованным WHERE. Иначе можно снести не те записи.',
    steps: [
      {
        id: 'a',
        label: 'WHERE id = ?',
        explain: 'Условие становится безопасным: id — это данные, а не код.',
        apply: s => s.replace(/WHERE\s+id\s*=\s*[^;\n]+/i, 'WHERE id = ?'),
      },
      {
        id: 'b',
        label: 'Параметр [id]',
        explain: 'Подставляем значение только через массив параметров.',
        apply: s => s.replace(/db\.query\(q,\s*\(e,\s*r\)/i, 'db.query(q, [id], (e,r)'),
      },
    ],
  },
  {
    id: 7,
    title: 'ORDER BY (whitelist)',
    vulnerable: `const q = "SELECT id,name,email FROM users ORDER BY " + sort + " DESC";`,
    final: `const white = new Set(['id','name','email','created_at']);
const safe = white.has(sort) ? sort : 'id';
const q = "SELECT id,name,email FROM users ORDER BY " + safe + " DESC";`,
    hint: 'remove',
    theory:
      'Имена колонок — это идентификаторы, для них плейсхолдеры не работают. Нужен белый список допустимых полей.',
    steps: [
      {
        id: 'a',
        label: 'Белый список',
        explain: 'Ограничиваем набор колонок фиксированным списком.',
        apply: s => `const white = new Set(['id','name','email','created_at']);\n` + s,
      },
      {
        id: 'b',
        label: 'Проверка sort → safe',
        explain: 'Используем только значение из списка — остальное заменяем на безопасное по умолчанию.',
        apply: s => s.replace(/ORDER BY\s*"\s*\+\s*sort\s*\+\s*"\s*DESC";?/, 'ORDER BY " + (white.has(sort)?sort:"id") + " DESC";'),
      },
      {
        id: 'c',
        label: 'Вынести safe',
        explain: 'Делаем код чище и понятнее: отдельная переменная для итогового поля сортировки.',
        apply: _ => `const white = new Set(['id','name','email','created_at']);
const safe = white.has(sort) ? sort : 'id';
const q = "SELECT id,name,email FROM users ORDER BY " + safe + " DESC";`,
      },
    ],
  },
  {
    id: 8,
    title: 'LIMIT/OFFSET (числа)',
    vulnerable: `const q = "SELECT id,name FROM users ORDER BY name LIMIT '" + req.query.limit + "' OFFSET '" + req.query.offset + "'";`,
    final: `const limit = Number.isFinite(+req.query.limit) ? Math.min(Math.max(+req.query.limit,1),100) : 20;
const offset = Number.isFinite(+req.query.offset) ? Math.max(+req.query.offset,0) : 0;
const q = "SELECT id,name FROM users ORDER BY name LIMIT " + limit + " OFFSET " + offset;`,
    hint: 'remove',
    theory:
      'LIMIT и OFFSET часто нельзя параметризовать. Поэтому приводим к числу и ограничиваем диапазон перед вставкой.',
    steps: [
      {
        id: 'a',
        label: 'Привести к числам',
        explain: 'Отбрасываем строки/NaN и задаём безопасные границы (min/max).',
        apply: _ => `const limit = Number.isFinite(+req.query.limit) ? Math.min(Math.max(+req.query.limit,1),100) : 20;
const offset = Number.isFinite(+req.query.offset) ? Math.max(+req.query.offset,0) : 0;`,
      },
      {
        id: 'b',
        label: 'Вставить числа',
        explain: 'В запрос попадают только проверенные числа — без кавычек и конкатенации с вводом.',
        apply: _ => `const limit = Number.isFinite(+req.query.limit) ? Math.min(Math.max(+req.query.limit,1),100) : 20;
const offset = Number.isFinite(+req.query.offset) ? Math.max(+req.query.offset,0) : 0;
const q = "SELECT id,name FROM users ORDER BY name LIMIT " + limit + " OFFSET " + offset;`,
      },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   🛡️ Случайные советы «Как защититься»
──────────────────────────────────────────────────────────────────────────── */
const SECURITY_TIPS = [
  'Всегда используйте параметризованные запросы (prepared statements).',
  'Ограничивайте права БД: отдельная учётка с минимумом привилегий.',
  'Логируйте аномалии: UNION, --, /* */, WAITFOR, SLEEP и т.п.',
  'Проверяйте типы и диапазоны входных данных на сервере.',
  'Показывайте нейтральные ошибки пользователю; детали — только в логах.',
  'Обновляйте драйверы БД и зависимости.',
  'Используйте ORM-методы с параметрами вместо сырого SQL.',
  'Добавьте rate-limit на чувствительные операции (логин, поиск).',
];
function useRandomTip(seedKey: string) {
  const index = useMemo(() => {
    const s = seedKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return s % SECURITY_TIPS.length;
  }, [seedKey]);
  return SECURITY_TIPS[index];
}

/* ────────────────────────────────────────────────────────────────────────────
   🔧 UI-утилиты
──────────────────────────────────────────────────────────────────────────── */
function FixToggle({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border select-none transition-all
        ${done ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-rose-500/10 border-rose-400/30'}`}
      title={done ? 'Сбросить уровень' : 'Ещё не исправлено'}
    >
      <div className={`h-5 w-5 rounded-full grid place-items-center ${done ? 'bg-emerald-500/20 ring-1 ring-emerald-400/40' : 'bg-rose-500/20 ring-1 ring-rose-400/40'}`}>
        <CheckCircle2 className={`h-3.5 w-3.5 ${done ? 'text-emerald-500' : 'text-rose-500'}`} />
      </div>
      <span className="text-sm font-medium">{done ? 'Готово' : 'В процессе'}</span>
    </button>
  );
}

function DiffLine({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ backgroundColor: 'rgba(59,130,246,0.14)' }}
      animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: 1.15 }}
    >
      {children}
    </motion.div>
  );
}

function TinyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 bg-white/60 ring-black/10 text-slate-700
                     dark:bg-white/10 dark:ring-white/10 dark:text-slate-200">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   🎨 Анимационные пресеты для смены уровней
──────────────────────────────────────────────────────────────────────────── */
const levelVariants = {
  initial: { opacity: 0, y: 10, scale: 0.985, filter: 'blur(2px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, scale: 0.985, filter: 'blur(2px)' },
};
const levelTransition = { duration: 0.28, ease: 'easeOut' };

/* ────────────────────────────────────────────────────────────────────────────
   🎮 Основной компонент
──────────────────────────────────────────────────────────────────────────── */
export function CodeBattle() {
  const [idx, setIdx] = useState(0);
  const level = LEVELS[idx];

  const [code, setCode] = useState(level.vulnerable);
  const [stepIndex, setStepIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem('cb_autofix_best') || 0));

  const [showOk, setShowOk] = useState(false);
  const tip = useRandomTip(String(idx));

  useEffect(() => {
    setCode(level.vulnerable);
    setStepIndex(0);
    setCombo(0);
    // плавно подскроллим к началу блока, чтобы смена уровня ощущалась естественно
    try {
      document.querySelector('#codebattle-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }, [idx]);

  const totalSteps = level.steps.length;
  const done = stepIndex >= totalSteps;

  function applyNext() {
    if (stepIndex >= totalSteps) return;
    const step = level.steps[stepIndex];
    const next = step.apply(code);
    setCode(next);

    const nextCombo = combo + 1;
    const gained = 100 + nextCombo * 10;
    setCombo(nextCombo);
    setScore((s) => s + gained);

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);

    if (nextIndex === totalSteps) {
      setCode(level.final);
      setShowOk(true);
      setTimeout(() => setShowOk(false), 1400);

      const totalGain = 250 + nextCombo * 15;
      setScore((s) => {
        const ns = s + totalGain;
        const nb = Math.max(best, ns);
        setBest(nb);
        localStorage.setItem('cb_autofix_best', String(nb));
        return ns;
      });
    }
  }

  function resetLevel() {
    setCode(level.vulnerable);
    setStepIndex(0);
    setCombo(0);
  }

  // Клавиатура: Enter — шаг, ←/→ — уровни, R — сброс
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'enter') { e.preventDefault(); applyNext(); }
      if (k === 'r') { e.preventDefault(); resetLevel(); }
      if (k === 'arrowleft') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
      if (k === 'arrowright') { e.preventDefault(); setIdx(i => Math.min(LEVELS.length - 1, i + 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyNext]);

  const progressPct = Math.round(((idx + 1) / LEVELS.length) * 100);

  const passedSteps = level.steps.slice(0, stepIndex);
  const currentStep = !done ? level.steps[stepIndex] : null;

  return (
    <div
      id="codebattle-root"
      className="
        relative overflow-hidden
        rounded-2xl border border-black/[0.06] shadow-2xl
        bg-gradient-to-br from-[rgb(248,250,255)] via-[rgb(245,247,252)] to-[rgb(240,242,250)]
        p-6
        dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900
      "
      style={{
        backgroundImage:
          'radial-gradient(900px 320px at 0% -10%, rgba(59,130,246,0.08), transparent), radial-gradient(700px 280px at 110% 120%, rgba(16,185,129,0.08), transparent)',
      }}
    >
      <SuccessMark show={showOk} />

      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">Игровая мастерская</div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              CodeBattle — AutoFix <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </h2>
          </div>
        </div>

        {/* Счётчики */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-white/80 ring-1 ring-black/10 flex items-center gap-2 shadow-sm
                          dark:bg-white/10 dark:ring-white/10">
            <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <div className="text-sm text-slate-800 dark:text-slate-200">
              Счёт: <b>{score}</b>
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/80 ring-1 ring-black/10 flex items-center gap-2 shadow-sm
                          dark:bg-white/10 dark:ring-white/10">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <div className="text-sm text-slate-800 dark:text-slate-200">Комбо: {combo}</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/80 ring-1 ring-black/10 text-sm shadow-sm
                          dark:bg-white/10 dark:ring-white/10 text-slate-800 dark:text-slate-200">
            🏅 Рекорд: {best}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-6">
        {/* Левая колонка — теперь через AnimatePresence с плавной сменой уровня */}
        <AnimatePresence mode="wait">
          <motion.div
            key={level.id}
            variants={levelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={levelTransition}
          >
            <Card className="bg-white/70 ring-1 ring-black/10 dark:bg.white/5 dark:bg-white/5 dark:ring-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {level.id}. {level.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Проходи шаги — код перепишется сам.</div>
                    </div>
                  </div>
                  <FixToggle done={done} onClick={resetLevel} />
                </div>

                {/* Кодовое окно: светлая/тёмная тема */}
                <motion.div
                  key={code}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="
                    rounded-xl font-mono text-sm p-3 ring-1 shadow-inner
                    bg-slate-50 text-slate-900 ring-black/10
                    dark:bg-[#0B0F17] dark:text-slate-100 dark:ring-white/10
                  "
                >
                  <pre className="whitespace-pre-wrap leading-5">
                    {code.split('\n').map((line, i) => (
                      <DiffLine key={i}>
                        <code>{line}</code>
                        {'\n'}
                      </DiffLine>
                    ))}
                  </pre>
                </motion.div>

                {/* Шаги */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4" /> Шаги фикса:
                    <TinyBadge>{stepIndex}/{totalSteps}</TinyBadge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {level.steps.map((s, i) => {
                      const passed = i < stepIndex;
                      const current = i === stepIndex;
                      return (
                        <Button
                          key={s.id}
                          size="sm"
                          variant={passed ? 'default' : 'outline'}
                          className={
                            passed
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : current
                              ? 'border-sky-400/50 text-sky-700 dark:text-sky-300'
                              : ''
                          }
                          onClick={() => {
                            if (current) applyNext();
                          }}
                          disabled={i > stepIndex}
                          title={current ? 'Нажми, чтобы применить шаг' : passed ? 'Готово' : 'Выполни предыдущие шаги'}
                        >
                          {passed ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Hand className="h-4 w-4 mr-1" />}
                          {i + 1}. {s.label}
                        </Button>
                      );
                    })}
                    <Button size="sm" variant="outline" onClick={resetLevel}>
                      ↩️ Сброс
                    </Button>
                  </div>
                </div>

                {/* Теория уровня + Как защититься */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Теория уровня
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{level.theory}</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Как защититься
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{tip}</p>
                  </div>
                </div>

                {/* Объяснение текущего шага */}
                <AnimatePresence>
                  {!done && currentStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="rounded-xl border border-sky-400/30 bg-sky-50/70 dark:bg-sky-500/10 dark:border-sky-400/30 p-3"
                    >
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Зачем шаг «{currentStep.label}»?
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{currentStep.explain}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Что уже сделано */}
                {passedSteps.length > 0 && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-50/70 dark:bg-emerald-500/10 dark:border-emerald-400/30 p-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Что уже сделано</div>
                    <ul className="space-y-1">
                      {passedSteps.map((s, i) => (
                        <li key={s.id} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            <b>{i + 1}. {s.label}:</b> {s.explain}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Правая колонка: уровни + hotkeys, со «скользящим» подсвет-маркером */}
        <div className="space-y-4">
          <Card className="bg-white/70 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Type className="h-4 w-4" /> Уровни
                </div>
                <div className="w-40">
                  <Progress value={progressPct} className="h-2" />
                </div>
              </div>

              <div className="relative grid gap-2">
                {/* общая подсветка для активного пункта */}
                <AnimatePresence>
                  <motion.div
                    key={`active-${idx}`}
                    layoutId="levelActive"
                    className="absolute inset-x-0 -z-10 rounded-xl bg-sky-500/10 ring-1 ring-sky-400/30"
                    style={{
                      top: `calc(${idx} * (var(--row-h, 48px) + 8px))`,
                      height: 'var(--row-h, 48px)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.35 }}
                  />
                </AnimatePresence>

                {LEVELS.map((lv, i) => {
                  const active = i === idx;
                  return (
                    <div key={lv.id} style={{ '--row-h': '48px' } as React.CSSProperties}>
                      <button
                        onClick={() => setIdx(i)}
                        className={`relative w-full text-left rounded-xl p-3 ring-1 transition-colors
                          ${active ? 'ring-sky-400/40' : 'bg-white/70 ring-black/10 hover:bg-slate-100/80 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {i + 1}. {lv.title}
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  disabled={idx === 0}
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                </Button>
                <Button
                  variant="outline"
                  disabled={idx === LEVELS.length - 1}
                  onClick={() => setIdx((i) => Math.min(LEVELS.length - 1, i + 1))}
                  className="flex-1"
                >
                  Далее <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 ring-1 ring-black/10 dark:bg.white/5 dark:bg-white/5 dark:ring-white/10">
            <CardContent className="p-4 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Enter — применить текущий шаг • R — сброс уровня • ←/→ — навигация по уровням
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CodeBattle;
