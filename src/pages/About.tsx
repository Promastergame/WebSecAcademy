// /src/pages/About.tsx
import { Link } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Code2,
  Lock,
  Bug,
  Search,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ───────────────────────────── Anim presets ───────────────────────────── */
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

const fadeInSlow = {
  ...fadeIn,
  transition: { duration: 0.65 },
} as const;

/* ───────────────────────────── Decor helpers ───────────────────────────── */
function Aura({
  className,
  from,
  via,
  to,
}: {
  className?: string;
  from: string;
  via: string;
  to: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute blur-3xl ${className}`}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${from}, ${via}, ${to})`,
        maskImage:
          "radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,1), rgba(0,0,0,0))",
        WebkitMaskImage:
          "radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,1), rgba(0,0,0,0))",
      }}
    />
  );
}

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-black dark:text-slate-100">
      {/* ауры — только в тёмной теме */}
      <Aura
        className="-top-44 -right-44 hidden h-[36rem] w-[36rem] rounded-full dark:block"
        from="rgba(99,102,241,0.35)"
        via="rgba(168,85,247,0.25)"
        to="rgba(34,211,238,0.35)"
      />
      <Aura
        className="-bottom-40 -left-40 hidden h-[38rem] w-[38rem] rounded-full dark:block"
        from="rgba(14,165,233,0.25)"
        via="rgba(59,130,246,0.18)"
        to="rgba(99,102,241,0.25)"
      />

      {/* сетка-фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14] dark:opacity-[0.24] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.12) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-3 py-10 sm:px-5 md:px-6 lg:px-8 sm:py-14 md:py-16">
        {/* верхний лейбл */}
        <motion.div className="mb-6 sm:mb-8 flex items-center justify-center gap-2" {...fadeInSlow}>
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Учебный проект по кибербезопасности
          </span>
        </motion.div>

        {/* рамка с градиентом */}
        <div className="relative mx-auto w-full rounded-[1.25rem] p-[1px] before:absolute before:inset-0 before:-z-10 before:rounded-[1.25rem] before:bg-gradient-to-r before:from-indigo-500/30 before:to-cyan-500/30 dark:before:from-indigo-500/40 dark:before:to-cyan-500/40">
          <Card className="relative overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
            <CardHeader className="border-b border-slate-200 p-6 sm:p-8 md:p-10 dark:border-white/10">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
                className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              >
                <span className="bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-cyan-300">
                  О проекте
                </span>
              </motion.h1>
              <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                Этот сайт — <strong className="text-slate-800 dark:text-white/90">учебная платформа по кибербезопасности</strong>,
                которая знакомит с базовыми угрозами и практиками защиты в веб-разработке на интерактивных примерах.
              </p>
            </CardHeader>

            <CardContent className="p-5 sm:p-7 md:p-8">
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.3fr_1fr]">
                {/* левая колонка */}
                <section className="space-y-4 sm:space-y-6">
                  <motion.div
                    {...fadeIn}
                    className="group flex items-start gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-sm hover:bg-white transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="rounded-xl bg-indigo-600/10 p-3 ring-1 ring-indigo-600/20 dark:bg-indigo-500/15 dark:ring-indigo-500/30">
                      <ShieldCheck className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold">Зачем это нужно</h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                        Проект помогает школьникам и начинающим разработчикам понять риски
                        и увидеть, как применять безопасные паттерны в реальном коде — без сложной теории.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55 }}
                    className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm hover:bg-white transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="rounded-xl bg-violet-600/10 p-3 ring-1 ring-violet-600/20 dark:bg-violet-500/15 dark:ring-violet-500/30">
                      <Code2 className="h-6 w-6 text-violet-700 dark:text-violet-300" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold">Об авторе</h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                        <strong className="text-slate-900 dark:text-white/90">Promaster</strong> — начинающий разработчик, создающий сайты, игры и чат-ботов для Telegram. Люблю экспериментировать с идеями, учусь новым технологиям и превращаю код в что-то живое и интересное. с упором на понятные примеры и практику.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm hover:bg-white transition-colors dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="rounded-xl bg-cyan-600/10 p-3 ring-1 ring-cyan-600/20 dark:bg-cyan-500/15 dark:ring-cyan-500/30">
                      <GraduationCap className="h-6 w-6 text-cyan-700 dark:text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold">Чему вы научитесь</h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                        Разберётесь в основных угрозах веба, научитесь распознавать уязвимости
                        (SQLi, XSS и др.) и закрепите практики защиты на наглядных симуляторах.
                      </p>
                    </div>
                  </motion.div>

                  <div className="mt-2 flex flex-wrap gap-2 sm:gap-2.5">
                    <Badge className="h-7 sm:h-8 gap-1 bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:ring-white/15 dark:hover:bg-white/15">
                      <Lock className="h-4 w-4" /> SQL Injection
                    </Badge>
                    <Badge className="h-7 sm:h-8 gap-1 bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:ring-white/15 dark:hover:bg-white/15">
                      <Bug className="h-4 w-4" /> XSS
                    </Badge>
                    <Badge className="h-7 sm:h-8 gap-1 bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white dark:bg-white/10 dark:text-slate-200 dark:ring-white/15 dark:hover:bg-white/15">
                      <Search className="h-4 w-4" /> OSINT
                    </Badge>
                  </div>
                </section>

                {/* правая колонка */}
                <aside className="space-y-4 sm:space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur">
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Содержание проекта
                    </h3>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-200">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        Введение в угрозы и модели атак
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                        Практические мини-демо уязвимостей
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                        Рекомендации и чек-листы защиты
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm dark:border-white/10 dark:bg-white/10">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      Материалы предназначены исключительно для обучения. Применяйте знания ответственно:
                      этика и закон превыше всего.
                    </p>
                  </div>
                </aside>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-5 sm:gap-6 border-t border-slate-200 p-6 sm:p-8 dark:border-white/10">
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                © 2025 Promaster Development. Все права защищены.
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="rounded-xl from-indigo-600 to-fuchsia-600 bg-gradient-to-r text-white hover:brightness-[1.05]"
                >
                  <Link to="/sql" aria-label="Перейти к SQL модулю" className="inline-flex items-center gap-2">
                    Начать изучение <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  className="rounded-xl border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-slate-100 dark:backdrop-blur dark:hover:bg-white/15"
                >
                  <a href="#contact" aria-label="Связаться с автором" className="inline-flex items-center gap-2">
                    Связаться с автором
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
