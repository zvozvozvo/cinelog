import { supabase } from "../supabase";

export async function getUserMovies() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return [];
  }

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
    .order("added_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.tmdb_id,

    title: item.movies?.title || "",
    originalTitle: item.movies?.original_title || "",

    release_date:
      item.movies?.release_date || "",

    poster_path:
      item.movies?.poster_path || null,

    backdrop_path:
      item.movies?.backdrop_path || null,

    overview:
      item.movies?.overview || "",

    runtime:
      item.movies?.runtime || null,

    vote_average:
      item.movies?.vote_average || 0,

    genres:
      item.movies?.genres || [],

    director:
      item.movies?.director || "",

    status: item.status,

    personalRating:
      item.rating,

    youRating:
      item.rating,

    addedAt:
      item.added_at,

    userMovieId:
      item.id,
  }));
}