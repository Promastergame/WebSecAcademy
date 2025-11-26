import { Link } from 'react-router-dom';
import { Database, Code, Search, Shield, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModuleItem = {
  path: string;
  title: string;
  icon: any;
  description: string;
  status: 'available' | 'coming';
  color: string; // tailwind gradient classes suffix (from-... to-...)
};

const modules: ModuleItem[] = [
  {
    path: '/sql',
    title: 'SQL Injection',
    icon: Database,
    description: 'Изучите механизмы атак, классы инъекций и методы защиты',
    status: 'available',
    color: 'from-purple-500 to-purple-600',
  },
  {
    path: '/xss',
    title: 'Cross-Site Scripting',
    icon: Code,
    description: 'XSS атаки и защита веб-приложений',
    status: 'coming',
    color: 'from-orange-500 to-orange-600',
  },
  {
    path: '/osint',
    title: 'OSINT',
    icon: Search,
    description: 'Методы поиска и анализа открытых источников',
    status: 'coming',
    color: 'from-blue-500 to-blue-600',
  },
  // 👇 Новый модуль "О проекте"
  {
    path: '/about',
    title: 'О проекте',
    icon: Info,
    description: 'Информация о школьном проекте и разработчике',
    status: 'available',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl gradient-primary mb-6 animate-slide-up glow">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
            WebSec Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            обучение кибербезопасности: от теории до практических заданий с прогресс-трекингом
          </p>
        </div>
      </section>

      {/* Modules */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Модули обучения</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const isAvailable = module.status === 'available';
              const isAbout = module.path === '/about';

              return (
                <div
                  key={module.path}
                  className="glass-hover rounded-xl p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{module.title}</h3>
                        {!isAvailable && (
                          <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                            Скоро
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>

                  {isAvailable ? (
                    <Button asChild className="w-full gradient-primary">
                      <Link to={module.path}>
                        {isAbout ? 'Подробнее' : 'Начать обучение'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      В разработке
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">100%</div>
              <p className="text-sm text-muted-foreground">Практические задания</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10+</div>
              <p className="text-sm text-muted-foreground">Квизов с объяснениями</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">∞</div>
              <p className="text-sm text-muted-foreground">Сохранение прогресса</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
