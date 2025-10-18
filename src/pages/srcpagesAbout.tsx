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
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* декоративные анимированные блибы */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-600/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-600/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mb-10 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Учебный проект по кибербезопасности
          </p>
        </motion.div>

        <Card className="relative mx-auto w-full overflow-hidden rounded-2xl border-slate-200/60 bg-white/70 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader className="border-b border-slate-200/60 p-8 dark:border-slate-800">
            <motion.h1
              className="bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-600 bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              О проекте
            </motion.h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-300">
              Этот сайт — <strong>школьный проект по кибербезопасности</strong>,
              созданный для знакомства с базовыми угрозами и практиками защиты в вебе.
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
              {/* Левая колонка */}
              <section className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-indigo-600/10 p-3 ring-1 ring-indigo-600/20 dark:bg-indigo-500/10">
                      <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Зачем это нужно
                      </h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Проект создан для учебных целей: он помогает школьникам понять
                        основные риски и методы защиты веб‑приложений на простых примерах.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-violet-600/10 p-3 ring-1 ring-violet-600/20 dark:bg-violet-500/10">
                      <Code2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Разработчик
                      </h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        <strong>Promaster Development</strong> — ученик <strong>9–6 класса</strong>,
                        выполнил работу в рамках школьного проекта.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-cyan-600/10 p-3 ring-1 ring-cyan-600/20 dark:bg-cyan-500/10">
                      <GraduationCap className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Чему вы научитесь
                      </h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Поймёте базовые понятия безопасности, научитесь распознавать типичные
                        уязвимости и увидите, как их предотвращать.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* бейджи тем */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="gap-1" variant="secondary">
                    <Lock className="h-4 w-4" /> SQL Injection
                  </Badge>
                  <Badge className="gap-1" variant="secondary">
                    <Bug className="h-4 w-4" /> XSS
                  </Badge>
                  <Badge className="gap-1" variant="secondary">
                    <Search className="h-4 w-4" /> OSINT
                  </Badge>
                </div>
              </section>

              {/* Правая колонка */}
              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Содержание проекта
                  </h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Введение в угрозы и модели атак
                    </li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      Практические мини‑демо уязвимостей
                    </li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      Рекомендации и чек‑листы защиты
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-indigo-50 to-cyan-50 p-5 shadow-sm dark:border-slate-800 dark:from-indigo-950/40 dark:to-cyan-950/30">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Материалы разработаны исключительно для учебных целей. Не используйте полученные знания во вред —
                    этика и законность превыше всего.
                  </p>
                </div>
              </aside>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-6 border-t border-slate-200/60 p-8 dark:border-slate-800">
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              © 2025 Promaster Development. Все права защищены.
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="default" className="rounded-xl">
                <a href="#learn" aria-label="Перейти к материалам">Начать изучение</a>
              </Button>
              <Button asChild variant="secondary" className="rounded-xl">
                <a href="#contact" aria-label="Связаться с автором">Связаться с автором</a>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}