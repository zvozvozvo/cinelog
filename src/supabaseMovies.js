import { supabase } from "../supabase";
import { getPoster } from "./tmdb";

function parseGenres(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Older rows can store a comma-separated string instead of JSON.
  }
  return value.split(",").map((name) => name.trim()).filter(Boolean);
}

function genreNames(genres) {
  return parseGenres(genres)
    .map((genre) => typeof genre === "string" ? genre : genre?.name)
    .filter((name) => typeof name === "string" && name.trim())
    .map((name) => name.trim());
}

function imageUrl(path, size = "w500") {
  if (!path || typeof path !== "string") return null;
  const value = path.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("image.tmdb.org/")) return `https://${value}`;
  return getPoster(value.startsWith("/") ? value : `/${value}`, size);
}

export async function getUserMovies() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_movies")
    .select(`
      id,
      user_id,
      tmdb_id,
      status,
      rating,
      added_at,
      movies (
        tmdb_id,
        title,
        original_title,
        release_date,
        poster_path,
        backdrop_path,
        overview,
        runtime,
        vote_average,
        genres,
        director
      )
    `)
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => {
    const movie = item.movies || {};
    const releaseDate = movie.release_date || movie.releaseDate || "";
    const rawGenres = parseGenres(movie.genres ?? movie.genre);
    const names = genreNames(rawGenres);
    const posterPath = movie.poster_path || movie.poster || null;

    return {
      id: item.tmdb_id || movie.tmdb_id,
      title: movie.title || movie.original_title || "Без названия",
      originalTitle: movie.original_title || "",
      release_date: releaseDate,
      releaseDate,
      year: releaseDate.slice(0, 4) || movie.year || "",
      poster_path: posterPath,
      poster: imageUrl(posterPath),
      posterUrl: imageUrl(posterPath),
      backdrop_path: movie.backdrop_path || null,
      backdrop: imageUrl(movie.backdrop_path, "original"),
      overview: movie.overview || "",
      runtime: movie.runtime || null,
      vote_average: movie.vote_average || 0,
      genres: rawGenres,
      genre: names.join(", "),
      director: movie.director || "",
      status: item.status,
      personalRating: item.rating,
      youRating: item.rating,
      addedAt: item.added_at,
      added_at: item.added_at,
      userMovieId: item.id,
    };
  });
}
