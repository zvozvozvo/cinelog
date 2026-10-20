import { useState } from "react";
import { supabase } from "../supabase";

function translateAuthError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Неверная электронная почта или пароль.";
  }
  if (message.includes("email not confirmed")) {
    return "Сначала подтверди электронную почту по ссылке из письма.";
  }
  if (message.includes("user already registered")) {
    return "Аккаунт с такой электронной почтой уже существует.";
  }
  if (message.includes("password") && message.includes("at least")) {
    return "Пароль слишком короткий.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Слишком много попыток. Подожди немного и попробуй снова.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Не удалось подключиться к серверу. Проверь интернет.";
  }

  return "Не удалось выполнить действие. Проверь данные и попробуй ещё раз.";
}

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setMessage(translateAuthError(error));
      } else {
        setMessage(
          "Регистрация выполнена. Проверь почту, если требуется подтверждение."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(translateAuthError(error));
      }
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6">
      <div className="w-full">
        <div className="mb-10">
          <div className="cine-mono text-[9px] uppercase tracking-[.18em] text-white/30">
            CineLog / Аккаунт
          </div>

          <h1 className="cine-serif mt-4 text-5xl tracking-[-.04em]">
            {isRegister ? "Создать аккаунт" : "С возвращением"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <input
              type="text"
              placeholder="Имя для отображения"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              className="w-full border-b border-white/15 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[var(--acid)]"
            />
          )}

          <input
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-b border-white/15 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[var(--acid)]"
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="w-full border-b border-white/15 bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[var(--acid)]"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full border border-[var(--acid)] px-5 py-3 cine-mono text-[9px] uppercase tracking-[.14em] text-[var(--acid)] transition-colors hover:bg-[var(--acid)] hover:text-black disabled:opacity-40"
          >
            {loading
              ? "Загрузка..."
              : isRegister
              ? "Создать аккаунт"
              : "Войти"}
          </button>
        </form>

        {message && (
          <p className="mt-5 cine-mono text-[9px] leading-5 text-white/45">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setIsRegister((value) => !value);
            setMessage("");
          }}
          className="mt-8 cine-mono text-[9px] uppercase tracking-[.12em] text-white/30 transition-colors hover:text-white"
        >
          {isRegister
            ? "Уже есть аккаунт? Войти"
            : "Впервые здесь? Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}