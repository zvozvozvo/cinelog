const rawToken = import.meta.env.VITE_TMDB_TOKEN;

const TMDB_TOKEN = rawToken
  ?.trim()
  .replace(/^Bearer\s+/i, "");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbRequest(endpoint) {
  if (!TMDB_TOKEN) {
    throw new Error(
      "TMDB token is missing. Check your environment settings."
    );
  }

  let response;

  try {
    response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to TMDB. Check your internet connection and try again."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("TMDB returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.status_message ||
        `TMDB request failed with status ${response.status}.`
    );
  }

  return data;
}

export async function searchMovies(query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const data = await tmdbRequest(
    `/search/movie?query=${encodeURIComponent(
      normalizedQuery
    )}&include_adult=false&language=ru-RU&page=1`
  );

  return data.results || [];
}

export async function getMovie(id) {
  return tmdbRequest(
    `/movie/${id}?language=ru-RU&append_to_response=credits`
  );
}

export function getPoster(path, size = "w500") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdrop(path, size = "original") {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${path}`;
}
