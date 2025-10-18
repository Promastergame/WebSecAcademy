// data/sqlTasks.ts - ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЕ ЗАДАНИЯ
import { Task } from '@/types/sql';

export const easyTasks: Task[] = [
  {
    id: 'easy-1',
    title: '💥 Взломай форму входа',
    goal: 'Используй SQL-инъекцию чтобы обойти аутентификацию',
    type: 'hack',
    difficulty: 'easy',
    hint: 'Попробуй ввести admin\' -- в поле логина. Кавычка закрывает строку, OR 1=1 делает условие всегда истинным, а -- комментирует остаток запроса',
    checklist: [
      { id: 'e1-1', text: 'Найди уязвимую форму входа в симуляторе', completed: false },
      { id: 'e1-2', text: 'Используй payload: admin\' -- для обхода пароля', completed: false },
      { id: 'e1-3', text: 'Убедись, что получил доступ как администратор', completed: false },
      { id: 'e1-4', text: 'Зафиксируй успешную атаку в отчете', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 100,
    tags: ['взлом', 'аутентификация', 'sql-injection']
  },
  {
    id: 'easy-2',
    title: '🛡️ Почини уязвимый код',
    goal: 'Найди и исправь SQL-инъекцию в коде приложения',
    type: 'defense', 
    difficulty: 'easy',
    initialCode: `app.post('/login', (req, res) => {\n  const username = req.body.username;\n  const password = req.body.password;\n  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";\n  db.query(query, (err, result) => {\n    if (result.length > 0) {\n      res.send('Успешный вход!');\n    } else {\n      res.send('Ошибка входа');\n    }\n  });\n});`,
    solution: `app.post('/login', (req, res) => {\n  const username = req.body.username;\n  const password = req.body.password;\n  const query = "SELECT * FROM users WHERE username = ? AND password = ?";\n  db.query(query, [username, password], (err, result) => {\n    if (result.length > 0) {\n      res.send('Успешный вход!');\n    } else {\n      res.send('Ошибка входа');\n    }\n  });\n});`,
    hint: 'Замени конкатенацию строк на параметризованные запросы с плейсхолдерами ?',
    checklist: [
      { id: 'e2-1', text: 'Найди строку с конкатенацией пользовательского ввода', completed: false },
      { id: 'e2-2', text: 'Замени кавычки и плюсы на плейсхолдеры ?', completed: false },
      { id: 'e2-3', text: 'Добавь параметры как отдельный массив в db.query', completed: false },
      { id: 'e2-4', text: 'Протестируй исправленный код в симуляторе', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 150,
    tags: ['защита', 'код', 'параметризация']
  },
];

export const mediumTasks: Task[] = [
  {
    id: 'medium-1',
    title: '🔍 Утечка данных через UNION',
    goal: 'Используй UNION для извлечения скрытых данных из БД', 
    type: 'hack',
    difficulty: 'medium',
    hint: 'UNION требует одинаковое количество колонок. Начни с ORDER BY чтобы узнать количество колонок',
    checklist: [
      { id: 'm1-1', text: 'Определи количество колонок через ORDER BY', completed: false },
      { id: 'm1-2', text: 'Найди уязвимые колонки для вывода данных', completed: false },
      { id: 'm1-3', text: 'Используй UNION SELECT для извлечения имен таблиц', completed: false },
      { id: 'm1-4', text: 'Вытащи пароли или чувствительные данные', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 250,
    tags: ['union', 'data-leak', 'advanced']
  },
  {
    id: 'medium-2', 
    title: '⚔️ Битва с таймером',
    goal: 'Исправляй уязвимости быстрее, чем закончится время',
    type: 'defense',
    difficulty: 'medium', 
    hint: 'Сосредоточься на поиске конкатенации строк и замене на параметризованные запросы',
    checklist: [
      { id: 'm2-1', text: 'Заверши 1 уровень за 2 минуты', completed: false },
      { id: 'm2-2', text: 'Набери 500+ очков в битве кодов', completed: false },
      { id: 'm2-3', text: 'Исправь 3 разные уязвимости подряд', completed: false },
      { id: 'm2-4', text: 'Получи бонус за скорость', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 300,
    tags: ['speedrun', 'practice', 'game']
  },
];

export const hardTasks: Task[] = [
  {
    id: 'hard-1',
    title: '🎯 Слепая SQL-инъекция', 
    goal: 'Извлеки данные когда нет прямого вывода',
    type: 'hack',
    difficulty: 'hard',
    hint: 'Используй time-based атаки или анализируй различия в ответах при TRUE/FALSE условиях',
    checklist: [
      { id: 'h1-1', text: 'Определи возможность слепой инъекции', completed: false },
      { id: 'h1-2', text: 'Используй условные запросы для извлечения данных побитово', completed: false },
      { id: 'h1-3', text: 'Автоматизируй процесс извлечения', completed: false },
      { id: 'h1-4', text: 'Получи секретный ключ или пароль', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 500,
    tags: ['blind', 'advanced', 'expert']
  },
  {
    id: 'hard-2',
    title: '🏰 Полная защита приложения',
    goal: 'Реализуй многоуровневую систему защиты',
    type: 'defense',
    difficulty: 'hard',
    hint: 'Комбинируй параметризацию, валидацию ввода, WAF и минимальные привилегии БД',
    checklist: [
      { id: 'h2-1', text: 'Параметризуй все SQL-запросы', completed: false },
      { id: 'h2-2', text: 'Настрой валидацию входных данных', completed: false },
      { id: 'h2-3', text: 'Создай пользователя БД с минимальными правами', completed: false },
      { id: 'h2-4', text: 'Настрой мониторинг подозрительных запросов', completed: false },
    ],
    evidence: '',
    completed: false,
    xp: 600,
    tags: ['defense', 'security', 'expert']
  },
];