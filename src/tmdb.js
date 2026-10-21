const rawToken = import.meta.env.VITE_TMDB_TOKEN;

const TMDB_TOKEN = rawToken?.trim().replace(/^Bearer\s+/i, "");
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbRequest(endpoint) {
  if (!TMDB_TOKEN) {
    throw new Error("TMDB_TOKEN не найден. Проверь переменные окружения Vercel или файл .env.");
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      Accept: "application/json",
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("TMDB вернул некорректный ответ. Попробуй ещё раз позже.");
  }

  if (!response.ok) {
    throw new Error(`TMDB_${response.status}: ${data.status_message || "Неизвестная ошибка сервиса"}`);
  }

  return data;
}

export async function searchMovies(query) {
  if (!query.trim()) return [];
  const data = await tmdbRequest(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=ru-RU&page=1`);
  return data.results || [];
}

export async function getMovie(id) {
  return tmdbRequest(`/movie/${encodeURIComponent(id)}?language=ru-RU&append_to_response=credits`);
}

export function getPoster(path, size = "w500") {
  if (!path || typeof path !== "string") return null;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return null;
  return `https://image.tmdb.org/t/p/${size}${value}`;
}

export function getBackdrop(path, size = "original") {
  if (!path || typeof path !== "string") return null;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/")) return null;
  return `https://image.tmdb.org/t/p/${size}${value}`;
}

export async function discoverMovies(options = {}) {
  const params = new URLSearchParams({ language: "ru-RU", include_adult: "false", sort_by: "popularity.desc", page: "1" });
  for (const [key, value] of Object.entries(options || {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const data = await tmdbRequest(`/discover/movie?${params.toString()}`);
  return data.results || [];
}

export async function getMovieRecommendations(id) {
  const data = await tmdbRequest(`/movie/${encodeURIComponent(id)}/recommendations?language=ru-RU&page=1`);
  return data.results || [];
}
