const STORAGE_KEY = "cinelog_movies";

export function getMovies() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveMovies(movies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

export function addMovie(movie) {
  const movies = getMovies();

  const existing = movies.find((item) => item.id === movie.id);

  if (existing) {
    const updated = movies.map((item) =>
      item.id === movie.id ? movie : item
    );

    saveMovies(updated);

    return updated;
  }

  const updated = [movie, ...movies];

  saveMovies(updated);

  return updated;
}

export function removeMovie(id) {
  const movies = getMovies();

  const updated = movies.filter((movie) => movie.id !== id);

  saveMovies(updated);

  return updated;
}