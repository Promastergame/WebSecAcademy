// components/sql/TheoryTab.tsx
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Shield, Info, Code2, Layers, Stars, ListChecks, Check,
} from 'lucide-react';

type Props = {
  theoryRead: boolean;
  onTheoryReadChange: (value: boolean) => void;
};

/* ============================== Анимации / утилиты ============================== */
const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const gradientBackdrop =
  'radial-gradient(900px 380px at 0% -10%, rgba(59,130,246,0.10), transparent), radial-gradient(800px 320px at 100% 120%, rgba(16,185,129,0.10), transparent)';

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-primary/10 ring-1 ring-primary/20">{icon}</div>
      <div>
        <h3 className="text-xl font-bold leading-tight">{title}</h3>
        {subtitle ? <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function GlassCard(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <motion.section
      variants={fade}
      className={`relative rounded-2xl ring-1 ring-border bg-card/90 backdrop-blur-xl overflow-hidden ${className}`}
      {...rest}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: gradientBackdrop }} />
      <div className="relative p-6">{children}</div>
    </motion.section>
  );
}

function CodeBlock({
  title, tone, children,
}: { title: string; tone: 'good' | 'bad' | 'neutral'; children: React.ReactNode }) {
  const toneCls =
    tone === 'good'
      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
      : tone === 'bad'
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
      : 'border-border bg-muted/40 text-foreground';

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className={`px-3 py-2 text-xs font-medium ${toneCls}`}>
        {tone === 'good' && 'Хорошо (безопаснее)'}
        {tone === 'bad' && 'Плохо (уязвимо)'}
        {tone === 'neutral' && title}
      </div>
      <pre className="text-xs md:text-sm leading-relaxed p-3 bg-background/60 text-foreground overflow-auto whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

function TipsBox({ title, items }: { title: string; items: React.ReactNode[] }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="font-medium">{title}</p>
      <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1 space-y-1">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

/* ============================== Крутой тумблер «Прочитал» ============================== */
/** Глянцевый тумблер: плавное перетекание, свечение, анимированная галочка, мини-конфетти. */
function ReadToggle({
  checked,
  onChange,
  label = 'Прочитал(а)',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  const [burstKey, setBurstKey] = useState(0);

  const confetti = useMemo(
    () => Array.from({ length: 16 }, (_, i) => i),
    []
  );

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => {
          const next = !checked;
          onChange(next);
          if (next) setBurstKey((k) => k + 1);
        }}
        aria-pressed={checked}
        className={`relative inline-flex h-10 w-20 items-center rounded-full transition
        ring-1 ${checked ? 'bg-emerald-500/25 ring-emerald-400/40' : 'bg-muted/50 ring-border'}`}
      >
        {/* Блик по поверхности */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.04) 40%, transparent 60%)',
          }}
        />
        {/* Движущийся индикатор */}
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-lg
          bg-white text-slate-900`}
          style={{ marginLeft: checked ? 'calc(100% - 2.5rem)' : '0.25rem' }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {checked ? (
              <motion.span
                key="on"
                initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0, rotate: 30 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                className="text-emerald-600"
              >
                <Check className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="off"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="text-slate-600"
              >
                <BookMarkIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>

        {/* Мягкое свечение в включённом состоянии */}
        <AnimatePresence>
          {checked && (
            <motion.span
              key="glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: '0 0 40px 8px rgba(16,185,129,0.35) inset, 0 0 22px 6px rgba(16,185,129,0.25)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Мини-конфетти при включении */}
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              key={burstKey}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {confetti.map((i) => {
                const angle = (i / confetti.length) * Math.PI * 2;
                const dist = 28 + Math.random() * 18;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    initial={{ x: 0, y: 0, scale: 0.8, opacity: 0.9, rotate: 0 }}
                    animate={{ x, y, scale: 1, opacity: 0, rotate: 180 + Math.random() * 180 }}
                    transition={{ duration: 0.7 + Math.random() * 0.25, ease: 'easeOut' }}
                    style={{
                      width: 6,
                      height: 8,
                      borderRadius: 2,
                      background: ['#34d399', '#60a5fa', '#f59e0b', '#a78bfa'][i % 4],
                      boxShadow: '0 0 10px rgba(255,255,255,0.25)',
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Иконка «книжка» (минималистичная), чтобы не тянуть лишнее */
function BookMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M7 3h8a2 2 0 0 1 2 2v15l-6-3-6 3V5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

/* ============================== Главный компонент ============================== */
export function TheoryTab({ theoryRead, onTheoryReadChange }: Props) {
  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* HERO */}
      <motion.header
        variants={fade}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl"
        style={{ backgroundImage: gradientBackdrop }}
      >
        {/* мягкие свечения */}
        <div
          aria-hidden
          className="absolute -top-32 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(120px 120px at 50% 50%, rgba(59,130,246,0.20), transparent)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(120px 120px at 50% 50%, rgba(16,185,129,0.20), transparent)' }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Теория: защита от SQL-инъекций</h1>
              <p className="text-muted-foreground mt-1">
                Простые объяснения, наглядные примеры и шпаргалка для быстрого повторения.
              </p>
            </div>
          </div>

          {/* статус прочтения + тумблер */}
          <div className="flex items-center gap-4">
            <div className={`px-3 py-2 rounded-xl ring-1 ${theoryRead ? 'bg-emerald-400/10 ring-emerald-400/30' : 'bg-muted/40 ring-border'}`}>
              <div className="text-xs text-muted-foreground">Статус</div>
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${theoryRead ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                <span className="font-semibold">{theoryRead ? 'Прочитано' : 'Не прочитано'}</span>
              </div>
            </div>

            <ReadToggle checked={theoryRead} onChange={onTheoryReadChange} />
          </div>
        </div>
      </motion.header>

      {/* 1. Что такое SQL-инъекция */}
      <GlassCard>
        <SectionTitle icon={<Info className="h-5 w-5 text-sky-500" />} title="Что такое SQL-инъекция" />
        <p className="mt-2 text-foreground">
          <strong>SQL Injection (SQLi)</strong> — уязвимость, при которой ввод пользователя попадает в SQL-запрос как
          <em> код</em>, а не как <em>данные</em>. Это позволяет злоумышленнику менять логику запроса: читать чужие записи,
          обходить аутентификацию, изменять или удалять данные. Классические примеры — конструкции <code>OR 1=1</code>,
          <code>UNION SELECT</code>, комментарии <code>--</code> и <code>/* ... */</code>.
        </p>
        <TipsBox
          title="Что запомнить"
          items={[
            <>SQL-код и данные должны быть жёстко разделены.</>,
            <>Опасно собирать запросы через строковую конкатенацию.</>,
            <>Базовая защита — параметризация (prepared statements).</>,
          ]}
        />
      </GlassCard>

      {/* 2. Почему конкатенация опасна */}
      <GlassCard>
        <SectionTitle icon={<Code2 className="h-5 w-5 text-rose-400" />} title="Почему опасна конкатенация строк" />
        <p className="mt-2 text-foreground">
          Если формировать запрос так: <code>{`"SELECT * FROM users WHERE id = " + userInput`}</code>, пользовательский ввод
          становится частью SQL и может «сломать» синтаксис, добавив свои команды.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <CodeBlock title="Плохо" tone="bad">
{`const id = req.query.id;
const sql = "SELECT * FROM users WHERE id = " + id; // ❌ конкатенация
db.query(sql);`}
          </CodeBlock>
          <CodeBlock title="Хорошо" tone="good">
{`const id = Number(req.query.id);
const sql = "SELECT * FROM users WHERE id = ?"; // ✅ плейсхолдер
db.query(sql, [id]); // данные отдельно от кода`}
          </CodeBlock>
        </div>
        <TipsBox
          title="Что запомнить"
          items={[
            <>Не «склеивать» SQL строками; использовать параметры (<code>?</code>, <code>$1</code> и т.п.).</>,
            <>Экранирование/валидация — доп. меры, они не заменяют параметризацию.</>,
          ]}
        />
      </GlassCard>

      {/* 3. Параметризация */}
      <GlassCard>
        <SectionTitle icon={<Layers className="h-5 w-5 text-violet-400" />} title="Параметризация (Prepared Statements)" />
        <p className="mt-2 text-foreground">
          Подготовленные выражения «жёстко» разделяют SQL-шаблон и значения. Сначала база «готовит» запрос с плейсхолдерами,
          затем отдельно получает параметры. Данные не трактуются как SQL-код.
        </p>
        <ul className="list-disc pl-5 mt-3 text-muted-foreground space-y-1">
          <li>Работает на стороне сервера (бэкенда).</li>
          <li>Поддерживается драйверами/ORM (используй параметризованные методы вместо raw SQL).</li>
          <li>Основа защиты от SQLi в любых технологиях.</li>
        </ul>
        <TipsBox
          title="Что запомнить"
          items={[
            <>Параметризуй любой внешний ввод (id, email, поиск и т.д.).</>,
            <>Даже с ORM избегай небезопасных raw-запросов.</>,
          ]}
        />
      </GlassCard>

      {/* 4. UNION и Blind */}
      <GlassCard>
        <SectionTitle icon={<Stars className="h-5 w-5 text-amber-400" />} title="UNION-инъекции и Blind SQLi" />
        <div className="space-y-3 text-foreground mt-2">
          <p>
            <strong>UNION-инъекция</strong> добавляет в запрос <code>UNION SELECT</code>, чтобы «пришить» лишние столбцы и
            вытянуть данные из других таблиц.
          </p>
          <p>
            <strong>Blind SQLi</strong> — когда приложение не показывает результаты напрямую. Техники:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <em>Boolean-based:</em> страница меняет поведение при TRUE/FALSE (другой текст/статус).
            </li>
            <li>
              <em>Time-based:</em> добавляются задержки (<code>SLEEP</code>, <code>WAITFOR</code>), по времени ответа судят,
              истинно условие или нет.
            </li>
          </ul>
        </div>
        <TipsBox
          title="Что запомнить"
          items={[
            <><code>UNION</code> объединяет результаты и позволяет вытянуть лишние данные.</>,
            <>Blind SQLi извлекает данные косвенно — по поведению/времени.</>,
          ]}
        />
      </GlassCard>

      {/* 5. Доп. защита */}
      <GlassCard>
        <SectionTitle icon={<Shield className="h-5 w-5 text-emerald-400" />} title="Дополнительные меры защиты" />
        <div className="grid md:grid-cols-3 gap-4 mt-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium mb-1">Валидация ввода</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Проверяй типы (число/UUID), длину и формат.</li>
              <li>Whitelist допустимых символов/значений.</li>
              <li>Аномалии — <code>400 Bad Request</code>.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium mb-1">Минимальные привилегии</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Учётка БД: только нужные права (SELECT/INSERT/UPDATE).</li>
              <li>Без <code>DROP/ALTER/GRANT</code>, если не требуется.</li>
              <li>Это ограничит ущерб при успешной SQLi.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium mb-1">Ошибки и логи</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Пользователю — нейтральные сообщения (без SQL-деталей).</li>
              <li>В логи — контекст, IP, аномальные паттерны (<code>--</code>, <code>/* */</code>, <code>UNION</code>).</li>
              <li>WAF/фильтры — дополнение, не замена параметризации.</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* 6. Шпаргалка */}
      <GlassCard>
        <SectionTitle icon={<ListChecks className="h-5 w-5 text-indigo-400" />} title="Шпаргалка к квизу" />
        <ul className="list-disc pl-5 text-muted-foreground mt-2 space-y-1">
          <li>Базовая защита: <strong>prepared statements</strong>.</li>
          <li>Конкатенация опасна: ввод становится частью SQL-кода.</li>
          <li>Blind SQLi: <em>Boolean-based</em> и <em>Time-based</em>.</li>
          <li><code>UNION SELECT</code> — объединяет результаты для вытягивания данных.</li>
          <li>Валидация и минимум прав — усилители, но не замена параметризации.</li>
        </ul>
      </GlassCard>

      {/* 7. Переключатель "прочитал" — глянцевый */}
      <GlassCard className="ring-1 ring-border">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Пометить теорию как прочитанную</p>
            <p className="text-sm text-muted-foreground">Это откроет доступ ко всем разделам и даст 100% по теории.</p>
          </div>
          <ReadToggle checked={theoryRead} onChange={onTheoryReadChange} />
        </div>
      </GlassCard>
    </motion.div>
  );
}
