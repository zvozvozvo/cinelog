import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "../components/Navbar";
import AddMovieModal from "../components/AddMovieModal";
import Together from "../pages/Together";
import Home from "../pages/Home";
import Films from "../pages/Films";
import Watchlist from "../pages/Watchlist";
import Timeline from "../pages/Timeline";
import Statistics from "../pages/Statistics";
import Movie from "../pages/Movie";

import { getMovies, saveMovies } from "./storage";

export default function App() {
  const [movies, setMovies] = useState(getMovies);
  const [showAddMovie, setShowAddMovie] = useState(false);

  useEffect(() => {
    saveMovies(movies);
  }, [movies]);

  function openAddMovie() {
    setShowAddMovie(true);
  }

  function closeAddMovie() {
    setShowAddMovie(false);
  }

  function addMovie(movie) {
    setMovies((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(movie.id)
      );

      if (exists) {
        return current.map((item) =>
          String(item.id) === String(movie.id)
            ? movie
            : item
        );
      }

      return [movie, ...current];
    });

    closeAddMovie();
  }

  function updateMovie(id, changes) {
    setMovies((current) =>
      current.map((movie) =>
        String(movie.id) === String(id)
          ? {
              ...movie,
              ...changes,
            }
          : movie
      )
    );
  }

  function deleteMovie(id) {
    setMovies((current) =>
      current.filter(
        (movie) => String(movie.id) !== String(id)
      )
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--paper)]">
      <div className="cine-shell page-index">
        <Navbar onAddMovie={openAddMovie} />

        <div className="min-h-[calc(100vh-92px)]">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  movies={movies}
                  onAddMovie={openAddMovie}
                />
              }
            />

            <Route
              path="/films"
              element={
                <Films
                  movies={movies}
                  onAddMovie={openAddMovie}
                />
              }
            />

            <Route
              path="/watchlist"
              element={
                <Watchlist
                  movies={movies}
                  onAddMovie={openAddMovie}
                />
              }
            />

            <Route
              path="/timeline"
              element={<Timeline movies={movies} />}
            />

            <Route
              path="/statistics"
              element={<Statistics movies={movies} />}
            />

            <Route
              path="/movie/:id"
              element={
                <Movie
                  movies={movies}
                  onUpdateMovie={updateMovie}
                  onDeleteMovie={deleteMovie}
                />
              }
            />
          </Routes>
        </div>

        <footer className="cine-footer">
          <span>
            CineLog / Personal cinema archive
          </span>

          <span>
            2026 · TMDB powered
          </span>
        </footer>
      </div>

      {showAddMovie && (
        <AddMovieModal
          onClose={closeAddMovie}
          onAdd={addMovie}
        />
      )}
    </main>
  );
}
