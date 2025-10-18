// src/components/sql/VulnerableSite.tsx
import React, { useState } from "react";
import { Button } from "../ui/button"; // относительный путь под твою структуру
import { Lock, Unlock } from "lucide-react";

type VulnerableSiteProps = {
  onCompromised?: (method?: string) => void; // вызывается когда вход успешно обойден инъекцией
};

/**
 * Простая эмуляция «уязвимого бекенда» полностью на клиенте.
 * - Регистрация просто сохраняет имя в localStorage (для приветствия).
 * - Логин выполняет проверку так, словно на сервере собирается SQL через конкатенацию:
 *   "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
 * - Обычные креды не проходят (имитация неправильной базы).
 * - Только инъекции (например "admin' --" или "' OR '1'='1") обходят проверку.
 *
 * Всё — строго для обучения в песочнице.
 */
export default function VulnerableSite({ onCompromised }: VulnerableSiteProps) {
  const [regUser, setRegUser] = useState<string>(() => {
    try { return localStorage.getItem("vsite_user") || ""; } catch { return ""; }
  });
  const [regPass, setRegPass] = useState<string>("");
  const [loginUser, setLoginUser] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [compromised, setCompromised] = useState(false);

  const register = () => {
    if (!regUser) {
      setMessage("Введите ник для регистрации.");
      return;
    }
    try {
      localStorage.setItem("vsite_user", regUser);
      localStorage.setItem("vsite_pass", regPass || "12345"); // хранится чисто для визуала
    } catch {}
    setMessage(`Готово! Вы зарегистрированы как ${regUser}. Теперь попробуйте войти (вход обычным способом не сработает).`);
  };

  // Эмуляция «серверного» уязвимого подтверждения — НЕ НАСТОЯЩИЙ БЭКЕНД!
  const vulnerableLoginCheck = (u: string, p: string) => {
    // На сервере был бы такой запрос (строка):
    // SELECT * FROM users WHERE username = ' + u + ' AND password = ' + p
    // Мы симулируем результат: если пользователь ввёл инъекцию — считаем, что запрос вернул row
    const trimmed = u.trim();

    // 1) типичный bypass: admin' --  (закрывает строку и комментирует остальное)
    if (trimmed.includes("' --") || trimmed.includes("--")) return { ok: true, method: "bypass_comment" };

    // 2) OR '1'='1' pattern
    if (trimmed.toUpperCase().includes("OR '1'='1") || trimmed.toUpperCase().includes("OR 1=1")) return { ok: true, method: "always_true" };

    // 3) если обычный логин совпадает с сохранённой регистрацией — (мы намеренно НЕ даём проход по обычным creds to emulate challenge)
    const stored = (() => {
      try {
        return localStorage.getItem("vsite_user");
      } catch { return null; }
    })();

    // Преднамеренно не позволяем «обычным» логинам пройти — это учебная цель
    if (stored && u === stored && p === (localStorage.getItem("vsite_pass") || "")) {
      return { ok: false, method: "normal_blocked" };
    }

    return { ok: false, method: "no_match" };
  };

  const attemptLogin = () => {
    setMessage("");
    const res = vulnerableLoginCheck(loginUser, loginPass);

    if (res.ok) {
      setCompromised(true);
      setMessage("🎯 Успех: проверка обойдена (только в песочнице). Доступ открыт.");
      if (onCompromised) onCompromised(res.method);
    } else {
      // подсказка: покажем, что обычный логин блокируется
      if (res.method === "normal_blocked") {
        setMessage("Пароль/логин совпадают с регистрацией, но обычный вход намеренно заблокирован — подумай про SQL-инъекцию.");
      } else {
        setMessage("Ошибка входа. Подумай, можно ли «сломать» проверку через кавычки или OR.");
      }
    }
  };

  const resetSite = () => {
    try {
      localStorage.removeItem("vsite_user");
      localStorage.removeItem("vsite_pass");
    } catch {}
    setRegUser("");
    setRegPass("");
    setLoginUser("");
    setLoginPass("");
    setMessage("Сайт сброшен.");
    setCompromised(false);
  };

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-900 p-6 text-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="bg-yellow-500/10 p-1 rounded"><Lock className="h-4 w-4 text-yellow-300" /></span>
          Уязвимый учебный сайт (внутри приложения)
        </h3>
        <div className="text-sm text-gray-400">Учебная мишень • только в песочнице</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-300 mb-2">Регистрация (визуальная)</div>
          <input placeholder="ник" value={regUser} onChange={(e)=>setRegUser(e.target.value)} className="w-full mb-2 p-2 bg-gray-700 rounded" />
          <input placeholder="пароль (любой)" value={regPass} onChange={(e)=>setRegPass(e.target.value)} className="w-full mb-2 p-2 bg-gray-700 rounded" />
          <Button onClick={register} className="w-full">Зарегистрироваться</Button>
          <div className="text-xs text-gray-400 mt-2">Регистрация сохраняется в localStorage чисто для демонстрации.</div>
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-300 mb-2">Вход (уязвимый)</div>
          <input placeholder="логин" value={loginUser} onChange={(e)=>setLoginUser(e.target.value)} className="w-full mb-2 p-2 bg-gray-700 rounded" />
          <input placeholder="пароль" value={loginPass} onChange={(e)=>setLoginPass(e.target.value)} className="w-full mb-2 p-2 bg-gray-700 rounded" />
          <div className="flex gap-2">
            <Button onClick={attemptLogin} className="flex-1">Войти</Button>
            <Button onClick={resetSite} variant="outline">Сброс</Button>
          </div>
          <div className="text-xs text-gray-400 mt-2">Подсказка: обычный логин намеренно НЕ пропускается. Попробуй ввести <code>admin' --</code> или <code>' OR '1'='1</code> в логин.</div>
        </div>
      </div>

      <div className="p-3 bg-gray-800 rounded text-sm">
        <div className="mb-2"><strong>Статус:</strong> {compromised ? <span className="text-emerald-300">ВЗЛОМАНО</span> : <span className="text-rose-300">Не взломано</span>}</div>
        <div className="text-xs text-gray-300">{message}</div>
      </div>

      <div className="text-xs text-gray-500">Это локальная имитация сервера — логика проверки реализована клиентски только для обучения.</div>
    </div>
  );
}
