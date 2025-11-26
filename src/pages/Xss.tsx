import { Code, Construction } from 'lucide-react';

export default function Xss() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center space-y-6 animate-slide-up">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
          <Code className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold">Cross-Site Scripting (XSS)</h1>
        <div className="glass rounded-lg p-8 space-y-4">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Модуль находится в разработке</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Скоро здесь будет обучение по XSS атакам, методам эксплуатации и защите веб-приложений
          </p>
        </div>
      </div>
    </div>
  );
}
