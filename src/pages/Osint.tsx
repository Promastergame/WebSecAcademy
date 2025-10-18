import { Search, Construction } from 'lucide-react';

export default function Osint() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center space-y-6 animate-slide-up">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
          <Search className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold">OSINT</h1>
        <div className="glass rounded-lg p-8 space-y-4">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Модуль находится в разработке</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Скоро здесь будет обучение по методам поиска информации в открытых источниках и техникам разведки
          </p>
        </div>
      </div>
    </div>
  );
}
