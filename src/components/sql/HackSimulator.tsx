import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Terminal, Shield, Lock, Play, Square, BookOpen,
  Lightbulb, Info, RefreshCw, Copy, ClipboardCheck, Eye, EyeOff, KeyRound, User2,
  LayoutDashboard, Database, Users as UsersIcon, FileText, Search, Filter, Download,
  ShoppingCart, BookOpenCheck, Award, CheckCircle2, Activity, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

/** =========================================================
 *  HackSimulator Pro — чистая версия без звука и паузы
 *  • Красивый каркас (Panel, ToolbarButton, SectionTitle)
 *  • Улучшенная консоль без таймеров/RAF (мгновенный вывод)
 *  • Вкладки: Dashboard / Users / Logs / Theory+ / Shop
 *  • Shop детектит любые кавычки (', ", `) и UNION
 *  • Экспорт логов — совместим с FF/Safari/Chrome
 *  • Без аудио, без режима паузы, минимум побочных эффектов
 * ========================================================= */

type ScenarioKey = "login" | "search" | "profile";
export interface HackSimulatorProps {
  scenario?: ScenarioKey;
  onHackSuccess?: (method: string) => void;
  onDefenseSuccess?: () => void; // совместимость
}

/** ─────────────────────────────────────────────────────────
 * Утилиты и мини-компоненты
 * ───────────────────────────────────────────────────────── */

type LineKind = "system" | "info" | "success" | "error" | "warning";
const colorByKind: Record<LineKind, string> = {
  system: "text-gray-500 dark:text-gray-400",
  info: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-rose-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-yellow-400",
};
const prefixByKind: Record<LineKind, string> = {
  system: "⚪",
  info: "🔵",
  success: "🟢",
  error: "🔴",
  warning: "🟡",
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const nowISO = () => new Date().toISOString().replace("T", " ").slice(0, 19);

const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

const Badge: React.FC<{ children: React.ReactNode; tone?: "blue" | "green" | "red" | "yellow" | "gray" | "violet" }> = ({ children, tone = "gray" }) => {
  const toneMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40",
    green: "bg-green-100 text-green-700 border-green-300 dark:bg-green-500/15 dark:text-green-300 dark:border-green-400/40",
    red: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/40",
    yellow: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-400/40",
    gray: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-400/40",
    violet: "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/40",
  };
  return <span className={`text-xs px-2 py-1 rounded border ${toneMap[tone]}`}>{children}</span>;
};

const GhostField: React.FC<{ value: string; label?: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    const ok = await copyToClipboard(value);
    setCopied(ok);
    setTimeout(() => setCopied(false), 900);
  };
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 rounded border bg-gray-50 border-gray-200 dark:bg-gray-800/70 dark:border-gray-700">
      <div className="truncate text-xs text-gray-700 dark:text-gray-300">
        {label ? <span className="text-gray-500 dark:text-gray-400 mr-1">{label}:</span> : null}
        <code className="text-gray-900 dark:text-gray-100">{value}</code>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={doCopy}
        aria-label={copied ? "Скопировано" : "Скопировать в буфер обмена"}
      >
        {copied ? <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
        {copied ? "Скопировано" : "Копировать"}
      </Button>
    </div>
  );
};

const Panel: React.FC<React.PropsWithChildren<{ className?: string; decorative?: boolean }>> = ({ className = "", decorative, children }) => (
  <div className={`relative rounded-2xl border bg-white/70 backdrop-blur text-gray-900 shadow-xl dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-zinc-900 dark:border-gray-800/80 dark:text-gray-100 ${className}`}>
    {decorative && (
      <div className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:radial-gradient(140px_60px_at_20%_0%,#000_40%,transparent_70%)]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 via-pink-400/10 to-indigo-400/20" />
      </div>
    )}
    {children}
  </div>
);

const ToolbarButton: React.FC<React.ComponentProps<typeof Button>> = ({ className = "", ...props }) => (
  <Button
    variant="outline"
    size="sm"
    className={`border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 ${className}`}
    {...props}
  />
);

const SectionTitle: React.FC<React.PropsWithChildren<{ icon?: React.ReactNode }>> = ({ icon, children }) => (
  <div className="font-semibold flex items-center gap-2 text-sm sm:text-base">
    {icon}
    {children}
  </div>
);

/** ─────────────────────────────────────────────────────────
 * Псевдо-БД и логи
 * ───────────────────────────────────────────────────────── */

type UserRole = "user" | "manager" | "admin";
interface FakeUser { id: number; login: string; role: UserRole; reg: string }

const sampleNames = ["alice", "bob", "carol", "dave", "erin", "frank", "grace", "mallory", "trent", "victor", "peggy"];
const roles: UserRole[] = ["user", "manager", "user", "user", "user", "manager", "user", "user", "user", "user", "user"];
const makeUsers = (n: number): FakeUser[] => Array.from({ length: n }).map((_, i) => ({
  id: i + 1,
  login: `${sampleNames[i % sampleNames.length]}${i + 1}`,
  role: roles[i % roles.length],
  reg: new Date(Date.now() - randInt(1, 60) * 86400000).toISOString().slice(0, 10),
}));

type LogLevel = "INFO" | "WARN" | "BLOCK";
interface FakeLog { ts: string; ip: string; path: string; msg: string; level: LogLevel; _hidden?: boolean }

const randIp = () => `${randInt(2, 230)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
const baseMsg = ["OK login", "Password fail", "Rate limit", "2FA required", "Blocked by WAF", "Search ok", "Profile read"];
const sqliPatterns = [
  "payload: admin' --",
  "payload: ' OR '1'='1",
  "payload: id=1 OR 1=1",
  "payload: term=%' UNION SELECT NULL,NULL--",
  "payload: /* time-based */ SLEEP(2)",
];
const makeLogs = (n: number): FakeLog[] => Array.from({ length: n }).map(() => {
  const isAttack = Math.random() < 0.32;
  return {
    ts: nowISO(),
    ip: randIp(),
    path: ["/login", "/search?q=...", "/user/1", "/shop", "/api/orders"][randInt(0, 4)],
    msg: isAttack ? sqliPatterns[randInt(0, sqliPatterns.length - 1)] : baseMsg[randInt(0, baseMsg.length - 1)],
    level: isAttack ? (Math.random() < 0.6 ? "BLOCK" : "WARN") : "INFO",
  };
});

/** ─────────────────────────────────────────────────────────
 * Живая консоль без таймеров (мгновенный вывод)
 * ───────────────────────────────────────────────────────── */
interface OutputLine { text: string; kind: LineKind; ts: number }
const LiveConsole: React.FC<{ lines: OutputLine[]; className?: string }> = ({ lines, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);
  return (
    <div
      ref={ref}
      className={`flex-1 rounded-xl border p-3 font-mono text-sm overflow-y-auto h-56 bg-gray-50/70 border-gray-200 dark:bg-black/50 dark:border-gray-800 ${className || ""}`}
      aria-live="polite"
    >
      <div className="space-y-1">
        {lines.length === 0 ? (
          <div className="text-gray-500 italic">Сначала обойди логин, чтобы попасть в панель…</div>
        ) : (
          lines.map((item) => (
            <div key={item.ts} className={colorByKind[item.kind]}>
              {prefixByKind[item.kind]} {item.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/** ─────────────────────────────────────────────────────────
 * Основной компонент
 * ───────────────────────────────────────────────────────── */
function HackSimulator({ onHackSuccess }: HackSimulatorProps) {
  // UI/State
  const [siteUser, setSiteUser] = useState("");
  const [sitePass, setSitePass] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [siteMsg, setSiteMsg] = useState<string>("");
  const [isLogged, setIsLogged] = useState(false);
  const [isHacked, setIsHacked] = useState(false);

  type Tab = "dashboard" | "users" | "logs" | "theory" | "shop";
  const [tab, setTab] = useState<Tab>("dashboard");

  // Псевдобаза
  const [userCount, setUserCount] = useState<number>(() => randInt(5, 1000));
  const [users, setUsers] = useState<FakeUser[]>(() => makeUsers(Math.min(30, Math.max(8, Math.round(userCount / 10)))));
  const [logs, setLogs] = useState<FakeLog[]>(() => makeLogs(12));

  // Живая консоль (без таймеров)
  const [output, setOutput] = useState<OutputLine[]>([]);
  const addLine = useCallback((text: string, kind: LineKind) => {
    setOutput((prev) => [...prev, { text, kind, ts: Date.now() + Math.random() }]);
  }, []);

  useEffect(() => {
    addLine("🚀 Мини-сайт запущен (учебная песочница)", "system");
    addLine("🎯 Цель: обойти логин через SQL-инъекцию и попасть в панель", "info");
  }, [addLine]);

  // Ачивки
  const [ach, setAch] = useState({ hacked: false, sawLogs: false, exportedLogs: false, readTheory: false });
  const unlock = useCallback((k: keyof typeof ach) => setAch((a) => (a[k] ? a : { ...a, [k]: true })), []);

  /** Уязвимая проверка входа (учебная) */
  const vulnerableLoginCheck = useCallback((u: string, _p: string) => {
    const trimmed = u.trim();
    if (trimmed.includes("' --") || trimmed.endsWith("--")) return { ok: true, method: "bypass_comment" as const };
    const U = trimmed.toUpperCase();
    if (U.includes("OR '1'='1") || U.includes("OR 1=1")) return { ok: true, method: "always_true" as const };
    if ((u === "admin" || u === "root") && _p.length > 0) return { ok: false, method: "normal_blocked" as const };
    return { ok: false, method: "no_match" as const };
  }, []);

  const attemptVulnerableLogin = useCallback(() => {
    setSiteMsg("");
    const res = vulnerableLoginCheck(siteUser, sitePass);
    if (res.ok) {
      setIsLogged(true);
      setIsHacked(true);
      setTab("dashboard");
      setSiteMsg("🎯 Успех: проверка обойдена (песочница). Добро пожаловать!");
      addLine("✅ Логин обойдён — доступ к админ-панели открыт", "success");
      unlock("hacked");
      onHackSuccess?.(res.method || "sql_basic_login");
    } else {
      if (res.method === "normal_blocked") {
        setSiteMsg("Обычный логин здесь отключён — цель упражнения: SQL-инъекция.");
        addLine("ℹ️ Попытка обычного логина заблокирована сценарием", "info");
      } else {
        setSiteMsg("Ошибка входа. Подумай про кавычку, комментарий или OR 1=1.");
        addLine("❌ Вход не выполнен", "error");
      }
    }
  }, [addLine, onHackSuccess, sitePass, siteUser, unlock, vulnerableLoginCheck]);

  /** Reset */
  const resetSite = useCallback(() => {
    setSiteUser("");
    setSitePass("");
    setIsLogged(false);
    setIsHacked(false);
    setTab("dashboard");
    setSiteMsg("Сайт сброшен");
    addLine("🔄 Сайт сброшен", "system");
  }, [addLine]);

  const fullReset = useCallback(() => {
    resetSite();
    const n = randInt(5, 1000);
    setUserCount(n);
    setUsers(makeUsers(Math.min(30, Math.max(8, Math.round(n / 10)))));
    setLogs(makeLogs(12));
    setOutput([]);
    addLine("🧹 Полный сброс мини-сайта", "system");
  }, [addLine, resetSite]);

  /** Экспорт логов (надёжно для всех браузеров) */
  const exportLogs = useCallback(() => {
    const header = "timestamp\tip\tpath\tlevel\tmsg\n";
    const body = logs.map((l) => `${l.ts}\t${l.ip}\t${l.path}\t${l.level}\t${l.msg}`).join("\n");
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `websec-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLine("⬇️ Логи экспортированы в .txt", "info");
    unlock("exportedLogs");
  }, [addLine, logs, unlock]);

  /** Теория — карточки */
  const TheoryCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="rounded-xl border bg-white/70 p-4 dark:bg-gray-900/60 dark:border-gray-800/80">
      <div className="font-medium mb-1 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-300" />
        {title}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );

  const theoryBlocks = useMemo(() => ([
    {
      title: "Second-order SQLi (вторичная инъекция)",
      body: (
        <>
          Инъекционный фрагмент сохраняется в БД как данные, но позже попадает в другой запрос и выполняется.
          <ul className="list-disc ml-5 mt-2">
            <li>Параметризуй <b>все</b> повторные использования данных.</li>
            <li>Не выполняй raw SQL на основе данных без параметров.</li>
          </ul>
        </>
      ),
    },
    {
      title: "LIKE + ESCAPE",
      body: (
        <>
          Даже при параметризации шаблонов <code>%term%</code> экранируй символы <code>%</code> и <code>_</code>.
          Пример: <code>WHERE content LIKE ? ESCAPE '\\'</code>; в параметрах: <code>% → \\%</code>, <code>_ → \\_</code>.
        </>
      ),
    },
    { title: "Безопасный IN-список", body: <>Делай плейсхолдер под каждое значение: <code>IN (?,?,?)</code>.</> },
    { title: "Хранимые ≠ иммунитет", body: <>Внутри хранимок динамический SQL тоже параметризуй.</> },
    { title: "Опасности ORM", body: <>Осторожнее с <code>raw</code>/<code>whereRaw</code> и экранированием идентификаторов.</> },
    { title: "RLS / мульти-тенантность", body: <>Включай Row-Level Security на уровне БД.</> },
    { title: "Минимальные привилегии", body: <>Учётка БД — только нужные права (без DROP/ALTER/GRANT).</> },
  ]), []);

  /** Спарклайн */
  const dashSeries = useMemo(() => Array.from({ length: 20 }, () => randInt(4, 26)), []);
  const sparkPath = useMemo(() => {
    const w = 160, h = 36, dx = w / (dashSeries.length - 1);
    const max = Math.max(...dashSeries), min = Math.min(...dashSeries);
    const norm = (v: number) => h - ((v - min) / Math.max(1, max - min)) * h;
    return dashSeries.map((v, i) => `${i === 0 ? "M" : "L"} ${Math.round(i * dx)} ${Math.round(norm(v))}`).join(" ");
  }, [dashSeries]);

  /** Рендер */
  return (
    <div className="space-y-6 rounded-2xl p-6 border-2 border-amber-400/40 bg-white text-gray-900 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.35)] dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-zinc-900 dark:text-gray-100" role="region" aria-label="Учебная песочница SQL Injection">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 dark:bg-yellow-500/15 dark:border-yellow-500/30 shadow-inner">
            <Terminal className="h-5 w-5 text-amber-700 dark:text-yellow-300" aria-hidden />
          </div>
          <div>
            <div className="text-xs flex items-center gap-2">
              <Badge tone="yellow">Учебная песочница</Badge>
              <Badge tone="violet">SQL Injection</Badge>
              <Badge tone="blue">Vulnerable Mini‑Site</Badge>
            </div>
            <h3 className="font-extrabold text-lg leading-tight tracking-tight">Хакерский симулятор • Взлом входа и админ‑панель</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ToolbarButton onClick={fullReset} title="Полный сброс">
            <Square className="h-4 w-4 mr-2" />
            Сброс
          </ToolbarButton>
        </div>
      </div>

      {/* Блок логина */}
      {!isLogged && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Panel decorative>
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={<Lock className="h-4 w-4 text-amber-600 dark:text-yellow-300" aria-hidden />}>Учебный уязвимый сайт — Вход</SectionTitle>
                <Badge tone="red">Не повторять в проде</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block" htmlFor="loginField">
                    <User2 className="inline-block h-4 w-4 mr-1" aria-hidden /> Логин:
                  </label>
                  <input
                    id="loginField"
                    type="text"
                    value={siteUser}
                    onChange={(e) => setSiteUser(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    placeholder="например: admin' --"
                    aria-describedby="loginHint"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block" htmlFor="passwordField">
                    <KeyRound className="inline-block h-4 w-4 mr-1" aria-hidden /> Пароль:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="passwordField"
                      type={hidePassword ? "password" : "text"}
                      value={sitePass}
                      onChange={(e) => setSitePass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      placeholder="обычно требуется, но цель — обойти проверку"
                    />
                    <ToolbarButton
                      onClick={() => setHidePassword((v) => !v)}
                      title={hidePassword ? "Показать пароль" : "Скрыть пароль"}
                      aria-label={hidePassword ? "Показать пароль" : "Скрыть пароль"}
                      aria-pressed={!hidePassword}
                    >
                      {hidePassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </ToolbarButton>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={attemptVulnerableLogin} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow">
                  <Play className="h-4 w-4 mr-2" /> Войти (Enter)
                </Button>
                <ToolbarButton onClick={resetSite}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Сброс
                </ToolbarButton>
              </div>

              {siteMsg && <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">{siteMsg}</div>}

              <div className="mt-4" id="loginHint">
                <details className="rounded-lg border bg-gray-50 text-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200">
                  <summary className="p-3 cursor-pointer font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                    💡 Подсказка
                  </summary>
                  <div className="p-3 border-t text-sm bg-white dark:bg-gray-950 dark:border-gray-800">
                    Попробуй разрушить условие проверки логина через кавычку/комментарий:
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      <GhostField label="username" value={`admin' --`} />
                      <GhostField label="или" value={`' OR '1'='1`} />
                    </div>
                  </div>
                </details>
              </div>
            </Panel>

            <Panel>
              <SectionTitle icon={<Terminal className="h-4 w-4 text-emerald-600 dark:text-green-400" aria-hidden />}>Лог системы</SectionTitle>
              <LiveConsole lines={output} />
            </Panel>
          </div>

          {/* Правая колонка — описание + ачивки */}
          <div className="space-y-4">
            <Panel>
              <div className="flex items-center justify-between mb-2">
                <SectionTitle icon={<Info className="h-4 w-4 text-blue-600 dark:text-blue-300" aria-hidden />}>Что будет после обхода?</SectionTitle>
                <Badge tone="blue">Admin‑панель</Badge>
              </div>
              <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                <li>Dashboard с метриками и мини‑графиком.</li>
                <li>Users — обезличенный список пользователей.</li>
                <li>Logs — правдоподобные записи атак + экспорт.</li>
                <li>Theory+ — дополнительная теория.</li>
                <li>Shop — «поиск учебников» с подсветкой опасных запросов.</li>
              </ul>
            </Panel>

            <Panel>
              <SectionTitle icon={<Award className="h-4 w-4 text-emerald-600" aria-hidden />}>Достижения</SectionTitle>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${ach.hacked ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-gray-800"}`}>
                  <CheckCircle2 className={`h-4 w-4 ${ach.hacked ? "text-emerald-500" : "text-gray-400"}`} aria-hidden />
                  Обойти логин
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${ach.sawLogs ? "border-amber-400/60 bg-amber-50 dark:bg-amber-500/10" : "border-gray-200 dark:border-gray-800"}`}>
                  <CheckCircle2 className={`h-4 w-4 ${ach.sawLogs ? "text-amber-500" : "text-gray-400"}`} aria-hidden />
                  Открыть логи
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${ach.exportedLogs ? "border-indigo-400/60 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-gray-800"}`}>
                  <CheckCircle2 className={`h-4 w-4 ${ach.exportedLogs ? "text-indigo-500" : "text-gray-400"}`} aria-hidden />
                  Экспорт логов
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${ach.readTheory ? "border-violet-400/60 bg-violet-50 dark:bg-violet-500/10" : "border-gray-200 dark:border-gray-800"}`}>
                  <CheckCircle2 className={`h-4 w-4 ${ach.readTheory ? "text-violet-500" : "text-gray-400"}`} aria-hidden />
                  Прочитать Theory+
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Ачивки срабатывают автоматически при действиях.</div>
            </Panel>
          </div>
        </div>
      )}

      {/* Панель после взлома */}
      {isLogged && (
        <div className="space-y-4">
          <Panel decorative>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden />
                <h4 className="font-semibold">Admin Panel</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="green">Доступ получен</Badge>
                <ToolbarButton onClick={resetSite}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Сбросить логин
                </ToolbarButton>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2 dark:text-gray-300">Добро пожаловать, <b>admin</b> 👋</p>
          </Panel>

          {/* табы */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setTab("dashboard")} variant={tab === "dashboard" ? "default" : "outline"} className={tab === "dashboard" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""} aria-pressed={tab==="dashboard"}>
              <Database className="h-4 w-4 mr-1" aria-hidden /> Dashboard
            </Button>
            <Button onClick={() => setTab("users")} variant={tab === "users" ? "default" : "outline"} className={tab === "users" ? "bg-indigo-600 hover:bg-индigo-700 text-white" : ""} aria-pressed={tab==="users"}>
              <UsersIcon className="h-4 w-4 mr-1" aria-hidden /> Users
            </Button>
            <Button onClick={() => { setTab("logs"); unlock("sawLogs"); }} variant={tab === "logs" ? "default" : "outline"} className={tab === "logs" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""} aria-pressed={tab==="logs"}>
              <FileText className="h-4 w-4 mr-1" aria-hidden /> Logs
            </Button>
            <Button onClick={() => { setTab("theory"); unlock("readTheory"); }} variant={tab === "theory" ? "default" : "outline"} className={tab === "theory" ? "bg-violet-600 hover:bg-violet-700 text-white" : ""} aria-pressed={tab==="theory"}>
              <BookOpen className="h-4 w-4 mr-1" aria-hidden /> Theory+
            </Button>
            <Button onClick={() => setTab("shop")} variant={tab === "shop" ? "default" : "outline"} className={tab === "shop" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""} aria-pressed={tab==="shop"}>
              <ShoppingCart className="h-4 w-4 mr-1" aria-hidden /> Shop
            </Button>
          </div>

          {/* контент вкладок */}
          {tab === "dashboard" && (
            <div className="grid md:grid-cols-3 gap-4">
              <Panel>
                <div className="text-xs text-gray-500 dark:text-gray-400">Всего пользователей</div>
                <AnimatedCounter value={userCount} className="text-3xl font-extrabold mt-1 tracking-tight" />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => {
                    const n = randInt(5, 1000);
                    setUserCount(n);
                    setUsers(makeUsers(Math.min(30, Math.max(8, Math.round(n / 10)))));
                    addLine("ℹ️ userCount обновлён", "info");
                  }} aria-label="Перегенерировать количество пользователей">Перегенерировать</Button>
                </div>
              </Panel>

              <Panel>
                <div className="text-xs text-gray-500 dark:text-gray-400">Подозрительных запросов</div>
                <AnimatedCounter value={randInt(3, 37)} className="text-3xl font-extrabold mt-1 tracking-tight" />
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Bell className="h-4 w-4" aria-hidden /> Порог оповещения: 20/сутки
                </div>
              </Panel>

              <Panel>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Activity className="h-4 w-4" aria-hidden /> Тренд атак (спарклайн)
                </div>
                <svg width="160" height="36" className="mt-2" role="img" aria-label="Мини‑график тренда атак">
                  <path d={sparkPath} fill="none" stroke="currentColor" className="text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
                </svg>
              </Panel>
            </div>
          )}

          {tab === "users" && (
            <Panel>
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={<UsersIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" aria-hidden />}>Список пользователей (обезличено)</SectionTitle>
                <Button size="sm" variant="outline" onClick={() => setUsers(makeUsers(users.length))} aria-label="Обновить список пользователей">Обновить</Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-black/40">
                    <tr>
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Логин</th>
                      <th className="text-left p-2">Роль</th>
                      <th className="text-left p-2">Регистрация</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="p-2">{u.id}</td>
                        <td className="p-2">{u.login}</td>
                        <td className="p-2">{u.role}</td>
                        <td className="p-2">{u.reg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-500 mt-2">Данные вымышленные. Здесь нет реальных персональных данных.</div>
            </Panel>
          )}

          {tab === "logs" && (
            <Panel>
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={<FileText className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden />}>Логи</SectionTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setLogs(makeLogs(12))} aria-label="Обновить логи">Обновить</Button>
                  <Button size="sm" variant="outline" onClick={exportLogs} aria-label="Экспорт логов в текстовый файл">
                    <Download className="h-4 w-4 mr-1" aria-hidden /> Экспорт .txt
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 opacity-70" aria-hidden />
                <input
                  className="flex-1 px-2 py-2 rounded-lg border bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
                  placeholder="Фильтр по ip/path/msg…"
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    setLogs((prev) => prev.map((l) => ({ ...l, _hidden: q ? !JSON.stringify(l).toLowerCase().includes(q) : false })));
                  }}
                  aria-label="Фильтр логов"
                />
                <Badge tone="yellow"><Filter className="h-3.5 w-3.5 inline mr-1" aria-hidden />client‑side</Badge>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-black/40">
                    <tr>
                      <th className="text-left p-2">ts</th>
                      <th className="text-left p-2">ip</th>
                      <th className="text-left p-2">path</th>
                      <th className="text-left p-2">level</th>
                      <th className="text-left p-2">msg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => l._hidden ? null : (
                      <tr key={`${l.ts}-${i}`} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="p-2 whitespace-nowrap">{l.ts}</td>
                        <td className="p-2 whitespace-nowrap">{l.ip}</td>
                        <td className="p-2">{l.path}</td>
                        <td className="p-2">{l.level}</td>
                        <td className="p-2">{l.msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === "theory" && (
            <div className="grid md:grid-cols-2 gap-4">
              {theoryBlocks.map((b) => (
                <TheoryCard key={b.title} title={b.title}>{b.body}</TheoryCard>
              ))}
              <div className="rounded-xl border bg-white/70 p-4 dark:bg-gray-900/60 dark:border-gray-800/80">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden /> Быстрый чек‑лист защиты
                </div>
                <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                  <li>Параметризуй все внешние данные.</li>
                  <li>Экранируй <code>%</code> и <code>_</code> в LIKE (ESCAPE).</li>
                  <li>IN‑списки — только плейсхолдеры (<code>?,?,?</code>).</li>
                  <li>Минимальные права БД, раздельные роли.</li>
                  <li>RLS / tenant‑фильтры в самой БД.</li>
                  <li>Логи атак + алерты по паттернам.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === "shop" && (<ShopPlayground addLine={addLine} />)}
        </div>
      )}

      {/* Нижняя строка состояния */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800/60">
        <div className="text-sm text-gray-700 dark:text-gray-400">
          {isHacked ? (
            <span className="text-rose-700 dark:text-red-400">⚠️ Система скомпрометирована (песочница)</span>
          ) : (
            <span className="text-amber-700 dark:text-yellow-400">🎓 Задача: обойти вход с помощью SQL‑инъекции</span>
          )}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-2">
          <BookOpen className="h-4 w-4" aria-hidden /> SQL Injection Training • Mini‑Site
        </div>
      </div>
    </div>
  );
}

/** ─────────────────────────────────────────────────────────
 * Анимированный счётчик (для метрик)
 * ───────────────────────────────────────────────────────── */
const AnimatedCounter: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = disp;
    const to = value;
    const dur = 350;
    let rafId = 0;
    const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setDisp(Math.round(from + (to - from) * easeInOut(k)));
      if (k < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <div className={className}>{disp.toLocaleString("ru-RU")}</div>;
};

/** ─────────────────────────────────────────────────────────
 * Shop Playground (без флагов — просто учебные реакции)
 * ───────────────────────────────────────────────────────── */
const ShopPlayground: React.FC<{ addLine: (t: string, k: LineKind) => void }> = ({ addLine }) => {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<string>("Найдите учебники по ключевому слову…");
  const [warn1, setWarn1] = useState(false);
  const [warn2, setWarn2] = useState(false);

  const DANGEROUS_QUOTE_RE = /['"`]/;

  const run = useCallback(() => {
    const s = q.trim();
    if (!s) { setRes("Пустой запрос. Попробуй ключевое слово."); return; }

    if (DANGEROUS_QUOTE_RE.test(s)) {
      const found = s.match(DANGEROUS_QUOTE_RE)?.[0] ?? "'";
      setWarn1(true);
      setRes(`Ой… Похоже, запрос «сломался» от кавычки ${found}. Параметризуй LIKE и экранируй %/_ (ESCAPE).`);
      addLine("⚠️ В Shop замечена кавычка (включая обратную) — сломан LIKE", "warning");
      return;
    }
    if (/UNION/i.test(s)) {
      setWarn2(true);
      setRes("Обнаружен признак UNION. Помни про контроль числа столбцов и запрет RAW без плейсхолдеров.");
      addLine("⚠️ В Shop замечен признак UNION", "warning");
      return;
    }

    const hits = [
      { title: "Введение в SQL-безопасность", price: 0 },
      { title: "Практикум: Prepared Statements", price: 1 },
      { title: "Инъекции в LIKE и ESCAPE", price: 0 },
      { title: "Ограничение прав учётки БД", price: 0 },
    ].filter((x) => x.title.toLowerCase().includes(s.toLowerCase()));

    if (hits.length === 0) setRes("Ничего не найдено. Попробуй другое слово.");
    else setRes("Найдено:\n- " + hits.map((h) => `${h.title} — ${h.price ? h.price + "₽" : "бесплатно"}`).join("\n- "));
  }, [addLine, q]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Panel>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle icon={<ShoppingCart className="h-4 w-4 text-rose-600 dark:text-rose-300" aria-hidden />}>Магазин учебников</SectionTitle>
          <Badge tone="red">Учебные реакции</Badge>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">Введите запрос. Опасные последовательности подсветятся и расскажут, как защититься.</div>

        <div className="flex gap-2 mb-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
            placeholder="например: '   или   `   или   UNION SELECT"
            aria-label="Поисковый запрос по учебникам"
          />
          <Button onClick={run} aria-label="Искать учебники по запросу">Искать</Button>
        </div>

        <pre className="rounded-xl border p-3 text-xs bg-gray-50 border-gray-200 dark:bg-black/60 dark:border-gray-800 whitespace-pre-wrap" aria-live="polite">{res}</pre>

        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          <div className={`rounded-xl border p-2 ${warn1 ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-gray-800"}`}>
            <div className="font-medium text-sm flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Кавычка ломает синтаксис
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Параметризуй LIKE и экранируй %/_ (ESCAPE '\\').</div>
          </div>

          <div className={`rounded-xl border p-2 ${warn2 ? "border-indigo-400/60 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-200 dark:border-gray-800"}`}>
            <div className="font-medium text-sm flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-indigo-600" aria-hidden /> UNION: контроль схемы
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Следи за числом столбцов, запрещай RAW без плейсхолдеров.</div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Info className="h-4 w-4 text-rose-600 dark:text-rose-300" aria-hidden /> Как это связано с реальным SQL?
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            Кавычка демонстрирует, как опасная конкатенация ломает синтаксис запроса. UNION намекает на векторы «склейки» результатов.
            В реальном коде — только подготовленные выражения, whitelists для идентификаторов и экранирование шаблонов.
          </p>
        </div>
      </Panel>
    </div>
  );
};

/** ─────────────────────────────────────────────────────────
 * Экспорты
 * ───────────────────────────────────────────────────────── */
export default HackSimulator;
export { HackSimulator };
